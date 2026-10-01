import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from '../services/firebase';
import {
    getUserProfile,
    loginCustomer,
    registerCustomer,
    logoutUser,
    checkIsAdmin
} from '../services/authService';
import type { UserProfile } from '../types';

interface AuthContextType {
    user: User | null;
    profile: UserProfile | null;
    isAdmin: boolean;
    loading: boolean;
    signIn: typeof loginCustomer;
    signUp: typeof registerCustomer;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    const loadUserProfile = async (currentUser: User) => {
        try {
            const [userProfile, adminStatus] = await Promise.all([
                getUserProfile(currentUser.uid),
                checkIsAdmin(currentUser)
            ]);
            setProfile(userProfile);
            setIsAdmin(adminStatus);
        } catch (error) {
            console.error('Error loading user profile:', error);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                await loadUserProfile(currentUser);
            } else {
                setProfile(null);
                setIsAdmin(false);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const refreshProfile = async () => {
        if (auth.currentUser) {
            await loadUserProfile(auth.currentUser);
        }
    };

    const handleSignOut = async () => {
        await logoutUser();
        setUser(null);
        setProfile(null);
        setIsAdmin(false);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                profile,
                isAdmin,
                loading,
                signIn: loginCustomer,
                signUp: registerCustomer,
                signOut: handleSignOut,
                refreshProfile
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
