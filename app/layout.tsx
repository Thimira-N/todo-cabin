import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'To-Do Cabin',
    description: 'Tidy tasks. Cozy logs. Teamwork that sticks.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
      <ThemeProvider>
          <AuthProvider>
              {children}
          </AuthProvider>
      </ThemeProvider>
      </body>
      </html>
  );
}
