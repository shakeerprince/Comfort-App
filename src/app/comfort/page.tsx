'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import HeatingPad from '@/components/HeatingPad';
import BreathingCircle from '@/components/BreathingCircle';
import { Flame, Sparkles } from 'lucide-react';

gsap.registerPlugin(useGSAP);

const stretchTips = [
    { emoji: '🧘‍♀️', tip: 'Child\'s pose - relieves lower back pressure' },
    { emoji: '🦋', tip: 'Butterfly stretch - opens hips gently' },
    { emoji: '🐱', tip: 'Cat-cow stretch - eases cramping' },
    { emoji: '🌀', tip: 'Gentle twists - helps with bloating' },
    { emoji: '🛋️', tip: 'Legs up the wall - reduces swelling' },
];

export default function ComfortPage() {
    const mainRef = useRef<HTMLDivElement>(null);

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

    return (
        <main ref={mainRef} className="flex-1 px-6 py-8">
            {/* Header */}
            <section className="section text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-3">
                    <Flame className="w-8 h-8 text-orange-400" />
                    <h1 className="text-3xl font-bold text-gradient">Comfort Tools</h1>
                    <Flame className="w-8 h-8 text-orange-400" />
                </div>
                <p className="text-lg opacity-70">
                    Everything you need to feel a little better 💕
                </p>
            </section>

            {/* Heating Pad */}
            <section className="section glass-card p-6 mb-8 max-w-md mx-auto">
                <HeatingPad />
            </section>

            {/* Breathing Exercise */}
            <section className="section glass-card p-6 mb-8 max-w-md mx-auto">
                <BreathingCircle />
            </section>

            {/* Gentle Stretches */}
            <section className="section max-w-md mx-auto">
                <div className="flex items-center justify-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    <h2 className="text-xl font-semibold">Gentle Stretches</h2>
                    <Sparkles className="w-5 h-5 text-purple-400" />
                </div>
                <p className="text-sm text-center opacity-60 mb-4">
                    Only if you feel up to it. Rest is always okay 💜
                </p>

                <div className="space-y-3">
                    {stretchTips.map((stretch, i) => (
                        <div
                            key={i}
                            className="glass-card p-4 flex items-center gap-4"
                        >
                            <span className="text-2xl">{stretch.emoji}</span>
                            <p className="text-sm">{stretch.tip}</p>
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
}
