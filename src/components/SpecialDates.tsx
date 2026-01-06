'use client';

import { useState, useEffect } from 'react';
import { Calendar, Heart, Sparkles, Gift, PartyPopper } from 'lucide-react';

interface SpecialDate {
    id: string;
    name: string;
    date: string; // YYYY-MM-DD format
    emoji: string;
    isRecurring: boolean;
}

const defaultSpecialDates: SpecialDate[] = [
    {
        id: '1',
        name: "Keerthi's Birthday",
        date: '2024-11-13',
        emoji: '🎂',
        isRecurring: true,
    },
    {
        id: '2',
        name: "Shaker's Birthday",
        date: '2024-04-30',
        emoji: '🎉',
        isRecurring: true,
    },
];

function getDaysUntil(dateStr: string, isRecurring: boolean): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let targetDate = new Date(dateStr);
    targetDate.setHours(0, 0, 0, 0);

    if (isRecurring) {
        // Set to current year
        targetDate.setFullYear(today.getFullYear());

        // If date has passed this year, set to next year
        if (targetDate < today) {
            targetDate.setFullYear(today.getFullYear() + 1);
        }
    }

    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
}

function isToday(dateStr: string): boolean {
    const today = new Date();
    const date = new Date(dateStr);
    return (
        today.getMonth() === date.getMonth() &&
        today.getDate() === date.getDate()
    );
}

export default function SpecialDates() {
    const [dates, setDates] = useState<SpecialDate[]>(defaultSpecialDates);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newDate, setNewDate] = useState({ name: '', date: '', emoji: '💕' });
    const [celebrating, setCelebrating] = useState<string | null>(null);

    useEffect(() => {
        // Load saved dates
        const saved = localStorage.getItem('cozycycle-special-dates');
        if (saved) {
            try {
                setDates(JSON.parse(saved));
            } catch (e) {
                setDates(defaultSpecialDates);
            }
        }

        // Check for celebrations
        const todaysCelebration = dates.find(d => isToday(d.date));
        if (todaysCelebration) {
            setCelebrating(todaysCelebration.id);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('cozycycle-special-dates', JSON.stringify(dates));
    }, [dates]);

    const addDate = () => {
        if (!newDate.name || !newDate.date) return;

        const newSpecialDate: SpecialDate = {
            id: Date.now().toString(),
            name: newDate.name,
            date: newDate.date,
            emoji: newDate.emoji,
            isRecurring: true,
        };

        setDates(prev => [...prev, newSpecialDate]);
        setNewDate({ name: '', date: '', emoji: '💕' });
        setShowAddForm(false);
    };

    const deleteDate = (id: string) => {
        setDates(prev => prev.filter(d => d.id !== id));
    };

    // Sort by upcoming
    const sortedDates = [...dates].sort((a, b) =>
        getDaysUntil(a.date, a.isRecurring) - getDaysUntil(b.date, b.isRecurring)
    );

    const nextDate = sortedDates[0];
    const daysUntilNext = nextDate ? getDaysUntil(nextDate.date, nextDate.isRecurring) : null;

    return (
        <div className="space-y-4">
            {/* Celebration banner */}
            {celebrating && (
                <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white p-4 rounded-2xl text-center animate-pulse">
                    <PartyPopper className="w-8 h-8 mx-auto mb-2" />
                    <p className="font-bold text-lg">
                        🎉 Happy {dates.find(d => d.id === celebrating)?.name}! 🎉
                    </p>
                    <p className="text-sm opacity-80">Today is special! 💕</p>
                </div>
            )}

            {/* Next upcoming date */}
            {nextDate && daysUntilNext !== null && daysUntilNext > 0 && (
                <div className="glass-card p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm opacity-70">Coming up next</span>
                        <Sparkles className="w-4 h-4 text-yellow-400" />
                    </div>
                    <p className="text-3xl mb-1">{nextDate.emoji}</p>
                    <p className="font-semibold">{nextDate.name}</p>
                    <p className="text-4xl font-bold text-gradient my-2">{daysUntilNext}</p>
                    <p className="text-sm opacity-70">days to go!</p>
                </div>
            )}

            {/* All special dates */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-pink-400" />
                        <h3 className="font-semibold">Special Dates</h3>
                    </div>
                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="text-xs bg-pink-400 text-white px-3 py-1 rounded-full"
                    >
                        + Add
                    </button>
                </div>

                {showAddForm && (
                    <div className="glass-card p-4 space-y-3">
                        <input
                            type="text"
                            placeholder="Event name..."
                            value={newDate.name}
                            onChange={(e) => setNewDate(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-sm"
                        />
                        <input
                            type="date"
                            value={newDate.date}
                            onChange={(e) => setNewDate(prev => ({ ...prev, date: e.target.value }))}
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-sm"
                        />
                        <div className="flex gap-2">
                            {['💕', '🎂', '🎉', '💝', '🌸', '✨'].map(emoji => (
                                <button
                                    key={emoji}
                                    onClick={() => setNewDate(prev => ({ ...prev, emoji }))}
                                    className={`text-xl p-2 rounded-lg ${newDate.emoji === emoji ? 'bg-pink-400/30' : ''}`}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={addDate}
                            className="w-full btn-cozy text-sm py-2"
                        >
                            Save Date
                        </button>
                    </div>
                )}

                {sortedDates.map((date) => {
                    const daysUntil = getDaysUntil(date.date, date.isRecurring);

                    return (
                        <div
                            key={date.id}
                            className={`glass-card p-3 flex items-center gap-3 ${daysUntil === 0 ? 'ring-2 ring-pink-400 animate-pulse' : ''
                                }`}
                        >
                            <span className="text-2xl">{date.emoji}</span>
                            <div className="flex-1">
                                <p className="font-medium text-sm">{date.name}</p>
                                <p className="text-xs opacity-60">
                                    {new Date(date.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </p>
                            </div>
                            <div className="text-right">
                                {daysUntil === 0 ? (
                                    <span className="text-pink-500 font-bold text-sm">Today! 🎉</span>
                                ) : (
                                    <span className="text-sm opacity-70">{daysUntil}d</span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="text-center text-xs opacity-50">
                <Heart className="w-3 h-3 inline mr-1" fill="#f472b6" />
                Never miss a special moment together
            </div>
        </div>
    );
}
