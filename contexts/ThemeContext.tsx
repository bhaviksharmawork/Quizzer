import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Theme color definitions
export const darkColors = {
    background: '#071025',
    cardBg: '#0b1220',
    inputBg: '#021124',
    primaryText: '#ffffff',
    secondaryText: '#94a3b8',
    accent: '#2b6cb0',
    accentLight: '#60a5fa',
    border: '#0f172a',
    avatarBg: '#0ea5a4',
    success: '#10b981',
    error: '#ef4444',
    warning: '#f97316',
};

export const lightColors = {
    background: '#f8fafc',
    cardBg: '#ffffff',
    inputBg: '#f1f5f9',
    primaryText: '#1e293b',
    secondaryText: '#64748b',
    accent: '#3b82f6',
    accentLight: '#3b82f6',
    border: '#e2e8f0',
    avatarBg: '#0ea5a4',
    success: '#10b981',
    error: '#ef4444',
    warning: '#f97316',
};

export type ThemeColors = typeof darkColors;

interface ThemeContextType {
    isDarkMode: boolean;
    toggleTheme: () => void;
    colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadTheme();
    }, []);

    const loadTheme = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem('theme');
            if (savedTheme !== null) {
                setIsDarkMode(savedTheme === 'dark');
            }
        } catch (error) {
            console.error('Error loading theme:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleTheme = async () => {
        try {
            const newTheme = !isDarkMode;
            setIsDarkMode(newTheme);
            await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
        } catch (error) {
            console.error('Error saving theme:', error);
        }
    };

    const colors = isDarkMode ? darkColors : lightColors;

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme, colors }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
