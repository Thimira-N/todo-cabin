'use client';

import { User, Member, RegistryEntry, TodoItem, MinuteTrackerEntry } from '@/types';

const STORAGE_KEYS = {
    USERS: 'todo_app_users',
    CURRENT_USER: 'todo_app_current_user',
    MEMBERS: 'todo_app_members',
    REGISTRY: 'todo_app_registry',
    TODOS: 'todo_app_todos',
    MINUTE_TRACKER: 'todo_app_minute_tracker',
    THEME: 'todo_app_theme',
};

// Generic storage functions
export const storage = {
    get: <T>(key: string): T[] => {
        if (typeof window === 'undefined') return [];
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    },

    set: <T>(key: string, data: T[]): void => {
        if (typeof window === 'undefined') return;
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
        }
    },

    getSingle: <T>(key: string): T | null => {
        if (typeof window === 'undefined') return null;
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch {
            return null;
        }
    },

    setSingle: <T>(key: string, data: T): void => {
        if (typeof window === 'undefined') return;
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
        }
    },

    remove: (key: string): void => {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(key);
    },
};

// User management
export const userStorage = {
    getAll: (): User[] => storage.get<User>(STORAGE_KEYS.USERS),
    save: (users: User[]): void => storage.set(STORAGE_KEYS.USERS, users),
    findByTeamName: (teamName: string): User | undefined => {
        const users = userStorage.getAll();
        return users.find(user => user.teamName.toLowerCase() === teamName.toLowerCase());
    },
    create: (teamName: string, password: string): User => {
        const users = userStorage.getAll();
        const newUser: User = {
            id: Date.now().toString(),
            teamName,
            password,
            createdAt: new Date(),
        };
        users.push(newUser);
        userStorage.save(users);
        return newUser;
    },
};

// Current user session
export const sessionStorage = {
    get: (): User | null => storage.getSingle<User>(STORAGE_KEYS.CURRENT_USER),
    set: (user: User): void => storage.setSingle(STORAGE_KEYS.CURRENT_USER, user),
    clear: (): void => storage.remove(STORAGE_KEYS.CURRENT_USER),
};

// Members management
export const memberStorage = {
    getAll: (userId: string): Member[] => {
        const members = storage.get<Member>(STORAGE_KEYS.MEMBERS);
        return members.filter(member => member.userId === userId);
    },
    save: (members: Member[]): void => storage.set(STORAGE_KEYS.MEMBERS, members),
    add: (name: string, userId: string): Member => {
        const allMembers = storage.get<Member>(STORAGE_KEYS.MEMBERS);
        const newMember: Member = {
            id: Date.now().toString(),
            name,
            userId,
            createdAt: new Date(),
        };
        allMembers.push(newMember);
        memberStorage.save(allMembers);
        return newMember;
    },
    delete: (memberId: string): void => {
        const allMembers = storage.get<Member>(STORAGE_KEYS.MEMBERS);
        const filteredMembers = allMembers.filter(member => member.id !== memberId);
        memberStorage.save(filteredMembers);
    },
};

// Registry management
export const registryStorage = {
    getAll: (userId: string): RegistryEntry[] => {
        const entries = storage.get<RegistryEntry>(STORAGE_KEYS.REGISTRY);
        return entries.filter(entry => entry.userId === userId);
    },
    save: (entries: RegistryEntry[]): void => storage.set(STORAGE_KEYS.REGISTRY, entries),
    update: (entry: RegistryEntry): void => {
        const allEntries = storage.get<RegistryEntry>(STORAGE_KEYS.REGISTRY);
        const index = allEntries.findIndex(e => e.id === entry.id);
        if (index >= 0) {
            allEntries[index] = entry;
        } else {
            allEntries.push(entry);
        }
        registryStorage.save(allEntries);
    },
    getByDateAndMember: (date: string, memberId: string, userId: string): RegistryEntry | undefined => {
        const entries = registryStorage.getAll(userId);
        return entries.find(entry => entry.date === date && entry.memberId === memberId);
    },
};

// Todo management
export const todoStorage = {
    getAll: (userId: string): TodoItem[] => {
        const todos = storage.get<TodoItem>(STORAGE_KEYS.TODOS);
        return todos.filter(todo => todo.userId === userId);
    },
    save: (todos: TodoItem[]): void => storage.set(STORAGE_KEYS.TODOS, todos),
    add: (todo: Omit<TodoItem, 'id' | 'createdAt'>): TodoItem => {
        const allTodos = storage.get<TodoItem>(STORAGE_KEYS.TODOS);
        const newTodo: TodoItem = {
            ...todo,
            id: Date.now().toString(),
            createdAt: new Date(),
        };
        allTodos.push(newTodo);
        todoStorage.save(allTodos);
        return newTodo;
    },
    update: (todo: TodoItem): void => {
        const allTodos = storage.get<TodoItem>(STORAGE_KEYS.TODOS);
        const index = allTodos.findIndex(t => t.id === todo.id);
        if (index >= 0) {
            allTodos[index] = todo;
            todoStorage.save(allTodos);
        }
    },
    delete: (todoId: string): void => {
        const allTodos = storage.get<TodoItem>(STORAGE_KEYS.TODOS);
        const filteredTodos = allTodos.filter(todo => todo.id !== todoId);
        todoStorage.save(filteredTodos);
    },
};

// Minute tracker management
export const minuteTrackerStorage = {
    getAll: (userId: string): MinuteTrackerEntry[] => {
        const entries = storage.get<MinuteTrackerEntry>(STORAGE_KEYS.MINUTE_TRACKER);
        return entries.filter(entry => entry.userId === userId);
    },
    save: (entries: MinuteTrackerEntry[]): void => storage.set(STORAGE_KEYS.MINUTE_TRACKER, entries),
    add: (entry: Omit<MinuteTrackerEntry, 'id' | 'createdAt'>): MinuteTrackerEntry => {
        const allEntries = storage.get<MinuteTrackerEntry>(STORAGE_KEYS.MINUTE_TRACKER);
        const newEntry: MinuteTrackerEntry = {
            ...entry,
            id: Date.now().toString(),
            createdAt: new Date(),
        };
        allEntries.push(newEntry);
        minuteTrackerStorage.save(allEntries);
        return newEntry;
    },
    update: (entry: MinuteTrackerEntry): void => {
        const allEntries = storage.get<MinuteTrackerEntry>(STORAGE_KEYS.MINUTE_TRACKER);
        const index = allEntries.findIndex(e => e.id === entry.id);
        if (index >= 0) {
            allEntries[index] = entry;
            minuteTrackerStorage.save(allEntries);
        }
    },
    delete: (entryId: string): void => {
        const allEntries = storage.get<MinuteTrackerEntry>(STORAGE_KEYS.MINUTE_TRACKER);
        const filteredEntries = allEntries.filter(entry => entry.id !== entryId);
        minuteTrackerStorage.save(filteredEntries);
    },
};

// Theme management
export const themeStorage = {
    get: (): string => storage.getSingle<string>(STORAGE_KEYS.THEME) || 'light',
    set: (theme: string): void => storage.setSingle(STORAGE_KEYS.THEME, theme),
};