import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata = {
  title: 'NextJS Todo App',
  description:
    'A modern todo application built with Next.js 16, Drizzle ORM, and PostgreSQL',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-gray-50 antialiased transition-colors dark:bg-gray-900`}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
