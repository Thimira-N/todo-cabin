'use client';

import React from 'react';
import Sidebar from './Sidebar';
import { cn } from '@/lib/utils';

interface LayoutProps {
    children: React.ReactNode;
    className?: string;
}

export default function Layout({ children, className }: LayoutProps) {
    return (
        <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
            <Sidebar />
            <main
                className={cn(
                    'flex-1 p-8 transition-all duration-300',
                    className
                )}
            >
                {children}
            </main>
        </div>
    );
}