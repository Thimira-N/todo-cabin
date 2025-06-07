'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import {
    BookOpen,
    CheckSquare,
    Clock,
    LogOut,
    Menu,
    Moon,
    Sun,
    Users,
    ChevronLeft,
    Sparkles,
    Activity,
} from 'lucide-react';

const navigation = [
    {
        name: 'Registry',
        href: '/registry',
        icon: BookOpen,
        gradient: 'from-blue-500 to-cyan-500',
        description: 'Track attendance',
    },
    {
        name: 'To-Do',
        href: '/todo',
        icon: CheckSquare,
        gradient: 'from-purple-500 to-pink-500',
        description: 'Manage tasks',
    },
    {
        name: 'Minute Tracker',
        href: '/minute-tracker',
        icon: Clock,
        gradient: 'from-green-500 to-teal-500',
        description: 'Time tracking',
    },
];

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    const shouldShowContent = !collapsed || isHovered;

    return (
        <>
            {/* Backdrop overlay for mobile */}
            {isHovered && collapsed && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
                    onClick={() => setIsHovered(false)}
                />
            )}

            <div
                className={cn(
                    'fixed left-0 top-0 z-40 h-screen transition-all duration-300 ease-in-out',
                    'bg-gradient-to-b from-white via-slate-50 to-gray-100',
                    'dark:from-gray-900 dark:via-slate-900 dark:to-gray-800',
                    'border-r border-gray-200/60 dark:border-gray-700/60',
                    'shadow-2xl backdrop-blur-xl',
                    collapsed ? 'w-20' : 'w-72',
                    isHovered && collapsed && 'w-72'
                )}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none" />

                <div className="relative flex flex-col h-full">
                    {/* Enhanced Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200/60 dark:border-gray-700/60">
                        {shouldShowContent && (
                            <div className="flex items-center gap-3 group">
                                <div className="relative">
                                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                        <Users className="h-5 w-5 text-white" />
                                    </div>
                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse" />
                                </div>
                                <div className="space-y-1">
                                    <div className="font-bold text-gray-900 dark:text-white text-lg">
                                        {user?.teamName || 'My Team'}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                        <Activity className="h-3 w-3" />
                                        Online
                                    </div>
                                </div>
                            </div>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCollapsed(!collapsed)}
                            className={cn(
                                'p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200',
                                collapsed && !isHovered && 'mx-auto'
                            )}
                        >
                            {collapsed && !isHovered ? (
                                <Menu className="h-5 w-5" />
                            ) : (
                                <ChevronLeft className={cn('h-5 w-5 transition-transform duration-200', collapsed && 'rotate-180')} />
                            )}
                        </Button>
                    </div>

                    {/* Enhanced Navigation */}
                    <nav className="flex-1 p-4 space-y-3">
                        {navigation.map((item, index) => {
                            const isActive = pathname === item.href;
                            return (
                                <div key={item.name} className="relative group">
                                    <Button
                                        variant="ghost"
                                        className={cn(
                                            'w-full justify-start gap-4 h-14 transition-all duration-300 rounded-2xl relative overflow-hidden',
                                            'hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]',
                                            collapsed && !shouldShowContent && 'px-3 justify-center',
                                            isActive && 'shadow-lg'
                                        )}
                                        onClick={() => router.push(item.href)}
                                    >
                                        {/* Active background */}
                                        {isActive && (
                                            <div className={cn(
                                                'absolute inset-0 bg-gradient-to-r opacity-10',
                                                item.gradient
                                            )} />
                                        )}

                                        {/* Hover background */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-gray-100/0 to-gray-100/0 hover:from-gray-100/50 hover:to-gray-50/50 dark:hover:from-gray-800/50 dark:hover:to-gray-700/50 transition-all duration-300" />

                                        <div className="relative flex items-center gap-4 w-full">
                                            <div className={cn(
                                                'w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300',
                                                isActive
                                                    ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg`
                                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-gray-700'
                                            )}>
                                                <item.icon className="h-5 w-5" />
                                            </div>

                                            {shouldShowContent && (
                                                <div className="flex-1 text-left">
                                                    <div className={cn(
                                                        'font-semibold text-sm transition-colors duration-200',
                                                        isActive
                                                            ? 'text-gray-900 dark:text-white'
                                                            : 'text-gray-700 dark:text-gray-300'
                                                    )}>
                                                        {item.name}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                        {item.description}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Active indicator */}
                                        {isActive && (
                                            <div className={cn(
                                                'absolute right-2 w-2 h-8 rounded-full bg-gradient-to-b',
                                                item.gradient
                                            )} />
                                        )}
                                    </Button>

                                    {/* Tooltip for collapsed state */}
                                    {collapsed && !isHovered && (
                                        <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                                            <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap shadow-lg">
                                                {item.name}
                                                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 dark:bg-gray-100 rotate-45" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </nav>

                    {/* Enhanced Footer */}
                    <div className="p-4 border-t border-gray-200/60 dark:border-gray-700/60 space-y-3">
                        {/* Theme Toggle */}
                        <Button
                            variant="ghost"
                            className={cn(
                                'w-full justify-start gap-4 h-12 transition-all duration-300 rounded-2xl relative overflow-hidden',
                                'hover:shadow-md hover:scale-[1.02] active:scale-[0.98]',
                                collapsed && !shouldShowContent && 'px-3 justify-center'
                            )}
                            onClick={toggleTheme}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-yellow-100/0 to-blue-100/0 hover:from-yellow-100/30 hover:to-blue-100/30 dark:hover:from-yellow-900/20 dark:hover:to-blue-900/20 transition-all duration-300" />

                            <div className="relative flex items-center gap-4 w-full">
                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-500 dark:from-blue-500 dark:to-purple-600 flex items-center justify-center shadow-lg transition-all duration-300">
                                    {theme === 'light' ? (
                                        <Moon className="h-5 w-5 text-white" />
                                    ) : (
                                        <Sun className="h-5 w-5 text-white" />
                                    )}
                                </div>
                                {shouldShowContent && (
                                    <div className="flex-1 text-left">
                                        <div className="font-semibold text-sm text-gray-700 dark:text-gray-300">
                                            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                            Switch theme
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Button>

                        {/* Logout Button */}
                        <Button
                            variant="ghost"
                            className={cn(
                                'w-full justify-start gap-4 h-12 transition-all duration-300 rounded-2xl relative overflow-hidden',
                                'hover:shadow-md hover:scale-[1.02] active:scale-[0.98]',
                                'text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300',
                                collapsed && !shouldShowContent && 'px-3 justify-center'
                            )}
                            onClick={handleLogout}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-red-50/0 to-pink-50/0 hover:from-red-50/50 hover:to-pink-50/50 dark:hover:from-red-900/20 dark:hover:to-pink-900/20 transition-all duration-300" />

                            <div className="relative flex items-center gap-4 w-full">
                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-red-500 to-pink-600 flex items-center justify-center shadow-lg transition-all duration-300">
                                    <LogOut className="h-5 w-5 text-white" />
                                </div>
                                {shouldShowContent && (
                                    <div className="flex-1 text-left">
                                        <div className="font-semibold text-sm">
                                            Sign Out
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                            End session
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Button>

                        {/* User Info */}
                        {shouldShowContent && user && (
                            <div className="mt-4 p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {user.teamName?.charAt(0).toUpperCase() || 'XOXO'}
                    </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                            {user.teamName}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                            <Sparkles className="h-3 w-3" />
                                            Logged In
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}