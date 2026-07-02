'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function DarkModeToggle() {
  const [theme, setTheme] = useState('light');

  // Load saved theme choice
  useEffect(() => {
    const savedTheme = localStorage.getItem('sanctuary_theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
      document.documentElement.classList.add('dark');
      localStorage.setItem('sanctuary_theme', 'dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
      localStorage.setItem('sanctuary_theme', 'light');
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 rounded-xl bg-white/40 border border-white/20 hover:bg-white/70 dark:bg-zinc-800/40 dark:border-zinc-700/30 dark:hover:bg-zinc-800/70 shadow-sm text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 transition-all duration-300 transform active:scale-95 cursor-pointer flex items-center justify-center"
      aria-label="Toggle dark mode"
      title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
    >
      {theme === 'light' ? (
        <Moon className="w-4 h-4 transition-transform hover:rotate-12 duration-300" />
      ) : (
        <Sun className="w-4 h-4 transition-transform hover:rotate-45 duration-300" />
      )}
    </button>
  );
}
