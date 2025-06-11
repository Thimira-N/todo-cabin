'use client';

import React, { Suspense } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { LockKeyhole, Sparkles, Moon, Sun, LoaderCircle } from 'lucide-react';
import Loginform from './loginform';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function LoginPage() {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 relative overflow-hidden">
            {/*animated background*/}
            <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 flex items-center justify-center"
            >
                <div className="absolute -left-20 -top-20 w-72 h-72 bg-purple-500 dark:bg-purple-700 rounded-full mix-blend-multiply filter blur-3xl opacity-30 dark:opacity-60 animate-blob"></div>
                <div className="absolute right-0 -bottom-20 w-72 h-72 bg-blue-500 dark:bg-blue-700 rounded-full mix-blend-multiply filter blur-3xl opacity-30 dark:opacity-60 animate-blob animation-delay-2000"></div>
                <div className="absolute -right-20 top-1/3 w-72 h-72 bg-pink-200 dark:bg-pink-700 rounded-full mix-blend-multiply filter blur-3xl opacity-30 dark:opacity-60 animate-blob animation-delay-4000"></div>
            </motion.div>

            <div className="w-full max-w-md z-10">
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    <Card className="backdrop-blur-sm bg-gradient-to-r from-blue-50/80 to-purple-50/80 dark:from-slate-800/90 dark:to-slate-900/90 border border-gray-200/60 dark:border-slate-600/50 shadow-2xl dark:shadow-slate-900/50 overflow-hidden">
                        {/*theme toggle icon*/}
                        <div className="absolute top-4 right-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleTheme}
                                className="rounded-full"
                                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                            >
                                {theme === 'light' ? (
                                    <Sun className="h-5 w-5" />
                                ) : (
                                    <Moon className="h-5 w-5" />
                                )}
                            </Button>
                        </div>

                        {/*card header*/}
                        <CardHeader className="text-center space-y-4 relative">
                            <div className="absolute inset-0"></div>
                            <div className="relative z-10">
                                <motion.div
                                    initial={{ scale: 0.5 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                                    className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg"
                                >
                                    <LockKeyhole className="h-8 w-8 text-white" />
                                </motion.div>
                                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mt-4">
                                    Welcome Back
                                </CardTitle>
                                <CardDescription className="text-gray-600 dark:text-gray-300 mt-2">
                                    Sign in to access your team dashboard
                                </CardDescription>
                            </div>
                        </CardHeader>

                        <CardContent>
                            <Suspense fallback={
                                <div className="flex justify-center items-center h-40">
                                    <LoaderCircle className="h-8 w-8 animate-spin text-blue-600" />
                                </div>
                            }>
                                <Loginform />
                            </Suspense>

                            {/*tagline*/}
                            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-center gap-2 text-xs font-mono text-gray-500 dark:text-gray-400">
                                <span>Tidy tasks . Cozy logs . Teamwork that sticks.</span>
                            </div>
                        </CardContent>

                        {/*footer*/}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"></div>
                    </Card>
                </motion.div>

                {/*watermark with app version*/}
                <div className="mt-4 text-center text-xs text-gray-400 dark:text-gray-500 flex items-center justify-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    <span>ToDo Cabin v2.0</span>
                </div>
            </div>

            {/* Add global styles for the animated blobs */}
            <style jsx global>{`
                @keyframes blob {
                    0% {
                        transform: translate(0px, 0px) scale(1);
                    }
                    33% {
                        transform: translate(30px, -50px) scale(1.1);
                    }
                    66% {
                        transform: translate(-20px, 20px) scale(0.9);
                    }
                    100% {
                        transform: translate(0px, 0px) scale(1);
                    }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
            `}</style>
        </div>
    );
}