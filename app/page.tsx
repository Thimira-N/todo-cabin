'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {LoadingScreen} from "@/components/loadingScreen";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/registry');
      } else {
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
        {/*<div className="text-center">*/}
        {/*  <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>*/}
        {/*  <p className="text-gray-600 dark:text-gray-300">Loading...</p>*/}
        {/*</div>*/}

        <LoadingScreen />
      </div>
  );
}