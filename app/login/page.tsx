import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import Loginform from './loginform';

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 p-4">
            <div className="w-full max-w-md">
                <Card className="backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 border-0 shadow-2xl">
                    <CardHeader className="text-center space-y-4">
                        <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                            <Users className="h-8 w-8 text-white" />
                        </div>
                        {/*<CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">*/}
                        {/*    Welcome Back*/}
                        {/*</CardTitle>*/}
                        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            දැම්ම මොකුත් කරන්න යන්න එපා හරකෙක් වගේ. ඉවර වෙනකන් පොඩ්ඩක් හිටපන් ඉවසගෙන!
                        </CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-300">
                            Sign in to your team account
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Suspense fallback={<div>Loading...</div>}>
                            <Loginform />
                        </Suspense>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
