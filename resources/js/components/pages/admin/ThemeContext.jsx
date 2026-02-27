import React, { createContext, useState, useEffect, useContext } from 'react';

export const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem('admin-theme');
        return saved ? saved === 'dark' : true; // Default to dark
    });

    useEffect(() => {
        localStorage.setItem('admin-theme', isDarkMode ? 'dark' : 'light');
        const root = window.document.documentElement;
        if (isDarkMode) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        
        // Also sync admin-root if it exists
        const adminRoot = document.getElementById('admin-root');
        if (adminRoot) {
            if (isDarkMode) {
                adminRoot.classList.add('dark');
            } else {
                adminRoot.classList.remove('dark');
            }
        }
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
