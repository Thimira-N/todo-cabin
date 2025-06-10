import { firestore } from '../db';
import { MinuteTrackerEntry } from '@/types';

export const minuteTrackerService = {
    getAll: async (userId: string): Promise<MinuteTrackerEntry[]> => {
        try {
            console.log('Fetching all entries for user:', userId);
            const entries = await firestore.getWhere<MinuteTrackerEntry>('minuteTracker', 'userId', userId);
            console.log('Found entries:', entries);
            return entries;
        } catch (error) {
            console.error('Error fetching entries:', error);
            return [];
        }
    },

    add: async (entry: Omit<MinuteTrackerEntry, 'id'>): Promise<MinuteTrackerEntry | null> => {
        try {
            const id = Date.now().toString();
            const newEntry: MinuteTrackerEntry = {
                ...entry,
                id,
                createdAt: new Date()
            };

            console.log('Adding new entry:', newEntry);
            await firestore.set('minuteTracker', id, {
                ...newEntry,
                createdAt: newEntry.createdAt.toISOString()
            });

            console.log('Entry added successfully');
            return newEntry;
        } catch (error) {
            console.error('Error adding entry:', error);
            return null;
        }
    },

    update: async (entry: MinuteTrackerEntry): Promise<void> => {
        await firestore.set('minuteTracker', entry.id, {
            ...entry,
            createdAt: entry.createdAt.toISOString()
        });
    },

    updateTasks: async (entryId: string, tasks: { [memberId: string]: string[] }): Promise<void> => {
        const entry = await firestore.get<MinuteTrackerEntry>('minuteTracker', entryId);
        if (entry) {
            await firestore.update('minuteTracker', entryId, { tasks });
        }
    },

    addTaskToMember: async (entryId: string, memberId: string, task: string): Promise<void> => {
        const entry = await firestore.get<MinuteTrackerEntry>('minuteTracker', entryId);
        if (entry) {
            const updatedTasks = { ...entry.tasks };
            if (!updatedTasks[memberId]) {
                updatedTasks[memberId] = [];
            }
            updatedTasks[memberId].push(task);
            await firestore.update('minuteTracker', entryId, { tasks: updatedTasks });
        }
    },

    removeTaskFromMember: async (entryId: string, memberId: string, taskIndex: number): Promise<void> => {
        const entry = await firestore.get<MinuteTrackerEntry>('minuteTracker', entryId);
        if (entry && entry.tasks[memberId] && entry.tasks[memberId].length > taskIndex) {
            const updatedTasks = { ...entry.tasks };
            updatedTasks[memberId].splice(taskIndex, 1);
            await firestore.update('minuteTracker', entryId, { tasks: updatedTasks });
        }
    },

    delete: async (entryId: string): Promise<void> => {
        await firestore.delete('minuteTracker', entryId);
    },

    getEntriesByMember: async (memberId: string, userId: string): Promise<MinuteTrackerEntry[]> => {
        const entries = await firestore.getWhere<MinuteTrackerEntry>('minuteTracker', 'userId', userId);
        return entries.filter(entry => entry.members.includes(memberId));
    },

    getRecentEntries: async (userId: string, limit: number = 5): Promise<MinuteTrackerEntry[]> => {
        const entries = await firestore.getWhere<MinuteTrackerEntry>('minuteTracker', 'userId', userId);
        return entries
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, limit);
    }
};