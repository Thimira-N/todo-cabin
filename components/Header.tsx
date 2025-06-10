"use client"

import React, { useState, useEffect } from 'react'
import {ChevronLeft, LogOut, Menu, Moon, Sun} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from "@/lib/utils";
import { useTheme } from '@/contexts/ThemeContext';
import {useRouter} from "next/navigation";
import {useAuth} from "@/contexts/AuthContext";

interface HeaderProps {
    isMobile: boolean;
    sidebarCollapsed: boolean;
    onToggleCollapse: () => void;
}

export function Header({ sidebarCollapsed, onToggleCollapse }: HeaderProps) {
    const [mounted, setMounted] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const router = useRouter();
    const { logout } = useAuth();
    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        setMounted(true)
        const handleScroll = () => setScrolled(window.scrollY > 10)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    if (!mounted) return null

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    return (
        <header className={cn(
            "fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ease-in-out",
            "border-b border-border/40 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80",
            scrolled
                ? "bg-background/98 shadow-lg shadow-black/5 border-border/60"
                : "bg-background/95 border-border/30"
        )}>
            <div className="flex h-16 items-center justify-between px-4 lg:px-6 w-full">
                {/* Left Section - Sidebar Toggle & Logo */}
                <div className="flex items-center gap-3">
                    {/* Sidebar Toggle Button */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onToggleCollapse}
                        className={cn(
                            "p-2.5 rounded-xl transition-all duration-200",
                            "hover:bg-accent hover:scale-105 active:scale-95",
                            "border border-transparent hover:border-border/50"
                        )}
                        aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        {sidebarCollapsed ? (
                            <Menu className="h-5 w-5 text-foreground/80" />
                        ) : (
                            <ChevronLeft className="h-5 w-5 text-foreground/80" />
                        )}
                    </Button>

                    {/* Logo */}
                    <div className="flex items-center">
                        <div className="relative">
                            <div className="flex items-center gap-3">
                                {/* Logo Icon */}
                                <div className={cn(
                                    "w-8 h-8 rounded-lg bg-gradient-to-br transition-all duration-300",
                                    "from-primary to-primary/80 flex items-center justify-center shadow-md",
                                    scrolled && "shadow-lg scale-105"
                                )}>
                                    <span className="text-primary-foreground font-bold text-sm">TC</span>
                                </div>

                                {/* Brand Text */}
                                <div className="flex flex-col">
                                    <span className={cn(
                                        "font-bold text-lg leading-tight transition-all duration-300",
                                        scrolled ? "text-primary" : "text-foreground"
                                    )}>
                                        ToDo Cabin
                                    </span>
                                    <span className={cn(
                                        "font-medium text-xs leading-tight transition-all duration-300 hidden sm:block",
                                        scrolled ? "text-primary/70" : "text-muted-foreground"
                                    )}>
                                        Tidy tasks . Cozy logs . Teamwork that sticks.
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Flexible space */}
                <div className="flex-1" />

                {/* Right Section - Theme Toggle Only */}
                <div className="flex items-center">
                    {/* Theme Toggle Button */}
                    <Button
                        variant="ghost"
                        className={cn(
                            'w-50 justify-start gap-3 sm:gap-4 h-10 sm:h-12 transition-all duration-300 rounded-2xl relative overflow-hidden',
                            'hover:shadow-md hover:scale-[1.02] active:scale-[0.98]'
                        )}
                        onClick={toggleTheme}
                        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-100/0 to-blue-100/0 hover:from-yellow-100/30 hover:to-blue-100/30 dark:hover:from-yellow-900/20 dark:hover:to-blue-900/20 transition-all duration-300" />

                        <div className="relative flex items-center gap-3 sm:gap-4 w-full min-w-0">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-500 dark:from-blue-500 dark:to-purple-600 flex items-center justify-center shadow-lg transition-all duration-300 flex-shrink-0">
                                {theme === 'light' ? (
                                    <Moon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                                ) : (
                                    <Sun className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                                )}
                            </div>
                                <div className="flex-1 text-left min-w-0">
                                    <div className="font-semibold text-sm text-gray-700 dark:text-gray-300 truncate">
                                        {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                                        Switch theme
                                    </div>
                                </div>
                        </div>
                    </Button>

                    {/* Logout Button */}
                    <Button
                        variant="ghost"
                        className={cn(
                            'w-50 justify-start gap-3 sm:gap-4 h-10 sm:h-12 transition-all duration-300 rounded-2xl relative overflow-hidden',
                            'hover:shadow-md hover:scale-[1.02] active:scale-[0.98]',
                            'text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300'
                        )}
                        onClick={handleLogout}
                        aria-label="Sign out"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-red-50/0 to-pink-50/0 hover:from-red-50/50 hover:to-pink-50/50 dark:hover:from-red-900/20 dark:hover:to-pink-900/20 transition-all duration-300" />

                        <div className="relative flex items-center gap-3 sm:gap-4 w-full min-w-0">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-r from-red-500 to-pink-600 flex items-center justify-center shadow-lg transition-all duration-300 flex-shrink-0">
                                <LogOut className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                            </div>
                                <div className="flex-1 text-left min-w-0">
                                    <div className="font-semibold text-sm truncate">
                                        Sign Out
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                                        End session
                                    </div>
                                </div>
                        </div>
                    </Button>

                </div>
            </div>

            {/* Bottom Border Gradient */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

            {/* Subtle Background Glow */}
            <div className={cn(
                "absolute inset-0 bg-gradient-to-r from-transparent via-primary/[0.02] to-transparent",
                "pointer-events-none transition-opacity duration-300",
                scrolled ? "opacity-100" : "opacity-0"
            )} />
        </header>
    )
}