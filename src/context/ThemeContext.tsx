'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeType = 'blossom' | 'sage' | 'moonlight' | 'sunshine';

interface ThemeConfig {
    name: string;
    emoji: string;
    cssClass: string;
    colors: {
        primary: string;
        secondary: string;
        background: string;
        foreground: string;
        accent: string;
    };
}

export const themes: Record<ThemeType, ThemeConfig> = {
    blossom: {
        name: 'Blossom',
        emoji: '🌸',
        cssClass: 'theme-blossom',
        colors: {
            primary: '#f48fb1',
            secondary: '#f8bbd9',
            background: '#fef7f7',
            foreground: '#5d4037',
            accent: '#f06292',
        },
    },
    sage: {
        name: 'Sage',
        emoji: '🌿',
        cssClass: 'theme-sage',
        colors: {
            primary: '#81c784',
            secondary: '#a5d6a7',
            background: '#f1f8e9',
            foreground: '#33691e',
            accent: '#66bb6a',
        },
    },
    moonlight: {
        name: 'Moonlight',
        emoji: '🌙',
        cssClass: 'theme-moonlight',
        colors: {
            primary: '#b39ddb',
            secondary: '#d1c4e9',
            background: '#1a1a2e',
            foreground: '#e8e8ff',
            accent: '#9575cd',
        },
    },
    sunshine: {
        name: 'Sunshine',
        emoji: '☀️',
        cssClass: 'theme-sunshine',
        colors: {
            primary: '#ffb74d',
            secondary: '#ffe0b2',
            background: '#fffde7',
            foreground: '#5d4037',
            accent: '#ffa726',
        },
    },
};

interface ThemeContextType {
    theme: ThemeType;
    setTheme: (theme: ThemeType) => void;
    themeConfig: ThemeConfig;
}

// Create context with default value to prevent null during hydration
const defaultContext: ThemeContextType = {
    theme: 'blossom',
    setTheme: () => { },
    themeConfig: themes.blossom,
};

const ThemeContext = createContext<ThemeContextType>(defaultContext);

const THEME_STORAGE_KEY = 'cozycycle-theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<ThemeType>('blossom');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Load saved theme
        const saved = localStorage.getItem(THEME_STORAGE_KEY);
        if (saved && saved in themes) {
            setThemeState(saved as ThemeType);
        }
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        // Save theme
        localStorage.setItem(THEME_STORAGE_KEY, theme);

        // Apply theme to document
        const root = document.documentElement;
        const themeConfig = themes[theme];

        // Remove all theme classes
        Object.values(themes).forEach(t => {
            root.classList.remove(t.cssClass);
        });

        // Add current theme class
        root.classList.add(themeConfig.cssClass);

        // Set CSS variables
        root.style.setProperty('--theme-primary', themeConfig.colors.primary);
        root.style.setProperty('--theme-secondary', themeConfig.colors.secondary);
        root.style.setProperty('--theme-background', themeConfig.colors.background);
        root.style.setProperty('--theme-foreground', themeConfig.colors.foreground);
        root.style.setProperty('--theme-accent', themeConfig.colors.accent);
    }, [theme, mounted]);

    const setTheme = (newTheme: ThemeType) => {
        setThemeState(newTheme);
    };

    const themeConfig = themes[theme];

    // Always provide context, just use default values until mounted
    return (
        <ThemeContext.Provider value={{ theme, setTheme, themeConfig }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}

