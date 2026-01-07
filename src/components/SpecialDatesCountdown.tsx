'use client';

import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Calendar, Gift, Heart, Cake, Star } from 'lucide-react';

gsap.registerPlugin(useGSAP);

interface SpecialDate {
    name: string;
    date: string; // MM-DD format
    emoji: string;
    message: string;
    type: 'birthday' | 'anniversary' | 'special';
}

const specialDates: SpecialDate[] = [
    {
        name: "Keerthi's Birthday",
        date: "11-13",
        emoji: "🎂",
        message: "The day my angel was born! 👸💕",
        type: "birthday"
    },
    {
        name: "Shaker's Birthday",
        date: "04-30",
        emoji: "🎉",
        message: "The day your love was born! 🎈💕",
        type: "birthday"
    },
];

function getDaysUntil(monthDay: string): number {
    const [month, day] = monthDay.split('-').map(Number);
    const today = new Date();
    const thisYear = today.getFullYear();

    let targetDate = new Date(thisYear, month - 1, day);

    // If the date has passed this year, use next year
    if (targetDate < today) {
        targetDate = new Date(thisYear + 1, month - 1, day);
    }

    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
}

function getTargetDate(monthDay: string): Date {
    const [month, day] = monthDay.split('-').map(Number);
    const today = new Date();
    const thisYear = today.getFullYear();

    let targetDate = new Date(thisYear, month - 1, day);

    if (targetDate < today) {
        targetDate = new Date(thisYear + 1, month - 1, day);
    }

    return targetDate;
}

export default function SpecialDatesCountdown() {
    const [dates, setDates] = useState<(SpecialDate & { daysUntil: number; targetDate: Date })[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const datesWithCountdown = specialDates.map(d => ({
            ...d,
            daysUntil: getDaysUntil(d.date),
            targetDate: getTargetDate(d.date)
        })).sort((a, b) => a.daysUntil - b.daysUntil);

        setDates(datesWithCountdown);
    }, []);

    useGSAP(() => {
        if (!containerRef.current) return;
        gsap.fromTo(containerRef.current,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
        );
    }, { scope: containerRef });

    const getIcon = (type: string) => {
        switch (type) {
            case 'birthday': return <Cake className="w-5 h-5" />;
            case 'anniversary': return <Heart className="w-5 h-5" />;
            default: return <Star className="w-5 h-5" />;
        }
    };

    const getBackgroundClass = (daysUntil: number) => {
        if (daysUntil === 0) return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
        if (daysUntil <= 7) return 'bg-gradient-to-r from-pink-400 to-rose-500 text-white';
        if (daysUntil <= 30) return 'bg-gradient-to-r from-purple-400/20 to-pink-400/20';
        return 'bg-white/10';
    };

    const nextDate = dates[0];

    return (
        <div ref={containerRef} className="w-full space-y-4">
            <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-6 h-6 text-pink-400" />
                <h3 className="text-lg font-semibold">Special Days</h3>
            </div>

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
                                    year: 'numeric'
                                })}
                            </p>
                            <p className="text-xs opacity-70 mt-2">{nextDate.message}</p>
                        </>
                    )}

                    {nextDate.daysUntil <= 7 && nextDate.daysUntil > 0 && (
                        <div className="mt-4 p-3 bg-white/20 rounded-xl">
                            <Gift className="w-5 h-5 mx-auto mb-1" />
                            <p className="text-xs">Time to plan something special! 🎁</p>
                        </div>
                    )}
                </div>
            )}

            {/* Other upcoming dates */}
            {dates.slice(1).map((date, index) => (
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

            {/* Add more dates hint */}
            <p className="text-center text-sm opacity-50">
                ✨ More special dates can be added!
            </p>
        </div>
    );
}
