import {
    collection,
    doc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import type { Review } from '../types';

/**
 * Fetch approved reviews for a product
 */
export async function getProductReviews(productId: string): Promise<Review[]> {
    try {
        const reviewsRef = collection(db, 'reviews');
        const q = query(reviewsRef, where('product_id', '==', productId));
        const snap = await getDocs(q);

        const reviews = snap.docs.map(d => ({ id: d.id, ...d.data() } as Review));
        // Return approved or unmoderated pending for backward compatibility
        const filtered = reviews.filter(r => r.status === 'approved' || !r.status);
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        return filtered;
    } catch (err) {
        console.error('Error fetching product reviews:', err);
        return [];
    }
}

/**
 * Submit a customer review with optional photo uploads to Firebase Storage
 */
export async function submitCustomerReview(
    productId: string,
    data: {
        customer_name: string;
        rating: number;
        comment: string;
        user_id?: string;
    },
    images: File[] = []
): Promise<string> {
    const uploadedUrls: string[] = [];

    for (const file of images) {
        const ext = file.name.split('.').pop() || 'jpg';
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
        const storageRef = ref(storage, `reviews/${productId}/${fileName}`);
        const snapshot = await uploadBytes(storageRef, file);
        const url = await getDownloadURL(snapshot.ref);
        uploadedUrls.push(url);
    }

    const reviewDoc = {
        product_id: productId,
        customer_name: data.customer_name,
        user_id: data.user_id || null,
        rating: data.rating,
        comment: data.comment,
        images: uploadedUrls,
        is_verified: true,
        status: 'approved', // Auto-approved for verified purchases or pending
        created_at: new Date().toISOString(),
        createdAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'reviews'), reviewDoc);
    return docRef.id;
}

/**
 * Admin: Fetch all reviews for moderation
 */
export async function getAllReviewsForAdmin(): Promise<Review[]> {
    try {
        const snap = await getDocs(collection(db, 'reviews'));
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Review));
        list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        return list;
    } catch (err) {
        console.error('Error getting admin reviews:', err);
        return [];
    }
}

/**
 * Admin: Update review status (approved, rejected)
 */
export async function updateReviewStatus(reviewId: string, status: 'approved' | 'rejected'): Promise<void> {
    await updateDoc(doc(db, 'reviews', reviewId), { status });
}

/**
 * Admin: Delete a review
 */
export async function deleteReview(reviewId: string): Promise<void> {
    await deleteDoc(doc(db, 'reviews', reviewId));
}
