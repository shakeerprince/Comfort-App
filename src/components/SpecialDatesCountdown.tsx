'use client';

import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Calendar, Gift, Heart, Cake, Star, Settings, Save, X } from 'lucide-react';

gsap.registerPlugin(useGSAP);

interface SpecialDate {
    id: string; // Added ID for easier management
    name: string;
    date: string; // MM-DD format
    emoji: string;
    message: string;
    type: 'birthday' | 'anniversary' | 'special';
}

const defaultDates: SpecialDate[] = [
    {
        id: 'birthday',
        name: "Partner's Birthday",
        date: "01-01",
        emoji: "🎂",
        message: "The day my favorite person was born! 👸💕",
        type: "birthday"
    },
    {
        id: 'anniversary',
        name: "Anniversary",
        date: "02-14",
        emoji: "🎉",
        message: "Celebrating our love! 🎈💕",
        type: "anniversary"
    },
];

function getDaysUntil(monthDay: string): number {
    if (!monthDay) return 0;
    const [month, day] = monthDay.split('-').map(Number);
    const today = new Date();
    const thisYear = today.getFullYear();

    let targetDate = new Date(thisYear, month - 1, day);

    // If the date has passed this year, use next year
    if (targetDate < today && targetDate.toDateString() !== today.toDateString()) {
        targetDate = new Date(thisYear + 1, month - 1, day);
    }

    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays); // Prevent negative days
}

function getTargetDate(monthDay: string): Date {
    if (!monthDay) return new Date();
    const [month, day] = monthDay.split('-').map(Number);
    const today = new Date();
    const thisYear = today.getFullYear();

    let targetDate = new Date(thisYear, month - 1, day);

    if (targetDate < today && targetDate.toDateString() !== today.toDateString()) {
        targetDate = new Date(thisYear + 1, month - 1, day);
    }

    return targetDate;
}

export default function SpecialDatesCountdown() {
    const [dates, setDates] = useState<SpecialDate[]>(defaultDates);
    const [isEditing, setIsEditing] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('comfort-special-dates');
        if (saved) {
            try {
                setDates(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse dates", e);
            }
        }
    }, []);

    const saveDates = (newDates: SpecialDate[]) => {
        setDates(newDates);
        localStorage.setItem('comfort-special-dates', JSON.stringify(newDates));
        setIsEditing(false);
    };

    const handleDateChange = (id: string, newDate: string) => {
        // newDate from input is usually YYYY-MM-DD, we need MM-DD
        const parts = newDate.split('-');
        let formattedDate = newDate;
        if (parts.length === 3) {
            formattedDate = `${parts[1]}-${parts[2]}`;
        }

        const updatedDates = dates.map(d =>
            d.id === id ? { ...d, date: formattedDate } : d
        );
        // Don't save immediately, wait for Save button
        setDates(updatedDates);
    };

    useGSAP(() => {
        if (!containerRef.current) return;
        gsap.fromTo(containerRef.current,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
        );
    }, { scope: containerRef });

    const getBackgroundClass = (daysUntil: number) => {
        if (daysUntil === 0) return 'bg-gradient-to-r from-[#BFA054] to-[#E3C578] text-white shadow-lg';
        if (daysUntil <= 7) return 'bg-gradient-to-r from-[#9A2143] to-[#C44569] text-white shadow-lg';
        if (daysUntil <= 30) return 'bg-gradient-to-r from-[#9A2143]/20 to-[#BFA054]/20 border border-[#BFA054]/20';
        return 'bg-white/5 border border-white/10';
    };

    // Calculate processed dates for display
    const processedDates = dates.map(d => ({
        ...d,
        daysUntil: getDaysUntil(d.date),
        targetDate: getTargetDate(d.date)
    })).sort((a, b) => a.daysUntil - b.daysUntil);

    const nextDate = processedDates[0];

    return (
        <div ref={containerRef} className="w-full space-y-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-[#9A2143]" />
                    <h3 className="text-lg font-semibold">Special Days</h3>
                </div>
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    title="Edit Dates"
                >
                    {isEditing ? <X className="w-5 h-5 text-[#9A2143]" /> : <Settings className="w-5 h-5 opacity-60" />}
                </button>
            </div>

            {isEditing ? (
                <div className="space-y-3 animate-fade-in">
                    {dates.map((date) => (
                        <div key={date.id} className="glass-card p-4 space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">{date.emoji}</span>
                                <span className="font-semibold">{date.name}</span>
                            </div>
                            <input
                                type="date"
                                className="w-full bg-black/10 border border-white/20 rounded-xl px-4 py-2 text-sm focus:border-[#BFA054] focus:ring-1 focus:ring-[#BFA054] outline-none transition-colors"
                                // Convert MM-DD to YYYY-MM-DD for input value (using current year)
                                value={`${new Date().getFullYear()}-${date.date}`}
                                onChange={(e) => handleDateChange(date.id, e.target.value)}
                            />
                            <p className="text-xs opacity-50 pl-1">Set the day & month (Year is ignored)</p>
                        </div>
                    ))}
                    <button
                        onClick={() => saveDates(dates)}
                        className="w-full py-3 bg-gradient-to-r from-[#9A2143] to-[#C44569] text-white rounded-xl font-medium flex items-center justify-center gap-2"
                    >
                        <Save className="w-4 h-4" />
                        Save Dates
                    </button>
                </div>
            ) : (
                <>
                    {/* Next upcoming date - featured */}
                    {nextDate && (
                        <div className={`glass-card p-6 text-center ${getBackgroundClass(nextDate.daysUntil)}`}>
                            <span className="text-5xl mb-3 block">{nextDate.emoji}</span>
                            <h4 className="text-xl font-bold mb-1">{nextDate.name}</h4>

                            {nextDate.daysUntil === 0 ? (
                                <>
                                    <p className="text-3xl font-bold mb-2">🎉 TODAY! 🎉</p>
                                    <p className="text-sm opacity-90">{nextDate.message}</p>
                                </>
                            ) : (
                                <>
                                    <div className="flex items-center justify-center gap-2 my-3">
                                        <span className="text-4xl font-bold">{nextDate.daysUntil}</span>
                                        <span className="text-lg">days to go!</span>
                                    </div>
                                    <p className="text-sm opacity-80">
                                        {nextDate.targetDate.toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </p>
                                    <p className="text-xs opacity-70 mt-2">{nextDate.message}</p>
                                </>
                            )}
                        </div>
                    )}

                    {/* Other upcoming dates */}
                    {processedDates.slice(1).map((date, index) => (
                        <div
                            key={index}
                            className={`glass-card p-4 flex items-center gap-4 ${getBackgroundClass(date.daysUntil)}`}
                        >
                            <div className="text-3xl">{date.emoji}</div>
                            <div className="flex-1">
                                <h4 className="font-semibold">{date.name}</h4>
                                <p className="text-sm opacity-70">
                                    {date.targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </p>
                            </div>
                            <div className="text-right">
                                <span className="text-2xl font-bold">{date.daysUntil}</span>
                                <p className="text-xs opacity-70">days</p>
                            </div>
                        </div>
                    ))}
                </>
            )}
        </div>
    );
}
