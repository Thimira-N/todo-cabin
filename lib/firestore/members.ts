import { firestore } from '../db';
import { Member } from '@/types';

export const memberService = {
    getAll: async (userId: string): Promise<Member[]> => {
        return await firestore.getWhere<Member>('members', 'userId', userId);
    },

    add: async (name: string, userId: string): Promise<Member> => {
        const id = Date.now().toString();
        const newMember: Member = {
            id,
            name,
            userId,
            createdAt: new Date()
        };
        await firestore.set('members', id, newMember);
        return newMember;
    },

    delete: async (memberId: string): Promise<void> => {
        await firestore.delete('members', memberId);
    }
};