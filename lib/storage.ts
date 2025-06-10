'use client';

const STORAGE_KEYS = {
    THEME: 'todo_app_theme',
};

// Generic storage functions (simplified for theme only)
const storage = {
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
};

// Theme management (the only remaining storage functionality)
export const themeStorage = {
    get: (): string => storage.getSingle<string>(STORAGE_KEYS.THEME) || 'light',
    set: (theme: string): void => storage.setSingle(STORAGE_KEYS.THEME, theme),
};