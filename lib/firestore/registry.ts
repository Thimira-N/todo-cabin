// registry.ts

import { firestore } from '../db';
import { RegistryEntry } from '@/types';

// Helper function with improved time formatting
const getFormattedTime = (): string => {
    const now = new Date();
    return now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
};

// Cache for frequently accessed data
const cache = new Map<string, RegistryEntry>();

export const registryService = {
    getAll: async (userId: string): Promise<RegistryEntry[]> => {
        try {
            const entries = await firestore.getWhere<RegistryEntry>('registry', 'userId', userId);
            entries.forEach(entry => cache.set(entry.id, entry));
            return entries;
        } catch (error) {
            console.error('Error fetching all registry entries:', error);
            throw new Error('Failed to load registry entries');
        }
    },

    update: async (entry: RegistryEntry): Promise<void> => {
        try {
            const existingEntry = await firestore.get<RegistryEntry>('registry', entry.id) || {};
            const updatedEntry = { ...existingEntry, ...entry };
            await firestore.set('registry', entry.id, updatedEntry);
            cache.set(entry.id, updatedEntry);
        } catch (error) {
            console.error('Error updating registry entry:', error);
            throw new Error('Failed to update entry');
        }
    },

    getByDateAndMember: async (date: string, memberId: string, userId: string): Promise<RegistryEntry | null> => {
        const entryId = `${date}-${memberId}`;

        // Check cache first
        if (cache.has(entryId)) {
            return cache.get(entryId)!;
        }

        try {
            // First try direct document access
            const directEntry = await firestore.get<RegistryEntry>('registry', entryId);
            if (directEntry) {
                cache.set(entryId, directEntry);
                return directEntry;
            }

            // Fallback to query if direct access fails
            const entries = await firestore.getWhere<RegistryEntry>(
                'registry',
                ['userId', 'date', 'memberId'],
                [userId, date, memberId]
            );

            const entry = entries[0] || null;
            if (entry) {
                cache.set(entryId, entry);
            }
            return entry;
        } catch (error) {
            console.error('Error fetching entry by date and member:', error);
            throw new Error('Failed to load registry entry');
        }
    },

    getEntriesForDate: async (date: string, userId: string): Promise<RegistryEntry[]> => {
        try {
            const entries = await firestore.getWhere<RegistryEntry>(
                'registry',
                ['userId', 'date'],
                [userId, date]
            );
            // Update cache with new entries
            entries.forEach(entry => cache.set(entry.id, entry));
            return entries;
        } catch (error) {
            console.error('Error fetching entries for date:', error);
            throw new Error('Failed to load entries for date');
        }
    },

    markIn: async (
        date: string,
        memberId: string,
        userId: string,
        memberName: string,
        markInTime?: string // Add optional parameter for existing time
    ): Promise<RegistryEntry> => {
        const currentTime = markInTime || getFormattedTime();
        const entryId = `${date}-${memberId}`;

        try {
            const existingEntry = await firestore.get<RegistryEntry>('registry', entryId) || {
                markOut: '',
                userId,
                memberId,
                memberName,
                date
            };

            const entry: RegistryEntry = {
                ...existingEntry,
                id: entryId,
                markIn: currentTime, // Use the provided time or current time
                userId,
                memberId,
                memberName,
                date
            };

            await firestore.set('registry', entryId, entry);
            cache.set(entryId, entry);
            return entry;
        } catch (error) {
            console.error('Error marking in:', error);
            throw new Error('Failed to mark in');
        }
    },

    markOut: async (date: string, memberId: string, userId: string, memberName: string): Promise<RegistryEntry> => {
        const currentTime = getFormattedTime();
        const entryId = `${date}-${memberId}`;

        try {
            const existingEntry = await firestore.get<RegistryEntry>('registry', entryId) || {
                markIn: '',
                userId,
                memberId,
                memberName,
                date
            };

            const entry: RegistryEntry = {
                ...existingEntry,
                id: entryId,
                markOut: currentTime,
                userId,
                memberId,
                memberName,
                date
            };

            await firestore.set('registry', entryId, entry);
            cache.set(entryId, entry);
            return entry;
        } catch (error) {
            console.error('Error marking out:', error);
            throw new Error('Failed to mark out');
        }
    },

    deleteAllForMember: async (memberId: string, userId: string): Promise<void> => {
        try {
            // Get all entries for this member
            const entries = await firestore.getWhere<RegistryEntry>(
                'registry',
                ['userId', 'memberId'],
                [userId, memberId]
            );

            // Delete each entry
            const deletePromises = entries.map(entry =>
                firestore.delete('registry', entry.id)
            );

            await Promise.all(deletePromises);

            // Clear cache for these entries
            entries.forEach(entry => cache.delete(entry.id));
        } catch (error) {
            console.error('Error deleting registry entries for member:', error);
            throw new Error('Failed to delete registry entries for member');
        }
    },

    // Clear cache if needed
    clearCache: (): void => {
        cache.clear();
    }
};