'use client';

import { useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useCouple, UserRole } from '@/context/CoupleContext';
import { ArrowRight, Heart } from 'lucide-react';

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
            <div className="text-center max-w-md w-full">
                <div className="animate-in mb-8">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Heart className="w-8 h-8 text-pink-400" fill="#f472b6" />
                        <span className="text-5xl">💕</span>
                        <Heart className="w-8 h-8 text-pink-400" fill="#f472b6" />
                    </div>
                    <h1 className="text-3xl font-bold text-gradient">Welcome to Comfort App</h1>
                    <p className="text-lg opacity-70 mt-2">Who are you?</p>
                </div>

                <div className="animate-in space-y-4">
                    {/* Keerthi Button */}
                    <button
                        onClick={() => handleSelect('keerthi')}
                        className="w-full glass-card p-4 flex items-center gap-4 hover:scale-[1.02] transition-transform group active:scale-98"
                    >
                        <div className="relative w-20 h-20 rounded-2xl overflow-hidden ring-4 ring-pink-400/50">
                            <Image
                                src="/keerthi.jpg"
                                alt="Keerthi"
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                        <div className="text-left flex-1">
                            <p className="text-xl font-bold text-gradient">I&apos;m Keerthi</p>
                            <p className="text-sm opacity-60">The Queen 👑💕</p>
                        </div>
                        <ArrowRight className="w-6 h-6 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </button>

                    {/* Shaker Button */}
                    <button
                        onClick={() => handleSelect('shaker')}
                        className="w-full glass-card p-4 flex items-center gap-4 hover:scale-[1.02] transition-transform group active:scale-98"
                    >
                        <div className="relative w-20 h-20 rounded-2xl overflow-hidden ring-4 ring-blue-400/50">
                            <Image
                                src="/shaker.jpg"
                                alt="Shaker"
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                        <div className="text-left flex-1">
                            <p className="text-xl font-bold text-gradient">I&apos;m Shaker</p>
                            <p className="text-sm opacity-60">Her Protector 🛡️💪</p>
                        </div>
                        <ArrowRight className="w-6 h-6 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </button>
                </div>

                <p className="animate-in text-xs opacity-40 mt-8">
                    This connects you with your partner in real-time 💕
                </p>

                <div className="animate-in mt-6 text-center">
                    <p className="text-sm opacity-50">Made with ❤️ by Shaker for Keerthi</p>
                </div>
            </div>
        </div>
    );
}
