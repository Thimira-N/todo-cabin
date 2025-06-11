'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import {
    CheckCircle,
    Eye,
    EyeOff,
    Loader2,
    AlertTriangle,
    Users,
    KeyRound
} from 'lucide-react';
import Link from 'next/link';

interface LoginFormProps {
    onSuccess?: () => void;
    redirectPath?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({
                                                 onSuccess,
                                                 redirectPath = '/registry'
                                             }) => {
    // Form state
    const [teamName, setTeamName] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false); // Added rememberMe state

    // UI state
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<{
        teamName?: string;
        password?: string;
    }>({});

    // Validation state
    const [touched, setTouched] = useState<{
        teamName: boolean;
        password: boolean;
    }>({ teamName: false, password: false });

    const { login, user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            router.push(redirectPath);
        }
    }, [user, router, redirectPath]);

    // Handle success message from registration
    useEffect(() => {
        if (searchParams.get('registered') === 'true') {
            setShowSuccess(true);
            const timer = setTimeout(() => setShowSuccess(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [searchParams]);

    // Validation functions
    const validateTeamName = useCallback((value: string): string | undefined => {
        if (!value.trim()) return 'Team name is required';
        if (value.trim().length < 2) return 'Team name must be at least 2 characters';
        if (value.trim().length > 50) return 'Team name must be less than 50 characters';
        if (!/^[a-zA-Z0-9\s\-_.]+$/.test(value.trim())) {
            return 'Team name can only contain letters, numbers, spaces, hyphens, underscores, and periods';
        }
        return undefined;
    }, []);

    const validatePassword = useCallback((value: string): string | undefined => {
        if (!value) return 'Password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        return undefined;
    }, []);

    // Real-time validation
    useEffect(() => {
        if (touched.teamName) {
            const error = validateTeamName(teamName);
            setFieldErrors(prev => ({ ...prev, teamName: error }));
        }
    }, [teamName, touched.teamName, validateTeamName]);

    useEffect(() => {
        if (touched.password) {
            const error = validatePassword(password);
            setFieldErrors(prev => ({ ...prev, password: error }));
        }
    }, [password, touched.password, validatePassword]);

    // Handle field blur for validation
    const handleBlur = (field: 'teamName' | 'password') => {
        setTouched(prev => ({ ...prev, [field]: true }));
    };

    // Form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Mark all fields as touched for validation
        setTouched({ teamName: true, password: true });

        // Validate all fields
        const teamNameError = validateTeamName(teamName);
        const passwordError = validatePassword(password);

        setFieldErrors({
            teamName: teamNameError,
            password: passwordError
        });

        // Stop if there are validation errors
        if (teamNameError || passwordError) {
            return;
        }

        setLoading(true);

        try {
            const success = await login(teamName.trim(), password);

            if (success) {
                // Handle remember me functionality
                if (rememberMe) {
                    // You can add localStorage logic here if your auth context doesn't handle it
                    localStorage.setItem('rememberMe', 'true');
                } else {
                    localStorage.removeItem('rememberMe');
                }
                onSuccess?.();
                router.push(redirectPath);
            } else {
                setError('Invalid team name or password. Please check your credentials and try again.');
            }
        } catch (err) {
            setError('An error occurred during sign in. Please try again.');
            console.error('Login error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setError('');
                setShowSuccess(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const isFormValid = !fieldErrors.teamName && !fieldErrors.password && teamName.trim() && password;

    return (
        <div className="w-full max-w-md mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                {/* Success Alert */}
                {showSuccess && (
                    <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20 animate-in slide-in-from-top-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800 dark:text-green-400">
                            Account created successfully! Please sign in with your credentials.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Error Alert */}
                {error && (
                    <Alert variant="destructive" className="animate-in slide-in-from-top-2">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* Team Name Field */}
                <div className="space-y-2">
                    <Label htmlFor="teamName" className="text-sm font-medium flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Team Name
                    </Label>
                    <Input
                        id="teamName"
                        type="text"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        onBlur={() => handleBlur('teamName')}
                        placeholder="Enter your team name"
                        className={fieldErrors.teamName ? 'border-red-500 focus:border-red-500' : ''}
                        aria-invalid={!!fieldErrors.teamName}
                        aria-describedby={fieldErrors.teamName ? 'teamName-error' : undefined}
                        autoComplete="username"
                        disabled={loading}
                    />
                    {fieldErrors.teamName && (
                        <p id="teamName-error" className="text-sm text-red-600 dark:text-red-400 animate-in slide-in-from-top-1">
                            {fieldErrors.teamName}
                        </p>
                    )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                        <KeyRound className="h-4 w-4" />
                        Password
                    </Label>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onBlur={() => handleBlur('password')}
                            placeholder="Enter your password"
                            className={fieldErrors.password ? 'border-red-500 focus:border-red-500 pr-10' : 'pr-10'}
                            aria-invalid={!!fieldErrors.password}
                            aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                            autoComplete="current-password"
                            disabled={loading}
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                            onClick={() => setShowPassword(!showPassword)}
                            tabIndex={-1}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                            disabled={loading}
                        >
                            {showPassword ? (
                                <EyeOff className="h-4 w-4 text-gray-500" />
                            ) : (
                                <Eye className="h-4 w-4 text-gray-500" />
                            )}
                        </Button>
                    </div>
                    {fieldErrors.password && (
                        <p id="password-error" className="text-sm text-red-600 dark:text-red-400 animate-in slide-in-from-top-1">
                            {fieldErrors.password}
                        </p>
                    )}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="rememberMe"
                            checked={rememberMe}
                            onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                            disabled={loading}
                        />
                        <Label
                            htmlFor="rememberMe"
                            className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer"
                        >
                            Remember me
                        </Label>
                    </div>
                    <Link
                        href="/forgot-password"
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                        Forgot password?
                    </Link>
                </div>

                {/* Submit Button */}
                <Button
                    type="submit"
                    disabled={loading || !isFormValid}
                    className="w-full relative"
                >
                    {loading ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Signing In...
                        </>
                    ) : (
                        'Sign In'
                    )}
                </Button>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    {`Don't have an account? `}
                    <Link
                        href="/register"
                        className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                    >
                        Create a team
                    </Link>
                </p>
            </div>

            {/* Security Notice */}
            <div className="mt-4 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-500">
                    Protected by end-to-end encryption
                </p>
            </div>
        </div>
    );
};

export default LoginForm;