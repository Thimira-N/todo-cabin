import { firestore } from '../db';
import { TodoItem } from '@/types';

export const todoService = {
    getAll: async (userId: string): Promise<TodoItem[]> => {
        return await firestore.getWhere<TodoItem>('todos', 'userId', userId);
    },

    add: async (todo: Omit<TodoItem, 'id' | 'createdAt'>): Promise<TodoItem> => {
        const id = Date.now().toString();
        const newTodo: TodoItem = {
            ...todo,
            id,
            createdAt: new Date()
        };
        await firestore.set('todos', id, newTodo);
        return newTodo;
    },

    update: async (todo: TodoItem): Promise<void> => {
        await firestore.set('todos', todo.id, todo);
    },

    delete: async (todoId: string): Promise<void> => {
        await firestore.delete('todos', todoId);
    }
};