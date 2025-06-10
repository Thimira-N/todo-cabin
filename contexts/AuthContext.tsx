'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContextType, User } from '@/types';
import { authService } from '@/lib/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Firebase auth state observer
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // User is signed in
                const userData = await authService.getCurrentUser(firebaseUser.uid);
                setUser(userData);
            } else {
                // User is signed out
                setUser(null);
            }
            setLoading(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    const register = async (teamName: string, password: string): Promise<boolean> => {
        try {
            await authService.register(teamName, password);
            return true;
        } catch (error) {
            console.error('Registration error:', error);
            return false;
        }
    };

    const login = async (teamName: string, password: string): Promise<boolean> => {
        try {
            const success = await authService.login(teamName, password);
            if (success) {
                return true;
            }
            return false;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    };

    const logout = async () => {
        try {
            await authService.logout();
            setUser(null);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                register,
                logout,
                loading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}