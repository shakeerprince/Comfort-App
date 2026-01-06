'use client';

import { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Calendar, ChevronLeft, ChevronRight, Droplets, Moon, Sun, AlertCircle } from 'lucide-react';

gsap.registerPlugin(useGSAP);

interface CycleData {
    lastPeriodStart: string | null;
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
        cycleLength: 28,
        periodLength: 5,
    });
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
    const [periodStarted, setPeriodStarted] = useState(false);
    const mainRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Load from localStorage
        const saved = localStorage.getItem('cozycycle-data');
        if (saved) {
            setCycleData(JSON.parse(saved));
        }
    }, []);

    useEffect(() => {
        // Save to localStorage
        localStorage.setItem('cozycycle-data', JSON.stringify(cycleData));
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
        setCycleData(prev => ({ ...prev, lastPeriodStart: today }));
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

    const nextMonth = () => {
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

    return (
        <main ref={mainRef} className="flex-1 px-6 py-8">
            {/* Header */}
            <section className="section text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-3">
                    <Calendar className="w-8 h-8 text-purple-400" />
                    <h1 className="text-3xl font-bold text-gradient">Cycle Tracker</h1>
                    <Calendar className="w-8 h-8 text-purple-400" />
                </div>
                <p className="text-lg opacity-70">
                    Keep track of your cycle, Keerthi 📅
                </p>
            </section>

            {/* Prediction Card */}
            <section className="section cozy-card p-6 mb-8 max-w-md mx-auto text-center">
                {daysUntil !== null && daysUntil > 0 ? (
                    <>
                        <p className="text-sm opacity-70 mb-2">Next period expected in</p>
                        <p className="text-5xl font-bold text-gradient mb-2">{daysUntil}</p>
                        <p className="text-lg">days</p>
                        <p className="text-xs opacity-50 mt-2">
                            Around {nextPeriod?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>

                        {daysUntil <= 3 && (
                            <div className="mt-4 p-3 bg-pink-100 dark:bg-pink-900/30 rounded-xl flex items-center justify-center gap-2">
                                <AlertCircle className="w-4 h-4 text-pink-500" />
                                <span className="text-sm text-pink-600 dark:text-pink-300">
                                    Shaker has been reminded to stock up! 💕
                                </span>
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        <Droplets className="w-12 h-12 mx-auto mb-3 text-rose-400" />
                        <p className="text-lg">
                            {cycleData.lastPeriodStart
                                ? "Period may be here or coming soon!"
                                : "Tap below to start tracking"}
                        </p>
                    </>
                )}
            </section>

            {/* Mark Period Button */}
            <section className="section text-center mb-8 max-w-md mx-auto">
                <button
                    onClick={markPeriodStart}
                    className={`w-full py-4 rounded-2xl font-semibold text-lg transition-all ${periodStarted
                            ? 'bg-green-500 text-white'
                            : 'bg-gradient-to-r from-rose-400 to-pink-500 text-white hover:opacity-90'
                        }`}
                >
                    {periodStarted ? '✓ Period Started - Logged!' : '🩸 Period Started Today'}
                </button>
                {cycleData.lastPeriodStart && (
                    <p className="text-xs opacity-50 mt-2">
                        Last recorded: {new Date(cycleData.lastPeriodStart).toLocaleDateString()}
                    </p>
                )}
            </section>

            {/* Mini Calendar */}
            <section className="section glass-card p-4 mb-8 max-w-md mx-auto">
                <div className="flex items-center justify-between mb-4">
                    <button onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-lg">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h3 className="font-semibold">
                        {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h3>
                    <button onClick={nextMonth} className="p-2 hover:bg-white/10 rounded-lg">
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
                        <div key={`empty-${i}`} className="h-8" />
                    ))}

                    {/* Days of the month */}
                    {Array.from({ length: getDaysInMonth(currentMonth) }).map((_, i) => {
                        const day = i + 1;
                        const isToday = new Date().getDate() === day &&
                            new Date().getMonth() === currentMonth.getMonth() &&
                            new Date().getFullYear() === currentMonth.getFullYear();
                        const isPeriod = isPeriodDay(day);

                        return (
                            <div
                                key={day}
                                className={`h-8 flex items-center justify-center rounded-lg text-sm ${isPeriod
                                        ? 'bg-rose-400 text-white'
                                        : isToday
                                            ? 'bg-purple-400 text-white'
                                            : ''
                                    }`}
                            >
                                {day}
                            </div>
                        );
                    })}
                </div>

                <div className="flex justify-center gap-4 mt-4 text-xs opacity-70">
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded bg-rose-400" />
                        <span>Period</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded bg-purple-400" />
                        <span>Today</span>
                    </div>
                </div>
            </section>

            {/* Symptom Logger */}
            <section className="section max-w-md mx-auto">
                <h3 className="text-lg font-semibold text-center mb-4">Log Today&apos;s Symptoms</h3>
                <div className="grid grid-cols-3 gap-3">
                    {symptoms.map((symptom) => (
                        <button
                            key={symptom.label}
                            onClick={() => toggleSymptom(symptom.label)}
                            className={`glass-card p-3 flex flex-col items-center gap-2 transition-all ${selectedSymptoms.includes(symptom.label)
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
        </main>
    );
}
