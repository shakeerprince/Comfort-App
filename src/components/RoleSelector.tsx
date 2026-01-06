'use client';

import { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useCouple, UserRole } from '@/context/CoupleContext';
import { User, Heart, ArrowRight } from 'lucide-react';

gsap.registerPlugin(useGSAP);

interface RoleSelectorProps {
    onSelect: () => void;
}

export default function RoleSelector({ onSelect }: RoleSelectorProps) {
    const { setMyRole } = useCouple();
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (!containerRef.current) return;

        const elements = containerRef.current.querySelectorAll('.animate-in');
        gsap.fromTo(elements,
            { opacity: 0, y: 30, scale: 0.9 },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.6,
                stagger: 0.15,
                ease: 'back.out(1.7)',
            }
        );
    }, { scope: containerRef });

    const handleSelect = (role: UserRole) => {
        setMyRole(role);
        onSelect();
    };

    return (
        <div ref={containerRef} className="min-h-screen flex items-center justify-center p-6">
            <div className="text-center max-w-md">
                <div className="animate-in mb-8">
                    <span className="text-6xl">🌸</span>
                    <h1 className="text-3xl font-bold text-gradient mt-4">Welcome to Comfort App</h1>
                    <p className="text-lg opacity-70 mt-2">Who are you?</p>
                </div>

                <div className="animate-in space-y-4">
                    <button
                        onClick={() => handleSelect('keerthi')}
                        className="w-full glass-card p-6 flex items-center gap-4 hover:scale-102 transition-transform group"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center">
                            <span className="text-3xl">👸</span>
                        </div>
                        <div className="text-left flex-1">
                            <p className="text-xl font-bold">I&apos;m Keerthi</p>
                            <p className="text-sm opacity-60">The queen 👑</p>
                        </div>
                        <ArrowRight className="w-6 h-6 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </button>

                    <button
                        onClick={() => handleSelect('shaker')}
                        className="w-full glass-card p-6 flex items-center gap-4 hover:scale-102 transition-transform group"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                            <span className="text-3xl">🤴</span>
                        </div>
                        <div className="text-left flex-1">
                            <p className="text-xl font-bold">I&apos;m Shaker</p>
                            <p className="text-sm opacity-60">Her protector 🛡️</p>
                        </div>
                        <ArrowRight className="w-6 h-6 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </button>
                </div>

                <p className="animate-in text-xs opacity-40 mt-8">
                    This connects you with your partner in real-time 💕
                </p>
            </div>
        </div>
    );
}
