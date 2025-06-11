'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Sparkles, Users, Moon, Sun, LoaderCircle, Check, X } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';

// Password requirement type
type PasswordRequirement = {
    text: string;
    validator: (password: string) => boolean;
};

export default function RegisterPage() {
    const [teamName, setTeamName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
    const { theme, toggleTheme } = useTheme();

    const { register } = useAuth();
    const router = useRouter();

    // Password requirements
    const passwordRequirements: PasswordRequirement[] = [
        {
            text: 'At least 8 characters',
            validator: (pwd) => pwd.length >= 8
        },
        {
            text: 'At least one uppercase letter',
            validator: (pwd) => /[A-Z]/.test(pwd)
        },
        {
            text: 'At least one lowercase letter',
            validator: (pwd) => /[a-z]/.test(pwd)
        },
        {
            text: 'At least one number',
            validator: (pwd) => /[0-9]/.test(pwd)
        },
        {
            text: 'At least one special character',
            validator: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
        }
    ];

    // Validate password against all requirements
    const validatePassword = (pwd: string): string[] => {
        return passwordRequirements
            .filter(req => !req.validator(pwd))
            .map(req => req.text);
    };

    // Check if password meets all requirements
    const isPasswordValid = (pwd: string): boolean => {
        return passwordRequirements.every(req => req.validator(pwd));
    };

    // Update password errors when password changes
    useEffect(() => {
        if (password) {
            setPasswordErrors(validatePassword(password));
        } else {
            setPasswordErrors([]);
        }
    }, [password]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Basic validations
        if (!teamName.trim() || !password || !confirmPassword) {
            setError('All fields are required');
            return;
        }

        if (teamName.trim().length < 3 || teamName.trim().length > 50) {
            setError('Team name must be between 3 and 50 characters');
            return;
        }

        if (!isPasswordValid(password)) {
            setError('Password does not meet all requirements');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        const success = await register(teamName.trim(), password);

        if (success) {
            router.push('/login?registered=true');
        } else {
            setError('Team name already exists. Please choose a different name.');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 relative overflow-hidden">
            {/* Animated background */}
            <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 flex items-center justify-center"
            >
                <div className="absolute -left-20 -top-20 w-72 h-72 bg-purple-500 dark:bg-purple-700 rounded-full mix-blend-multiply filter blur-3xl opacity-30 dark:opacity-20 animate-blob"></div>
                <div className="absolute right-0 -bottom-20 w-72 h-72 bg-blue-500 dark:bg-blue-700 rounded-full mix-blend-multiply filter blur-3xl opacity-30 dark:opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute -right-20 top-1/3 w-72 h-72 bg-pink-200 dark:bg-pink-700 rounded-full mix-blend-multiply filter blur-3xl opacity-30 dark:opacity-20 animate-blob animation-delay-4000"></div>
            </motion.div>

            <div className="w-full max-w-md z-10">
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    <Card className="backdrop-blur-sm bg-gradient-to-r from-blue-50/80 to-purple-50/80 dark:from-slate-800/90 dark:to-slate-900/90 border border-gray-200/60 dark:border-slate-600/50 shadow-2xl dark:shadow-slate-900/50 overflow-hidden">
                        {/* Theme toggle icon */}
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

                        {/* Card header with animated gradient */}
                        <CardHeader className="text-center space-y-4 relative">
                            <div className="absolute inset-0"></div>
                            <div className="relative z-10">
                                <motion.div
                                    initial={{ scale: 0.9 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                                    className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg"
                                >
                                    <Users className="h-8 w-8 text-white" />
                                </motion.div>
                                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mt-4">
                                    Create Your Team
                                </CardTitle>
                                <CardDescription className="text-gray-600 dark:text-gray-300 mt-2">
                                    Register a new team account to get started
                                </CardDescription>
                            </div>
                        </CardHeader>

                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Alert variant="destructive">
                                            <AlertDescription>{error}</AlertDescription>
                                        </Alert>
                                    </motion.div>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="teamName" className="text-sm font-medium">
                                        Team Name
                                    </Label>
                                    <Input
                                        id="teamName"
                                        type="text"
                                        value={teamName}
                                        onChange={(e) => setTeamName(e.target.value)}
                                        placeholder="Enter your team name"
                                        className="h-12 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Must be unique and 3-50 characters long
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-sm font-medium">
                                        Password
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Create a password (min 8 characters)"
                                            className="h-12 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500 pr-12"
                                            required
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                                            onClick={() => setShowPassword(!showPassword)}
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>

                                    {/* Password requirements */}
                                    <div className="mt-2 space-y-1">
                                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                            Password must contain:
                                        </p>
                                        <ul className="space-y-1">
                                            {passwordRequirements.map((req, index) => {
                                                const isValid = req.validator(password);
                                                return (
                                                    <li key={index} className="flex items-center gap-2">
                                                        {isValid ? (
                                                            <Check className="h-3 w-3 text-green-500" />
                                                        ) : (
                                                            <X className="h-3 w-3 text-red-500" />
                                                        )}
                                                        <span className={`text-xs ${isValid ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                                            {req.text}
                                                        </span>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword" className="text-sm font-medium">
                                        Confirm Password
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="confirmPassword"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Confirm your password"
                                            className="h-12 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500 pr-12"
                                            required
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                                    <Button
                                        type="submit"
                                        className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                                        disabled={loading || passwordErrors.length > 0}
                                    >
                                        {loading ? (
                                            <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
                                        ) : (
                                            <Sparkles className="h-4 w-4 mr-2" />
                                        )}
                                        {loading ? 'Creating Account...' : 'Create Team Account'}
                                    </Button>
                                </motion.div>
                            </form>

                            <div className="mt-6 pt-6">
                                <div className="text-center">
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        Already have an account?{' '}
                                        <Link
                                            href="/login"
                                            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                        >
                                            Sign in here
                                        </Link>
                                    </p>
                                </div>

                                {/* Security info */}
                                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400 pt-6 border-t border-gray-200 dark:border-gray-700">
                                    <span>Tidy tasks . Cozy logs . Teamwork that sticks.</span>
                                </div>
                            </div>
                        </CardContent>

                        {/* Footer with decorative element */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"></div>
                    </Card>
                </motion.div>

                {/* App version/watermark */}
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