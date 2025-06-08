'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { cn } from '@/lib/utils';
import { Header } from '@/components/Header';

interface LayoutProps {
    children: React.ReactNode;
    className?: string;
}

export default function Layout({ children, className }: LayoutProps) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Handle screen size changes
    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            const newIsMobile = width < 768;
            setIsMobile(newIsMobile);

            // Auto-collapse on mobile
            if (newIsMobile) {
                setSidebarCollapsed(true);
                setIsMobileOpen(false);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleToggleCollapse = () => {
        if (isMobile) {
            setIsMobileOpen(!isMobileOpen);
        } else {
            setSidebarCollapsed(!sidebarCollapsed);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
            <Header
                isMobile={isMobile}
                sidebarCollapsed={sidebarCollapsed}
                onToggleCollapse={handleToggleCollapse}
            />

            <div className="flex pt-14">
                <Sidebar
                    collapsed={sidebarCollapsed}
                    isMobile={isMobile}
                    isMobileOpen={isMobileOpen}
                    setIsMobileOpen={setIsMobileOpen}
                />

                <main className={cn(
                    'flex-1 p-8 transition-all duration-300',
                    className
                )}>
                    {children}
                </main>
            </div>
        </div>
    );
}