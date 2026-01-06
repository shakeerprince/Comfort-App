'use client';

import { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Heart, Sparkles } from 'lucide-react';

gsap.registerPlugin(useGSAP);

interface DayCounterProps {
    startDate: Date;
    label?: string;
}

export default function DayCounter({
    startDate,
    label = "Days of love"
}: DayCounterProps) {
    const [days, setDays] = useState(0);
    const counterRef = useRef<HTMLDivElement>(null);
    const numberRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const now = new Date();
        const diff = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        setDays(Math.max(0, diff));
    }, [startDate]);

    useGSAP(() => {
        if (!counterRef.current || !numberRef.current) return;

        // Entry animation
        gsap.fromTo(counterRef.current,
            { opacity: 0, scale: 0.8 },
            { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.7)' }
        );

        // Number counting animation
        gsap.fromTo(numberRef.current,
            { innerText: 0 },
            {
                innerText: days,
                duration: 2,
                ease: 'power2.out',
                snap: { innerText: 1 },
                delay: 0.3,
            }
        );

        // Sparkle animation
        const sparkles = counterRef.current.querySelectorAll('.sparkle');
        sparkles.forEach((sparkle, i) => {
            gsap.to(sparkle, {
                scale: 1.3,
                opacity: 0.5,
                duration: 1 + Math.random() * 0.5,
                repeat: -1,
                yoyo: true,
                delay: i * 0.3,
                ease: 'sine.inOut',
            });
        });
    }, { scope: counterRef, dependencies: [days] });

    return (
        <div
            ref={counterRef}
            className="relative inline-flex flex-col items-center gap-2 px-8 py-6 glass-card"
        >
            {/* Decorative sparkles */}
            <Sparkles className="sparkle absolute top-2 left-4 w-4 h-4 text-yellow-400" />
            <Sparkles className="sparkle absolute top-4 right-6 w-3 h-3 text-pink-400" />
            <Sparkles className="sparkle absolute bottom-3 left-6 w-3 h-3 text-purple-400" />

            <div className="flex items-center gap-2">
                <Heart className="w-6 h-6 text-red-500" fill="#ef4444" />
                <span className="text-sm font-medium opacity-70">{label}</span>
                <Heart className="w-6 h-6 text-red-500" fill="#ef4444" />
            </div>

            <div className="text-5xl font-bold text-gradient">
                <span ref={numberRef}>0</span>
            </div>

            <p className="text-sm opacity-60 text-center">
                and counting... ✨
            </p>
        </div>
    );
}
