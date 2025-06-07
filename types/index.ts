export interface User {
    id: string;
    teamName: string;
    password: string;
    createdAt: Date;
}

export interface Member {
    id: string;
    name: string;
    userId: string;
    createdAt: Date;
}

export interface RegistryEntry {
    id: string;
    memberId: string;
    date: string;
    markIn?: string;
    markOut?: string;
    userId: string;
}

export interface TodoItem {
    id: string;
    title: string;
    description?: string;
    completed: boolean;
    priority: 'low' | 'medium' | 'high';
    dueDate?: string;
    createdAt: Date;
    userId: string;
}

export interface MinuteTrackerEntry {
    id: string;
    date: string;
    members: string[];
    tasks: { [memberId: string]: string[] };
    userId: string;
    createdAt: Date;
}

export interface AuthContextType {
    user: User | null;
    login: (teamName: string, password: string) => Promise<boolean>;
    register: (teamName: string, password: string) => Promise<boolean>;
    logout: () => void;
    loading: boolean;
}