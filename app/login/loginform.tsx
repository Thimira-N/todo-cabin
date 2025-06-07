'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

const Loginform = () => {
    const [teamName, setTeamName] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const { login, user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (user) router.push('/registry');
    }, [user, router]);

    useEffect(() => {
        if (searchParams.get('registered') === 'true') {
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 5000);
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!teamName.trim() || !password) {
            setError('Please enter both team name and password');
            return;
        }

        setLoading(true);
        const success = await login(teamName.trim(), password);

        if (success) {
            router.push('/registry');
        } else {
            setError('Invalid team name or password');
        }
        setLoading(false);
    };

    return (
        <>
            <form onSubmit={handleSubmit} className="space-y-6">
                {showSuccess && (
                    <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800 dark:text-green-400">
                            Account created successfully! Please sign in with your credentials.
                        </AlertDescription>
                    </Alert>
                )}

                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
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
                        required
                    />
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
                            required
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>

                <Button type="submit" disabled={loading}>
                    {loading ? 'Signing In...' : 'Sign In'}
                </Button>
            </form>

            <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                    {"Don't have an account?{' '}"}
                    <Link href="/register" className="text-blue-600 dark:text-blue-400">
                        Create a team
                    </Link>
                </p>
            </div>
        </>
    )
}
export default Loginform
