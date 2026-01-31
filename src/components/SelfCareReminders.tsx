'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, X, Sparkles, Droplets, Sun, Heart, Coffee } from 'lucide-react';

interface Reminder {
    id: string;
    emoji: string;
    text: string;
    done: boolean;
    interval: number; // hours
}

const defaultReminders: Reminder[] = [
    { id: '1', emoji: '💧', text: 'Drink some water, baby!', done: false, interval: 2 },
    { id: '2', emoji: '🍎', text: 'Have you eaten something?', done: false, interval: 4 },
    { id: '3', emoji: '🚶‍♀️', text: 'Take a short break & stretch', done: false, interval: 1 },
    { id: '4', emoji: '🤗', text: 'Remember: You are loved!', done: false, interval: 3 },
    { id: '5', emoji: '💊', text: 'Take your meds if needed', done: false, interval: 8 },
    { id: '6', emoji: '🌸', text: 'Deep breath... you got this!', done: false, interval: 2 },
];

const motivationalMessages = [
    "You're doing amazing, sweetie! 💕",
    "One step at a time, you've got this! 🌟",
    "I'm so proud of you! 💖",
    "You're stronger than you know! 💪",
    "Take it easy, I love you! 🥰",
    "You're my favorite person ever! 💗",
];

export default function SelfCareReminders() {
    const [reminders, setReminders] = useState<Reminder[]>(defaultReminders);
    const [motivation, setMotivation] = useState('');
    const [showMotivation, setShowMotivation] = useState(false);

    useEffect(() => {
        // Load saved state
        const saved = localStorage.getItem('cozycycle-reminders');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Reset if it's a new day
                const lastReset = localStorage.getItem('cozycycle-reminders-date');
                const today = new Date().toDateString();
                if (lastReset !== today) {
                    localStorage.setItem('cozycycle-reminders-date', today);
                    setReminders(defaultReminders);
                } else {
                    setReminders(parsed);
                }
            } catch (e) {
                setReminders(defaultReminders);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('cozycycle-reminders', JSON.stringify(reminders));
    }, [reminders]);

    const toggleReminder = (id: string) => {
        setReminders(prev =>
            prev.map(r => {
                if (r.id === id && !r.done) {
                    // Show motivation when completing
                    const randomMotivation = motivationalMessages[
                        Math.floor(Math.random() * motivationalMessages.length)
                    ];
                    setMotivation(randomMotivation);
                    setShowMotivation(true);
                    setTimeout(() => setShowMotivation(false), 2000);
                }
                return r.id === id ? { ...r, done: !r.done } : r;
            })
        );
    };

    const resetAll = () => {
        setReminders(defaultReminders);
    };

    const completedCount = reminders.filter(r => r.done).length;
    const progress = (completedCount / reminders.length) * 100;

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-pink-400" />
                    <h3 className="font-semibold">Self-Care Reminders</h3>
                </div>
                <button
                    onClick={resetAll}
                    className="text-xs opacity-50 hover:opacity-100 transition-opacity"
                >
                    Reset
                </button>
            </div>

            {/* Progress */}
            <div className="glass-card p-3">
                <div className="flex items-center justify-between text-sm mb-2">
                    <span className="opacity-70">Today's Progress</span>
                    <span className="font-semibold">{completedCount}/{reminders.length}</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-pink-400 to-rose-500 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                {completedCount === reminders.length && (
                    <p className="text-center text-xs mt-2 text-pink-400 animate-pulse">
                        ✨ Amazing! You did it all! ✨
                    </p>
                )}
            </div>

            {/* Motivation popup */}
            {showMotivation && (
                <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-4 rounded-2xl shadow-lg animate-bounce">
                    <p className="text-center font-semibold">{motivation}</p>
                </div>
            )}

            {/* Reminders list */}
            <div className="space-y-2">
                {reminders.map((reminder) => (
                    <button
                        key={reminder.id}
                        onClick={() => toggleReminder(reminder.id)}
                        className={`w-full glass-card p-3 flex items-center gap-3 transition-all ${reminder.done
                            ? 'opacity-50 scale-98'
                            : 'hover:scale-102'
                            }`}
                    >
                        <span className="text-xl">{reminder.emoji}</span>
                        <span className={`flex-1 text-left text-sm ${reminder.done ? 'line-through' : ''}`}>
                            {reminder.text}
                        </span>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${reminder.done
                            ? 'bg-green-400 text-white'
                            : 'bg-white/20'
                            }`}>
                            {reminder.done && <Check className="w-4 h-4" />}
                        </div>
                    </button>
                ))}
            </div>

            {/* Partner's note */}
            <div className="text-center text-xs opacity-50 mt-4">
                <Heart className="w-4 h-4 inline mr-1" fill="#f472b6" />
                Your partner wants you to take care of yourself 💕
            </div>
        </div>
    );
}
