'use client';

import { useTheme } from './ThemeProvider';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className={`flex h-8 w-14 items-center rounded-full border border-gray-100 px-1 transition-colors ${
        isDark ? 'bg-gray-600' : 'bg-gray-400'
      }`}
    >
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full shadow transition-transform ${
          isDark
            ? 'translate-x-5 border border-gray-100'
            : '-translate-x-1 border border-gray-100'
        }`}
      >
        {isDark ? (
          <Moon className="h-8 w-8 p-1 text-white" />
        ) : (
          <Sun className="h-8 w-8 p-1 text-black" />
        )}
      </div>
    </button>
  );
}
