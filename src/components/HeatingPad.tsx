'use client';

import { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Flame, Power } from 'lucide-react';

gsap.registerPlugin(useGSAP);

export default function HeatingPad() {
    const [isOn, setIsOn] = useState(false);
    const [warmthLevel, setWarmthLevel] = useState(2); // 1-3
    const containerRef = useRef<HTMLDivElement>(null);
    const padRef = useRef<HTMLButtonElement>(null);
    const glowRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (!containerRef.current) return;

        gsap.fromTo(containerRef.current,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
        );
    }, { scope: containerRef });

    const togglePad = () => {
        const newState = !isOn;
        setIsOn(newState);

        if (padRef.current && glowRef.current) {
            if (newState) {
                // Turn on - warm up animation
                gsap.to(padRef.current, {
                    scale: 1.02,
                    duration: 0.5,
                    ease: 'power2.out',
                });

                gsap.to(glowRef.current, {
                    opacity: 1,
                    scale: 1.1,
                    duration: 1,
                    ease: 'power2.out',
                });

                // Continuous pulsing glow
                gsap.to(glowRef.current, {
                    scale: 1.15,
                    opacity: 0.8,
                    duration: 2,
                    repeat: -1,
                    yoyo: true,
                    ease: 'sine.inOut',
                    delay: 1,
                });
            } else {
                // Turn off - cool down
                gsap.killTweensOf(glowRef.current);

                gsap.to(padRef.current, {
                    scale: 1,
                    duration: 0.5,
                });

                gsap.to(glowRef.current, {
                    opacity: 0,
                    scale: 1,
                    duration: 0.5,
                });
            }
        }
    };

    const getWarmthColor = () => {
        switch (warmthLevel) {
            case 1: return 'from-orange-200 to-orange-300';
            case 2: return 'from-orange-300 to-orange-400';
            case 3: return 'from-orange-400 to-red-400';
            default: return 'from-orange-300 to-orange-400';
        }
    };

    const getWarmthLabel = () => {
        switch (warmthLevel) {
            case 1: return 'Gentle warmth';
            case 2: return 'Cozy warmth';
            case 3: return 'Extra warm';
            default: return 'Cozy warmth';
        }
    };

    return (
        <div ref={containerRef} className="w-full max-w-md mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
                <Flame className={`w-6 h-6 ${isOn ? 'text-orange-500' : 'opacity-40'}`} />
                <h3 className="text-xl font-semibold">Virtual Heating Pad</h3>
            </div>

            <p className="text-sm opacity-60 mb-6">
                Tap to feel the warmth. Imagine it soothing your tummy 💕
            </p>

            {/* Heating Pad Visual */}
            <div className="relative inline-block mb-6">
                {/* Glow effect */}
                <div
                    ref={glowRef}
                    className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${getWarmthColor()} blur-2xl opacity-0`}
                    style={{ transform: 'scale(1.2)' }}
                />

                {/* The pad */}
                <button
                    ref={padRef}
                    onClick={togglePad}
                    className={`relative w-48 h-48 rounded-3xl transition-all duration-500 ${isOn
                        ? `heating-pad animate-glow`
                        : 'heating-pad-off'
                        }`}
                >
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                        <Power className={`w-12 h-12 mb-2 ${isOn ? 'opacity-100' : 'opacity-50'}`} />
                        <span className="font-semibold text-lg">
                            {isOn ? 'ON' : 'Tap to warm up'}
                        </span>
                    </div>
                </button>
            </div>

            {/* Warmth level control */}
            {isOn && (
                <div className="space-y-4">
                    <p className="text-warm font-medium">{getWarmthLabel()}</p>

                    <div className="flex justify-center gap-3">
                        {[1, 2, 3].map((level) => (
                            <button
                                key={level}
                                onClick={() => setWarmthLevel(level)}
                                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${warmthLevel >= level
                                    ? 'bg-gradient-to-br from-orange-400 to-red-400 text-white scale-110'
                                    : 'bg-white/20 opacity-50'
                                    }`}
                            >
                                <Flame className="w-5 h-5" />
                            </button>
                        ))}
                    </div>

                    <p className="text-sm opacity-50">
                        Adjust warmth level
                    </p>
                </div>
            )}

            {/* Cozy message */}
            {isOn && (
                <div className="mt-6 empathy-box text-left">
                    <p className="text-sm">
                        🧡 Close your eyes and imagine this warmth hugging your tummy.
                        You&apos;re safe, you&apos;re loved, and this will pass.
                        <span className="opacity-60"> - Shaker</span>
                    </p>
                </div>
            )}
        </div>
    );
}
