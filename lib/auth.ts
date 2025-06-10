import { auth } from './firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut
} from 'firebase/auth';
import { firestore } from './db';
import { User } from '@/types';

export const authService = {
    register: async (teamName: string, password: string): Promise<User> => {
        // Using teamName as email for simplicity (add validation)
        const email = `${teamName.replace(/\s+/g, '')}@todocabin.com`;

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;

        const newUser: User = {
            id: firebaseUser.uid,
            teamName,
            password: '', // Don't store password in Firestore in production
            createdAt: new Date()
        };

        await firestore.set('users', newUser.id, newUser);
        return newUser;
    },

    login: async (teamName: string, password: string): Promise<boolean> => {
        try {
            const email = `${teamName.replace(/\s+/g, '')}@todocabin.com`;
            await signInWithEmailAndPassword(auth, email, password);
            return true;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    },

    logout: async (): Promise<void> => {
        await signOut(auth);
    },

    getCurrentUser: async (userId: string): Promise<User | null> => {
        return await firestore.get<User>('users', userId);
    },

    // Optional: Check if team name is available
    isTeamNameAvailable: async (teamName: string): Promise<boolean> => {
        const users = await firestore.getWhere<User>('users', 'teamName', teamName);
        return users.length === 0;
    }
};