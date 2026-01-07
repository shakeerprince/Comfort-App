'use client';

import { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Calendar, ChevronLeft, ChevronRight, Droplets, AlertCircle, Bell, Heart } from 'lucide-react';

gsap.registerPlugin(useGSAP);

interface CycleData {
    lastPeriodStart: string | null;
    periodHistory: string[]; // Array of period start dates
    cycleLength: number;
    periodLength: number;
}

const symptoms = [
    { emoji: '😣', label: 'Cramps' },
    { emoji: '🤕', label: 'Headache' },
    { emoji: '😴', label: 'Fatigue' },
    { emoji: '🎭', label: 'Mood swings' },
    { emoji: '🍽️', label: 'Cravings' },
    { emoji: '💨', label: 'Bloating' },
];

export default function TrackerPage() {
    const [cycleData, setCycleData] = useState<CycleData>({
        lastPeriodStart: null,
        periodHistory: [],
        cycleLength: 28,
        periodLength: 5,
    });
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
    const [periodStarted, setPeriodStarted] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const mainRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Load from localStorage
        const saved = localStorage.getItem('comfort-cycle-data');
        if (saved) {
            setCycleData(JSON.parse(saved));
        }
    }, []);

    useEffect(() => {
        // Save to localStorage
        localStorage.setItem('comfort-cycle-data', JSON.stringify(cycleData));
    }, [cycleData]);

    useGSAP(() => {
        if (!mainRef.current) return;

        const sections = mainRef.current.querySelectorAll('.section');
        gsap.fromTo(sections,
            { opacity: 0, y: 20 },
            {
                opacity: 1,
                y: 0,
                duration: 0.5,
                stagger: 0.15,
                ease: 'power2.out',
            }
        );
    }, { scope: mainRef });

    const markPeriodStart = () => {
        const today = new Date().toISOString().split('T')[0];

        // Calculate new cycle length based on history
        let newCycleLength = cycleData.cycleLength;
        if (cycleData.lastPeriodStart) {
            const lastStart = new Date(cycleData.lastPeriodStart);
            const todayDate = new Date(today);
            const daysBetween = Math.floor((todayDate.getTime() - lastStart.getTime()) / (1000 * 60 * 60 * 24));

            // Only update if it's within reasonable range (21-35 days)
            if (daysBetween >= 21 && daysBetween <= 45) {
                // Average with previous cycle length
                newCycleLength = Math.round((cycleData.cycleLength + daysBetween) / 2);
            }
        }

        setCycleData(prev => ({
            ...prev,
            lastPeriodStart: today,
            periodHistory: [...prev.periodHistory, today].slice(-12), // Keep last 12 periods
            cycleLength: newCycleLength,
        }));
        setPeriodStarted(true);

        setTimeout(() => setPeriodStarted(false), 3000);
    };

    const getNextPeriodDate = () => {
        if (!cycleData.lastPeriodStart) return null;
        const lastStart = new Date(cycleData.lastPeriodStart);
        const nextPeriod = new Date(lastStart);
        nextPeriod.setDate(nextPeriod.getDate() + cycleData.cycleLength);
        return nextPeriod;
    };

    const getDaysUntilPeriod = () => {
        const next = getNextPeriodDate();
        if (!next) return null;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const diff = Math.ceil((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return diff;
    };

    const nextPeriod = getNextPeriodDate();
    const daysUntil = getDaysUntilPeriod();

    const toggleSymptom = (label: string) => {
        setSelectedSymptoms(prev =>
            prev.includes(label)
                ? prev.filter(s => s !== label)
                : [...prev, label]
        );
    };

    const prevMonth = () => {
        setCurrentMonth(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() - 1);
            return newDate;
        });
    };

    const nextMonthNav = () => {
        setCurrentMonth(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() + 1);
            return newDate;
        });
    };

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month, 1).getDay();
    };

    const isPeriodDay = (day: number) => {
        if (!cycleData.lastPeriodStart) return false;
        const checkDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        const lastStart = new Date(cycleData.lastPeriodStart);

        // Check if it's within period length days of the start
        const diff = Math.floor((checkDate.getTime() - lastStart.getTime()) / (1000 * 60 * 60 * 24));
        return diff >= 0 && diff < cycleData.periodLength;
    };

    const isPredictedPeriod = (day: number) => {
        if (!nextPeriod) return false;
        const checkDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        const diff = Math.floor((checkDate.getTime() - nextPeriod.getTime()) / (1000 * 60 * 60 * 24));
        return diff >= 0 && diff < cycleData.periodLength;
    };

    const isToday = (day: number) => {
        const today = new Date();
        return day === today.getDate() &&
            currentMonth.getMonth() === today.getMonth() &&
            currentMonth.getFullYear() === today.getFullYear();
    };

    const getReminderMessage = () => {
        if (daysUntil === null) return null;
        if (daysUntil <= 0) return "Your period might start today or very soon! 🌸";
        if (daysUntil === 1) return "Your period may start tomorrow! 💕";
        if (daysUntil <= 3) return `Period in ${daysUntil} days - Shaker is preparing your comfort kit! 🧡`;
        if (daysUntil <= 7) return `About ${daysUntil} days until your period. Shaker will stock up on chocolate! 🍫`;
        return null;
    };

    const reminderMessage = getReminderMessage();

    return (
        <main ref={mainRef} className="flex-1 px-6 py-8">
            {/* Header */}
            <section className="section text-center mb-6">
                <div className="flex items-center justify-center gap-3 mb-3">
                    <Calendar className="w-8 h-8 text-purple-400" />
                    <h1 className="text-3xl font-bold text-gradient">Period Tracker</h1>
                </div>
                <p className="text-lg opacity-70">
                    Track & predict your cycle, Keerthi 📅
                </p>
            </section>

            {/* Reminder Alert */}
            {reminderMessage && (
                <section className="section max-w-md mx-auto mb-6">
                    <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-300/30 rounded-2xl p-4 flex items-center gap-3">
                        <Bell className="w-6 h-6 text-pink-400 flex-shrink-0" />
                        <p className="text-sm">{reminderMessage}</p>
                    </div>
                </section>
            )}

            {/* Prediction Card */}
            <section className="section cozy-card p-6 mb-6 max-w-md mx-auto text-center">
                {daysUntil !== null && daysUntil > 0 ? (
                    <>
                        <p className="text-sm opacity-70 mb-2">Next period expected in</p>
                        <p className="text-5xl font-bold text-gradient mb-2">{daysUntil}</p>
                        <p className="text-lg">days</p>
                        <p className="text-sm opacity-70 mt-3">
                            📅 {nextPeriod?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </p>

                        {daysUntil <= 3 && (
                            <div className="mt-4 p-3 bg-pink-100 dark:bg-pink-900/30 rounded-xl flex items-center justify-center gap-2">
                                <Heart className="w-4 h-4 text-pink-500" />
                                <span className="text-sm text-pink-600 dark:text-pink-300">
                                    Shaker is ready to pamper you! 💕
                                </span>
                            </div>
                        )}
                    </>
                ) : daysUntil !== null && daysUntil <= 0 ? (
                    <>
                        <Droplets className="w-12 h-12 mx-auto mb-3 text-rose-400" />
                        <p className="text-lg font-medium">Period may have started!</p>
                        <p className="text-sm opacity-60 mt-2">Tap below if it has started today</p>
                    </>
                ) : (
                    <>
                        <Droplets className="w-12 h-12 mx-auto mb-3 text-rose-400" />
                        <p className="text-lg">Start tracking your cycle</p>
                        <p className="text-sm opacity-60 mt-2">Tap below when your period starts</p>
                    </>
                )}
            </section>

            {/* Mark Period Button */}
            <section className="section text-center mb-6 max-w-md mx-auto">
                <button
                    onClick={markPeriodStart}
                    className={`w-full py-4 rounded-2xl font-semibold text-lg transition-all active:scale-95 ${periodStarted
                        ? 'bg-green-500 text-white'
                        : 'bg-gradient-to-r from-rose-400 to-pink-500 text-white hover:opacity-90'
                        }`}
                >
                    {periodStarted ? '✓ Period Started - Logged!' : '🩸 Period Started Today'}
                </button>
                {cycleData.lastPeriodStart && (
                    <div className="mt-3 text-sm opacity-60">
                        <p>Last period: {new Date(cycleData.lastPeriodStart).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</p>
                        <p>Average cycle: {cycleData.cycleLength} days</p>
                    </div>
                )}
            </section>

            {/* Mini Calendar */}
            <section className="section glass-card p-4 mb-6 max-w-md mx-auto">
                <div className="flex items-center justify-between mb-4">
                    <button onClick={prevMonth} className="p-3 hover:bg-white/10 rounded-lg active:scale-95">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h3 className="font-semibold">
                        {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h3>
                    <button onClick={nextMonthNav} className="p-3 hover:bg-white/10 rounded-lg active:scale-95">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2 opacity-50">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                        <div key={i}>{day}</div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                    {/* Empty cells for days before the 1st */}
                    {Array.from({ length: getFirstDayOfMonth(currentMonth) }).map((_, i) => (
                        <div key={`empty-${i}`} className="h-10" />
                    ))}

                    {/* Days of the month */}
                    {Array.from({ length: getDaysInMonth(currentMonth) }).map((_, i) => {
                        const day = i + 1;
                        const todayCheck = isToday(day);
                        const isPeriod = isPeriodDay(day);
                        const isPredicted = isPredictedPeriod(day);

                        return (
                            <div
                                key={day}
                                className={`h-10 flex items-center justify-center rounded-full text-sm font-medium transition-all
                                    ${isPeriod
                                        ? 'bg-gradient-to-br from-rose-400 to-pink-500 text-white'
                                        : isPredicted
                                            ? 'bg-pink-200/50 dark:bg-pink-800/30 border-2 border-dashed border-pink-400'
                                            : todayCheck
                                                ? 'bg-purple-500 text-white ring-2 ring-purple-300'
                                                : 'hover:bg-white/10'
                                    }`}
                            >
                                {day}
                            </div>
                        );
                    })}
                </div>

                <div className="flex justify-center gap-4 mt-4 text-xs opacity-70">
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-rose-400 to-pink-500" />
                        <span>Period</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full border-2 border-dashed border-pink-400" />
                        <span>Predicted</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-purple-500" />
                        <span>Today</span>
                    </div>
                </div>
            </section>

            {/* Symptom Logger */}
            <section className="section max-w-md mx-auto mb-6">
                <h3 className="text-lg font-semibold text-center mb-4">Log Today&apos;s Symptoms</h3>
                <div className="grid grid-cols-3 gap-3">
                    {symptoms.map((symptom) => (
                        <button
                            key={symptom.label}
                            onClick={() => toggleSymptom(symptom.label)}
                            className={`glass-card p-4 flex flex-col items-center gap-2 transition-all active:scale-95 ${selectedSymptoms.includes(symptom.label)
                                ? 'ring-2 ring-pink-400 bg-pink-50 dark:bg-pink-900/30'
                                : ''
                                }`}
                        >
                            <span className="text-2xl">{symptom.emoji}</span>
                            <span className="text-xs">{symptom.label}</span>
                        </button>
                    ))}
                </div>
            </section>

            {/* Cycle Settings */}
            <section className="section max-w-md mx-auto">
                <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="w-full text-sm opacity-60 hover:opacity-100 text-center py-2"
                >
                    ⚙️ {showSettings ? 'Hide' : 'Adjust'} Cycle Settings
                </button>

                {showSettings && (
                    <div className="glass-card p-4 mt-2 space-y-4">
                        <div>
                            <label className="text-sm opacity-70 block mb-2">Cycle Length (days)</label>
                            <input
                                type="range"
                                min="21"
                                max="40"
                                value={cycleData.cycleLength}
                                onChange={(e) => setCycleData(prev => ({ ...prev, cycleLength: parseInt(e.target.value) }))}
                                className="w-full"
                            />
                            <div className="text-center text-lg font-semibold">{cycleData.cycleLength} days</div>
                        </div>
                        <div>
                            <label className="text-sm opacity-70 block mb-2">Period Length (days)</label>
                            <input
                                type="range"
                                min="3"
                                max="8"
                                value={cycleData.periodLength}
                                onChange={(e) => setCycleData(prev => ({ ...prev, periodLength: parseInt(e.target.value) }))}
                                className="w-full"
                            />
                            <div className="text-center text-lg font-semibold">{cycleData.periodLength} days</div>
                        </div>
                    </div>
                )}
            </section>
        </main>
    );
}
