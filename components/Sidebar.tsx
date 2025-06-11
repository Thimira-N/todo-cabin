'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
// import { useTheme } from '@/contexts/ThemeContext';
import {
    BookOpen,
    CheckSquare,
    Clock,
    // LogOut,
    Menu,
    // Moon,
    // Sun,
    Users,
    // ChevronLeft,
    Sparkles,
    Activity,
    X,
} from 'lucide-react';
import {NameTag} from "@/components/nametag";

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

interface SidebarProps {
    collapsed: boolean;
    isMobile: boolean;
    isMobileOpen: boolean;
    setIsMobileOpen: (value: boolean) => void;
}

export default function Sidebar({
                                    collapsed,
                                    isMobile,
                                    isMobileOpen,
                                    setIsMobileOpen
                                }: SidebarProps) {
    const router = useRouter();
    const pathname = usePathname();
    // const { user, logout } = useAuth();
    // const { theme, toggleTheme } = useTheme();
    const { user } = useAuth();

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileOpen(false);
    }, [pathname, setIsMobileOpen]);

    // Handle escape key to close mobile menu
    useEffect(() => {
        const handleEscape = (e: { key: string; }) => {
            if (e.key === 'Escape' && isMobileOpen) {
                setIsMobileOpen(false);
            }
        };

        if (isMobileOpen) {
            document.addEventListener('keydown', handleEscape);
            return () => document.removeEventListener('keydown', handleEscape);
        }
    }, [isMobileOpen, setIsMobileOpen]);

    // const handleLogout = () => {
    //     logout();
    //     router.push('/login');
    // };

    const shouldShowContent = isMobile ? isMobileOpen : !collapsed;
    const sidebarWidth : 'w-80'|'w-24'|'w-72' = isMobile ? 'w-80' : (collapsed ? 'w-24' : 'w-72');

    return (
        <>
            {/* Mobile Menu Button */}
            {isMobile && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMobileOpen(!isMobileOpen)}
                    className="fixed top-4 left-4 z-50 p-2 rounded-xl bg-white dark:bg-gray-900 shadow-lg border border-gray-200 dark:border-gray-700"
                    aria-label={isMobileOpen ? 'Close menu' : 'Open menu'}
                >
                    {isMobileOpen ? (
                        <X className="h-5 w-5" />
                    ) : (
                        <Menu className="h-5 w-5" />
                    )}
                </Button>
            )}

            {/* Mobile backdrop overlay */}
            {isMobile && isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 transition-opacity duration-300"
                    onClick={() => setIsMobileOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar */}
            <div
                className={cn(
                    'fixed left-0 top-0 z-40 h-screen transition-all duration-300 ease-in-out',
                    'bg-gradient-to-b from-white via-slate-50 to-gray-100',
                    'dark:from-gray-900 dark:via-slate-900 dark:to-gray-800',
                    'border-r border-gray-200/60 dark:border-gray-700/60',
                    'shadow-2xl backdrop-blur-xl',
                    'overflow-hidden',
                    sidebarWidth,
                    isMobile && !isMobileOpen && '-translate-x-full',
                    isMobile && isMobileOpen && 'translate-x-0',
                    'pt-14'
                )}
            >
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none" />

                <div className="relative flex flex-col h-full overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200/60 dark:border-gray-700/60 overflow-hidden">
                        {shouldShowContent && (
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                                        <Users className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                                    </div>
                                    <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse" />
                                </div>
                                <div className="space-y-1 min-w-0 flex-1">
                                    <div className="font-bold text-gray-900 dark:text-white text-base sm:text-lg truncate">
                                        {user?.teamName || 'My Team'}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                        <Activity className="h-3 w-3 flex-shrink-0" />
                                        <span className="truncate">Online</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Mobile Close Button */}
                        {isMobile && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsMobileOpen(false)}
                                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 flex-shrink-0"
                                aria-label="Close menu"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        )}
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-3 sm:p-4 space-y-2 sm:space-y-3 overflow-y-auto overflow-x-hidden">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <div key={item.name} className="relative">
                                    <Button
                                        variant="ghost"
                                        className={cn(
                                            'w-full justify-start gap-3 sm:gap-4 h-12 sm:h-14 transition-all duration-300 rounded-2xl relative overflow-hidden',
                                            'hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]',
                                            collapsed && !shouldShowContent && 'px-2 sm:px-3 justify-center',
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

                                        <div className="relative flex items-center gap-3 sm:gap-4 w-full min-w-0">
                                            <div className={cn(
                                                'w-8 h-8 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center transition-all duration-300 flex-shrink-0',
                                                isActive
                                                    ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg`
                                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-gray-700'
                                            )}>
                                                <item.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                                            </div>

                                            {shouldShowContent && (
                                                <div className="flex-1 text-left min-w-0">
                                                    <div className={cn(
                                                        'font-semibold text-sm transition-colors duration-200 truncate',
                                                        isActive
                                                            ? 'text-gray-900 dark:text-white'
                                                            : 'text-gray-700 dark:text-gray-300'
                                                    )}>
                                                        {item.name}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                                                        {item.description}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Active indicator */}
                                        {isActive && shouldShowContent && (
                                            <div className={cn(
                                                'absolute right-2 w-1 sm:w-2 h-6 sm:h-8 rounded-full bg-gradient-to-b flex-shrink-0',
                                                item.gradient
                                            )} />
                                        )}
                                    </Button>

                                    {/* Tooltip for collapsed state on desktop */}
                                    {!isMobile && collapsed && (
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

                    {/* Footer */}
                    <div className="p-3 sm:p-4 border-t border-gray-200/60 dark:border-gray-700/60 space-y-2 sm:space-y-3 overflow-hidden">
                        {/*/!* Theme Toggle *!/*/}
                        {/*<Button*/}
                        {/*    variant="ghost"*/}
                        {/*    className={cn(*/}
                        {/*        'w-full justify-start gap-3 sm:gap-4 h-10 sm:h-12 transition-all duration-300 rounded-2xl relative overflow-hidden',*/}
                        {/*        'hover:shadow-md hover:scale-[1.02] active:scale-[0.98]',*/}
                        {/*        collapsed && !shouldShowContent && 'px-2 sm:px-3 justify-center'*/}
                        {/*    )}*/}
                        {/*    onClick={toggleTheme}*/}
                        {/*    aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}*/}
                        {/*>*/}
                        {/*    <div className="absolute inset-0 bg-gradient-to-r from-yellow-100/0 to-blue-100/0 hover:from-yellow-100/30 hover:to-blue-100/30 dark:hover:from-yellow-900/20 dark:hover:to-blue-900/20 transition-all duration-300" />*/}

                        {/*    <div className="relative flex items-center gap-3 sm:gap-4 w-full min-w-0">*/}
                        {/*        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-500 dark:from-blue-500 dark:to-purple-600 flex items-center justify-center shadow-lg transition-all duration-300 flex-shrink-0">*/}
                        {/*            {theme === 'light' ? (*/}
                        {/*                <Moon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />*/}
                        {/*            ) : (*/}
                        {/*                <Sun className="h-4 w-4 sm:h-5 sm:w-5 text-white" />*/}
                        {/*            )}*/}
                        {/*        </div>*/}
                        {/*        {shouldShowContent && (*/}
                        {/*            <div className="flex-1 text-left min-w-0">*/}
                        {/*                <div className="font-semibold text-sm text-gray-700 dark:text-gray-300 truncate">*/}
                        {/*                    {theme === 'light' ? 'Dark Mode' : 'Light Mode'}*/}
                        {/*                </div>*/}
                        {/*                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">*/}
                        {/*                    Switch theme*/}
                        {/*                </div>*/}
                        {/*            </div>*/}
                        {/*        )}*/}
                        {/*    </div>*/}
                        {/*</Button>*/}

                        {/*/!* Logout Button *!/*/}
                        {/*<Button*/}
                        {/*    variant="ghost"*/}
                        {/*    className={cn(*/}
                        {/*        'w-full justify-start gap-3 sm:gap-4 h-10 sm:h-12 transition-all duration-300 rounded-2xl relative overflow-hidden',*/}
                        {/*        'hover:shadow-md hover:scale-[1.02] active:scale-[0.98]',*/}
                        {/*        'text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300',*/}
                        {/*        collapsed && !shouldShowContent && 'px-2 sm:px-3 justify-center'*/}
                        {/*    )}*/}
                        {/*    onClick={handleLogout}*/}
                        {/*    aria-label="Sign out"*/}
                        {/*>*/}
                        {/*    <div className="absolute inset-0 bg-gradient-to-r from-red-50/0 to-pink-50/0 hover:from-red-50/50 hover:to-pink-50/50 dark:hover:from-red-900/20 dark:hover:to-pink-900/20 transition-all duration-300" />*/}

                        {/*    <div className="relative flex items-center gap-3 sm:gap-4 w-full min-w-0">*/}
                        {/*        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-r from-red-500 to-pink-600 flex items-center justify-center shadow-lg transition-all duration-300 flex-shrink-0">*/}
                        {/*            <LogOut className="h-4 w-4 sm:h-5 sm:w-5 text-white" />*/}
                        {/*        </div>*/}
                        {/*        {shouldShowContent && (*/}
                        {/*            <div className="flex-1 text-left min-w-0">*/}
                        {/*                <div className="font-semibold text-sm truncate">*/}
                        {/*                    Sign Out*/}
                        {/*                </div>*/}
                        {/*                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">*/}
                        {/*                    End session*/}
                        {/*                </div>*/}
                        {/*            </div>*/}
                        {/*        )}*/}
                        {/*    </div>*/}
                        {/*</Button>*/}

                        {/* User Info */}
                        {shouldShowContent && user && (
                            <div className="mt-3 sm:mt-4 p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <span className="text-white font-bold text-sm">
                                            {user.teamName?.charAt(0).toUpperCase() || 'U'}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                            {user.teamName}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                            <Sparkles className="h-3 w-3 flex-shrink-0" />
                                            <span className="truncate">Logged In</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {shouldShowContent && (
                        <div className="p-3 sm:p-4 border-t border-gray-200/60 dark:border-gray-700/60 space-y-2 sm:space-y-3 overflow-hidden">
                            <NameTag />
                        </div>
                    )}
                </div>
            </div>

            {/* Spacer for content to prevent overlap on desktop */}
            {!isMobile && (
                <div className={cn(
                    'transition-all duration-300 ease-in-out flex-shrink-0',
                    collapsed ? 'w-25' : 'w-72'
                )} />
            )}
        </>
    );
}