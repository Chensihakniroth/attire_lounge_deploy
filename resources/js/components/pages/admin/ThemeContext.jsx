import React, { createContext, useState, useEffect, useContext, useSyncExternalStore } from 'react';

export const ThemeContext = createContext();

const darkModeStore = {
    subscribe: (callback) => {
        window.addEventListener('storage', callback);
        window.addEventListener('theme-toggle', callback);
        return () => {
            window.removeEventListener('storage', callback);
            window.removeEventListener('theme-toggle', callback);
        };
    },
    getSnapshot: () => {
        const saved = localStorage.getItem('admin-theme');
        return saved ? saved === 'dark' : document.documentElement.classList.contains('dark');
    },
    getServerSnapshot: () => true,
};

export const useTheme = () => useContext(ThemeContext);

export const useIsDarkMode = () => useSyncExternalStore(
    darkModeStore.subscribe,
    darkModeStore.getSnapshot,
    darkModeStore.getServerSnapshot
);

export const ThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window === 'undefined') return true;
        const saved = localStorage.getItem('admin-theme');
        if (saved) {
            return saved === 'dark';
        }
        return document.documentElement.classList.contains('dark');
    });

    useEffect(() => {
        localStorage.setItem('admin-theme', isDarkMode ? 'dark' : 'light');
        const root = window.document.documentElement;
        if (isDarkMode) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        
        const adminRoot = document.getElementById('admin-root');
        if (adminRoot) {
            if (isDarkMode) {
                adminRoot.classList.add('dark');
            } else {
                adminRoot.classList.remove('dark');
            }
        }
        
        window.dispatchEvent(new Event('theme-toggle'));
    }, [isDarkMode]);

    const toggleDarkMode = () => setIsDarkMode(prev => !prev);

    const colors = isDarkMode ? {
        background: '#050505',
        card: '#0a0a0a',
        border: 'rgba(255, 255, 255, 0.05)',
        text: '#ffffff',
        accent: '#d4a84c'
    } : {
        background: '#f9fafb',
        card: '#ffffff',
        border: 'rgba(0, 0, 0, 0.05)',
        text: '#111827',
        accent: '#d4a84c'
    };

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode, colors }}>
            {children}
        </ThemeContext.Provider>
    );
};
