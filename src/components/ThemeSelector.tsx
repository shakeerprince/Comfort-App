'use client';

import { useState, useEffect } from 'react';
import { Palette, Check } from 'lucide-react';

type Theme = 'royal' | 'coffee' | 'forest' | 'purple' | 'ocean';

const themes: { id: Theme; name: string; primary: string; secondary: string }[] = [
    { id: 'royal', name: 'Royal', primary: '#9A2143', secondary: '#BFA054' },
    { id: 'coffee', name: 'Coffee', primary: '#8B593E', secondary: '#E5D3B7' },
    { id: 'forest', name: 'Forest', primary: '#2E7D32', secondary: '#81C784' },
    { id: 'purple', name: 'Purple', primary: '#6A1B9A', secondary: '#BA68C8' },
    { id: 'ocean', name: 'Ocean', primary: '#0277BD', secondary: '#4FC3F7' },
];

export default function ThemeSelector() {
    const [currentTheme, setCurrentTheme] = useState<Theme>('royal');
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Load theme from localStorage
        const saved = localStorage.getItem('comfort-theme') as Theme;
        if (saved && themes.find(t => t.id === saved)) {
            setCurrentTheme(saved);
            document.documentElement.setAttribute('data-theme', saved);
        }
    }, []);

    const changeTheme = (themeId: Theme) => {
        setCurrentTheme(themeId);
        document.documentElement.setAttribute('data-theme', themeId);
        localStorage.setItem('comfort-theme', themeId);
        setIsOpen(false);
    };

    return (
        <div className="w-full">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 glass-card hover:bg-white/40 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-black/5 dark:bg-white/10">
                        <Palette className="w-5 h-5 text-current opacity-80" />
                    </div>
                    <div className="text-left">
                        <h3 className="font-semibold text-lg">App Theme</h3>
                        <p className="text-sm opacity-60">Current: {themes.find(t => t.id === currentTheme)?.name}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {/* Preview circles */}
                    <div className="flex -space-x-1">
                        <div className="w-4 h-4 rounded-full border border-white" style={{ background: themes.find(t => t.id === currentTheme)?.primary }} />
                        <div className="w-4 h-4 rounded-full border border-white" style={{ background: themes.find(t => t.id === currentTheme)?.secondary }} />
                    </div>
                </div>
            </button>

            {isOpen && (
                <div className="mt-2 grid grid-cols-1 gap-2 animate-fade-in">
                    {themes.map((theme) => (
                        <button
                            key={theme.id}
                            onClick={() => changeTheme(theme.id)}
                            className={`flex items-center justify-between p-3 rounded-xl transition-all border ${currentTheme === theme.id
                                    ? 'bg-black/5 dark:bg-white/10 border-current'
                                    : 'bg-transparent border-transparent hover:bg-black/5 dark:hover:bg-white/5'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex gap-1">
                                    <div className="w-6 h-6 rounded-full shadow-sm" style={{ background: theme.primary }} />
                                    <div className="w-6 h-6 rounded-full shadow-sm" style={{ background: theme.secondary }} />
                                </div>
                                <span className="font-medium">{theme.name}</span>
                            </div>
                            {currentTheme === theme.id && (
                                <Check className="w-5 h-5" />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
