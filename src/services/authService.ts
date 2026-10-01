import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    sendEmailVerification,
    updateProfile
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    collection,
    getDocs,
    addDoc,
    deleteDoc,
    query,
    orderBy,
    serverTimestamp
} from 'firebase/firestore';
import { auth, db } from './firebase';
import type { UserProfile, Address } from '../types';

/**
 * Register a new customer and store profile in Firestore users/{uid}
 */
export async function registerCustomer(
    email: string,
    password: string,
    fullName: string,
    phone?: string
): Promise<{ user: User; profile: UserProfile }> {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await updateProfile(user, { displayName: fullName });

    const [firstName = '', ...rest] = fullName.trim().split(' ');
    const lastName = rest.join(' ');

    const profileData: UserProfile = {
        uid: user.uid,
        email: user.email || email,
        fullName,
        firstName,
        lastName,
        phone: phone || '',
        role: 'customer',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };

    await setDoc(doc(db, 'users', user.uid), {
        ...profileData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    });

    try {
        await sendEmailVerification(user);
    } catch (e) {
        console.warn('Could not send verification email immediately:', e);
    }

    return { user, profile: profileData };
}

/**
 * Sign in existing customer
 */
export async function loginCustomer(email: string, password: string): Promise<User> {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
}

/**
 * Sign out current user
 */
export async function logoutUser(): Promise<void> {
    await signOut(auth);
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
}

/**
 * Send email verification to current user
 */
export async function sendUserEmailVerification(): Promise<void> {
    if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
    }
}

/**
 * Fetch user profile from Firestore users/{uid}
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
        const snap = await getDoc(doc(db, 'users', uid));
        if (snap.exists()) {
            return snap.data() as UserProfile;
        }
        return null;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return null;
    }
}

/**
 * Update user profile in Firestore
 */
export async function updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
    await updateDoc(doc(db, 'users', uid), {
        ...data,
        updatedAt: serverTimestamp(),
        updated_at: new Date().toISOString()
    });
}

/**
 * Check if the user has an admin role either via custom claim or Firestore user doc
 */
export async function checkIsAdmin(user: User | null): Promise<boolean> {
    if (!user) return false;
    try {
        const tokenResult = await user.getIdTokenResult(true);
        if (tokenResult.claims.role === 'admin' || tokenResult.claims.role === 'superadmin') {
            return true;
        }
        // Fallback check against Firestore profile
        const profile = await getUserProfile(user.uid);
        return profile?.role === 'admin' || profile?.role === 'superadmin';
    } catch (err) {
        console.error('Error checking admin claim:', err);
        return false;
    }
}

/**
 * Fetch customer addresses from users/{uid}/addresses
 */
export async function getUserAddresses(uid: string): Promise<Address[]> {
    try {
        const addressesRef = collection(db, 'users', uid, 'addresses');
        const q = query(addressesRef, orderBy('created_at', 'desc'));
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as Address));
    } catch (e) {
        console.error('Error getting addresses:', e);
        return [];
    }
}

/**
 * Add a new address to customer addresses
 */
export async function addUserAddress(uid: string, address: Omit<Address, 'id'>): Promise<string> {
    const addressesRef = collection(db, 'users', uid, 'addresses');
    
    // If setting as default, unset other defaults
    if (address.isDefault) {
        const existing = await getUserAddresses(uid);
        for (const addr of existing) {
            if (addr.isDefault) {
                await updateDoc(doc(db, 'users', uid, 'addresses', addr.id), { isDefault: false });
            }
        }
    }

    const docRef = await addDoc(addressesRef, {
        ...address,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    });
    return docRef.id;
}

/**
 * Update an existing address
 */
export async function updateUserAddress(uid: string, addressId: string, address: Partial<Address>): Promise<void> {
    if (address.isDefault) {
        const existing = await getUserAddresses(uid);
        for (const addr of existing) {
            if (addr.id !== addressId && addr.isDefault) {
                await updateDoc(doc(db, 'users', uid, 'addresses', addr.id), { isDefault: false });
            }
        }
    }

    await updateDoc(doc(db, 'users', uid, 'addresses', addressId), {
        ...address,
        updated_at: new Date().toISOString()
    });
}

/**
 * Delete an address
 */
export async function deleteUserAddress(uid: string, addressId: string): Promise<void> {
    await deleteDoc(doc(db, 'users', uid, 'addresses', addressId));
}
