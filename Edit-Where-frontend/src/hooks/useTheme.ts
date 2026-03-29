import { useState, useEffect } from 'react';

export function useTheme() {
  // Check if they previously saved a theme, otherwise default to 'dark'
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('app-theme') as 'light' | 'dark') || 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    // Remove both classes, then add the active one
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    
    // Save to local storage
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return { theme, toggleTheme };
}