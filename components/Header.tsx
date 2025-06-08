"use client"

import { useState, useEffect } from 'react'
import { ChevronLeft, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HeaderProps {
    // isMobile: boolean;
    sidebarCollapsed: boolean;
    onToggleCollapse: () => void;
}

export function Header({ sidebarCollapsed, onToggleCollapse }: HeaderProps) {
    const [mounted, setMounted] = useState(false)
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        setMounted(true)
        const handleScroll = () => setScrolled(window.scrollY > 10)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    if (!mounted) return null

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ease-in-out border-b border-border/40
          ${scrolled
            ? 'bg-background/98 backdrop-blur-xl shadow-lg shadow-black/5'
            : 'bg-background/95 backdrop-blur-md'
        }
          supports-[backdrop-filter]:bg-background/60
        `}>
            <div className="flex h-14 items-center px-4 w-full">
                {/* Sidebar Toggle Button - Always visible but with adjusted spacing */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggleCollapse}
                    className="mr-2 sm:mr-4 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
                    aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    {sidebarCollapsed ? (
                        <Menu className="h-5 w-5" />
                    ) : (
                        <ChevronLeft className="h-5 w-5" />
                    )}
                </Button>

                {/* Logo/Branding - Optimized for all screen sizes */}
                <div className="flex items-center">
                    <div className="relative">
                        <span className={`
                            font-mono font-bold text-lg inline-block
                            transition-all duration-300
                            ${scrolled ? 'text-primary' : 'text-foreground'}
                        `}>
                            ToDo Cabin
                        </span>
                        <span className={`
                            font-mono text-xs ml-1 hidden lg:inline-block
                            transition-all duration-300
                            ${scrolled ? 'text-primary/80' : 'text-primary'}
                        `}>
                            Tidy tasks. Cozy logs. Teamwork that sticks.
                        </span>
                    </div>
                </div>

                {/* Flexible space - ensures logo stays centered when sidebar is toggled */}
                <div className="flex-1" />
            </div>

            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-background/5 to-transparent pointer-events-none" />
        </header>
    )
}