'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Wind, Pause, Play } from 'lucide-react';

gsap.registerPlugin(useGSAP);

type Phase = 'inhale' | 'hold' | 'exhale' | 'rest';

const phases: { phase: Phase; duration: number; label: string }[] = [
    { phase: 'inhale', duration: 4, label: 'Breathe in...' },
    { phase: 'hold', duration: 4, label: 'Hold...' },
    { phase: 'exhale', duration: 4, label: 'Breathe out...' },
    { phase: 'rest', duration: 2, label: 'Rest...' },
];

export default function BreathingCircle() {
    const [isActive, setIsActive] = useState(false);
    const [currentPhase, setCurrentPhase] = useState<Phase>('rest');
    const [phaseLabel, setPhaseLabel] = useState('Tap to start');
    const [cycleCount, setCycleCount] = useState(0);

    const containerRef = useRef<HTMLDivElement>(null);
    const circleRef = useRef<HTMLDivElement>(null);
    const innerCircleRef = useRef<HTMLDivElement>(null);
    const timelineRef = useRef<gsap.core.Timeline | null>(null);

    const startBreathing = useCallback(() => {
        if (!circleRef.current || !innerCircleRef.current) return;

        const tl = gsap.timeline({ repeat: -1 });

        phases.forEach(({ phase, duration, label }) => {
            tl.call(() => {
                setCurrentPhase(phase);
                setPhaseLabel(label);
            });

            if (phase === 'inhale') {
                tl.to([circleRef.current, innerCircleRef.current], {
                    scale: 1.5,
                    duration: duration,
                    ease: 'sine.inOut',
                });
            } else if (phase === 'hold') {
                tl.to([circleRef.current, innerCircleRef.current], {
                    scale: 1.5,
                    duration: duration,
                });
            } else if (phase === 'exhale') {
                tl.to([circleRef.current, innerCircleRef.current], {
                    scale: 1,
                    duration: duration,
                    ease: 'sine.inOut',
                });
                tl.call(() => setCycleCount(prev => prev + 1));
            } else if (phase === 'rest') {
                tl.to([circleRef.current, innerCircleRef.current], {
                    scale: 1,
                    duration: duration,
                });
            }
        });

        timelineRef.current = tl;
    }, []);

    const toggleBreathing = () => {
        if (isActive) {
            // Pause
            timelineRef.current?.pause();
            setPhaseLabel('Paused');
        } else {
            if (timelineRef.current) {
                // Resume
                timelineRef.current.resume();
            } else {
                // Start fresh
                startBreathing();
            }
        }
        setIsActive(!isActive);
    };

    const resetBreathing = () => {
        timelineRef.current?.kill();
        timelineRef.current = null;
        setIsActive(false);
        setCurrentPhase('rest');
        setPhaseLabel('Tap to start');
        setCycleCount(0);

        gsap.to([circleRef.current, innerCircleRef.current], {
            scale: 1,
            duration: 0.5,
            ease: 'power2.out',
        });
    };

    useEffect(() => {
        return () => {
            timelineRef.current?.kill();
        };
    }, []);

    useGSAP(() => {
        if (!containerRef.current) return;

        gsap.fromTo(containerRef.current,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
        );
    }, { scope: containerRef });

    const getPhaseColor = () => {
        switch (currentPhase) {
            case 'inhale': return 'from-[#1E2742] to-[#2D3A5E]'; // Royal Blue
            case 'hold': return 'from-[#BFA054] to-[#E3C578]';   // Royal Gold
            case 'exhale': return 'from-[#9A2143] to-[#C44569]'; // Royal Red
            default: return 'from-[#BFA054]/50 to-[#9A2143]/50';
        }
    };

    return (
        <div
            ref={containerRef}
            className="w-full max-w-md mx-auto flex flex-col items-center gap-8"
        >
            <div className="flex items-center gap-2 text-lg">
                <Wind className="w-5 h-5 text-[#BFA054]" />
                <span>Breathing Exercise</span>
            </div>

            {/* Main breathing circle */}
            <div
                className="relative w-48 h-48 cursor-pointer"
                onClick={toggleBreathing}
            >
                {/* Outer glow */}
                <div
                    ref={circleRef}
                    className={`absolute inset-0 rounded-full bg-gradient-to-br ${getPhaseColor()} opacity-30 blur-xl transition-colors duration-1000`}
                />

                {/* Inner circle */}
                <div
                    ref={innerCircleRef}
                    className={`absolute inset-4 rounded-full bg-gradient-to-br ${getPhaseColor()} flex items-center justify-center transition-colors duration-1000 shadow-2xl`}
                >
                    <div className="text-center text-white">
                        {isActive ? (
                            <Pause className="w-8 h-8 mx-auto mb-1" />
                        ) : (
                            <Play className="w-8 h-8 mx-auto mb-1" />
                        )}
                        <p className="text-sm font-medium">{phaseLabel}</p>
                    </div>
                </div>
            </div>

            {/* Cycle counter */}
            {cycleCount > 0 && (
                <p className="text-sm opacity-60">
                    Completed {cycleCount} cycle{cycleCount !== 1 ? 's' : ''} 🧘‍♀️
                </p>
            )}

            {/* Reset button */}
            {(isActive || cycleCount > 0) && (
                <button
                    onClick={resetBreathing}
                    className="text-sm opacity-60 hover:opacity-100 transition-opacity underline"
                >
                    Reset
                </button>
            )}

            <p className="text-sm text-center opacity-50 max-w-xs">
                Focus on your breath. Let the circle guide you through a calming rhythm.
            </p>
        </div>
    );
}
