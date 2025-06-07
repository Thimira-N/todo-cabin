'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContextType, User } from '@/types';
import { userStorage, sessionStorage } from '@/lib/storage';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for existing session on mount
        const currentUser = sessionStorage.get();
        if (currentUser) {
            setUser(currentUser);
        }
        setLoading(false);
    }, []);

    const register = async (teamName: string, password: string): Promise<boolean> => {
        try {
            // Check if team name already exists
            const existingUser = userStorage.findByTeamName(teamName);
            if (existingUser) {
                return false;
            }

            // Create new user
            const newUser = userStorage.create(teamName, password);
            return true;
        } catch (error) {
            console.error('Registration error:', error);
            return false;
        }
    };

    const login = async (teamName: string, password: string): Promise<boolean> => {
        try {
            const user = userStorage.findByTeamName(teamName);
            if (user && user.password === password) {
                setUser(user);
                sessionStorage.set(user);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    };

    const logout = () => {
        setUser(null);
        sessionStorage.clear();
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