"use client"

import React, { useState, useEffect } from 'react'
import {ChevronLeft, LogOut, Menu, Moon, Sun} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from "@/lib/utils";
import { useTheme } from '@/contexts/ThemeContext';
import {useRouter} from "next/navigation";
import {useAuth} from "@/contexts/AuthContext";
import { useMediaQuery } from '@/hooks/use-media-query';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface HeaderProps {
    isMobile: boolean;
    sidebarCollapsed: boolean;
    onToggleCollapse: () => void;
}

export function Header({ sidebarCollapsed, onToggleCollapse }: HeaderProps) {
    const [mounted, setMounted] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const [showLogoutDialog, setShowLogoutDialog] = useState(false)
    const router = useRouter();
    const { logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const isMobile = useMediaQuery('(max-width: 640px)'); // Add this hook

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

    const handleLogoutClick = () => {
        setShowLogoutDialog(true);
    };

    return (
        <>
            <header className={cn(
                "fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ease-in-out",
                "border-b border-border/40 backdrop-blur-xl supports-[backdrop-filter]:bg-background/10",
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
                    <div className="flex items-center gap-2">
                        {/* Theme Toggle Button - Mobile */}
                        {isMobile ? (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="w-10 h-10 rounded-2xl"
                                onClick={toggleTheme}
                                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                            >
                                {theme === 'light' ? (
                                    <Moon className="h-5 w-5" />
                                ) : (
                                    <Sun className="h-5 w-5" />
                                )}
                            </Button>
                        ) : (
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
                        )}

                        {/* Logout Button - Mobile */}
                        {isMobile ? (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="w-10 h-10 rounded-2xl text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                onClick={handleLogoutClick}
                                aria-label="Sign out"
                            >
                                <LogOut className="h-5 w-5" />
                            </Button>
                        ) : (
                            <Button
                                variant="ghost"
                                className={cn(
                                    'w-50 justify-start gap-3 sm:gap-4 h-10 sm:h-12 transition-all duration-300 rounded-2xl relative overflow-hidden',
                                    'hover:shadow-md hover:scale-[1.02] active:scale-[0.98]',
                                    'text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300'
                                )}
                                onClick={handleLogoutClick}
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
                        )}
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

            {/* Logout Confirmation Dialog */}
            {/*<AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>*/}
            {/*    <AlertDialogContent className={cn(*/}
            {/*        "border-0 p-0 overflow-hidden", // Remove default borders/padding*/}
            {/*        "bg-transparent", // Make container transparent*/}
            {/*        "shadow-[0_8px_32px_rgba(0,0,0,0.3)]", // Deeper shadow*/}
            {/*        "backdrop-blur-3xl", // Stronger blur*/}
            {/*        "rounded-2xl"*/}
            {/*    )}>*/}
            {/*        /!* Glass Background Layer *!/*/}
            {/*        <div className={cn(*/}
            {/*            "absolute inset-0 -z-10",*/}
            {/*            "bg-white/5 dark:bg-black/5", // Base transparency*/}
            {/*            "backdrop-blur-3xl", // Extra blur layer*/}
            {/*            "border border-white/20 dark:border-white/10", // Subtle border*/}
            {/*            "shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]" // Inner glow*/}
            {/*        )}/>*/}

            {/*        /!* Frosted Texture *!/*/}
            {/*        <div className={cn(*/}
            {/*            "absolute inset-0 -z-10",*/}
            {/*            "bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.1)_0%,_transparent_70%)]", // Subtle texture*/}
            {/*            "mix-blend-overlay" // Blend mode*/}
            {/*        )}/>*/}

            {/*        <div className={cn(*/}
            {/*            "p-6", // Inner padding*/}
            {/*            "bg-gradient-to-br from-white/15 to-white/5 dark:from-black/15 dark:to-black/10", // Gradient overlay*/}
            {/*            "backdrop-blur-md" // Additional blur*/}
            {/*        )}>*/}
            {/*            <AlertDialogHeader>*/}
            {/*                <AlertDialogTitle className={cn(*/}
            {/*                    "text-lg font-semibold",*/}
            {/*                    "text-foreground/90 dark:text-foreground/90",*/}
            {/*                    "drop-shadow-sm" // Text shadow for readability*/}
            {/*                )}>*/}
            {/*                    Confirm Sign Out*/}
            {/*                </AlertDialogTitle>*/}
            {/*                <AlertDialogDescription className={cn(*/}
            {/*                    "mt-2",*/}
            {/*                    "text-muted-foreground/80 dark:text-muted-foreground/70",*/}
            {/*                    "drop-shadow-sm" // Text shadow*/}
            {/*                )}>*/}
            {/*                    {`You'll need to sign in again to access your account.`}*/}
            {/*                </AlertDialogDescription>*/}
            {/*            </AlertDialogHeader>*/}

            {/*            <AlertDialogFooter className="mt-6 gap-3">*/}
            {/*                <AlertDialogCancel className={cn(*/}
            {/*                    "px-4 py-2 rounded-xl",*/}
            {/*                    "bg-transparent hover:bg-white/20 dark:hover:bg-black/20",*/}
            {/*                    "border border-white/30 dark:border-white/10",*/}
            {/*                    "text-foreground/80 hover:text-foreground",*/}
            {/*                    "transition-all duration-200 ease-out",*/}
            {/*                    "hover:shadow-[0_2px_10px_rgba(0,0,0,0.1)]",*/}
            {/*                    "active:scale-95"*/}
            {/*                )}>*/}
            {/*                    Cancel*/}
            {/*                </AlertDialogCancel>*/}

            {/*                <AlertDialogAction*/}
            {/*                    onClick={handleLogout}*/}
            {/*                    className={cn(*/}
            {/*                        "px-4 py-2 rounded-xl",*/}
            {/*                        "bg-gradient-to-br from-red-400/90 to-pink-500/90",*/}
            {/*                        "hover:from-red-400 hover:to-pink-500",*/}
            {/*                        "text-white font-medium",*/}
            {/*                        "border border-red-300/50 hover:border-red-300/70",*/}
            {/*                        "shadow-[0_2px_20px_rgba(255,90,90,0.3)]",*/}
            {/*                        "hover:shadow-[0_2px_25px_rgba(255,90,90,0.4)]",*/}
            {/*                        "transition-all duration-200 ease-out",*/}
            {/*                        "active:scale-95"*/}
            {/*                    )}*/}
            {/*                >*/}
            {/*                    Sign Out*/}
            {/*                </AlertDialogAction>*/}
            {/*            </AlertDialogFooter>*/}
            {/*        </div>*/}

            {/*        /!* Edge Glow Effect *!/*/}
            {/*        <div className={cn(*/}
            {/*            "absolute inset-0 -z-20 rounded-2xl",*/}
            {/*            "bg-[conic-gradient(from_230deg_at_50%_50%,transparent_0deg,#6366f130_55deg,transparent_360deg)]",*/}
            {/*            "opacity-30 animate-spin-slow",*/}
            {/*            "mix-blend-overlay"*/}
            {/*        )} style={{ animationDuration: '10s' }}/>*/}
            {/*    </AlertDialogContent>*/}
            {/*</AlertDialog>*/}

            <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
                <AlertDialogContent className={cn(
                        "z-50 transition-all duration-300 ease-in-out",
                        "border border-border/40 backdrop-blur-lg supports-[backdrop-filter]:bg-background/20",
                        // "bg-gradient-to-r from-blue-200/80 to-purple-200/80",
                    )}>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="font-extrabold text-xl bg-gradient-to-r from-blue-800 to-purple-800 bg-clip-text text-transparent dark:text-white/70">
                            Are you sure you want to sign out?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="font-semibold text-gray-800 dark:text-gray-400">
                            {`You'll need to sign in again to access your tasks and account.`}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleLogout}
                            className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
                        >
                            Sign Out
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

    </>

    )
}