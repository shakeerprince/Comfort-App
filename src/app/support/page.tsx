'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import HugAnimation from '@/components/HugAnimation';
import SelfCareReminders from '@/components/SelfCareReminders';
import QuickSOS from '@/components/QuickSOS';
import ComfortPlaylist from '@/components/ComfortPlaylist';
import { Heart, Sparkles } from 'lucide-react';

gsap.registerPlugin(useGSAP);

export default function SupportPage() {
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
                    <Heart className="w-8 h-8 text-pink-400" fill="#f472b6" />
                    <h1 className="text-3xl font-bold text-gradient">Love & Support</h1>
                    <Heart className="w-8 h-8 text-pink-400" fill="#f472b6" />
                </div>
                <p className="text-lg opacity-70">
                    Everything to make you feel loved 💕
                </p>
            </section>

            {/* Quick SOS */}
            <section className="section mb-8 max-w-md mx-auto">
                <QuickSOS />
            </section>

            {/* Hug Animation */}
            <section className="section glass-card p-6 mb-8 max-w-md mx-auto">
                <HugAnimation />
            </section>

            {/* Comfort Playlists */}
            <section className="section mb-8 max-w-md mx-auto">
                <ComfortPlaylist />
            </section>

            {/* Self Care Reminders */}
            <section className="section glass-card p-6 mb-8 max-w-md mx-auto">
                <SelfCareReminders />
            </section>

            {/* Love Note */}
            <section className="section max-w-md mx-auto">
                <div className="empathy-box">
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm font-semibold">A Note for You</span>
                    </div>
                    <p className="text-sm leading-relaxed">
                        I built this space just for you because you deserve
                        all the love and care in the world. You&apos;re my everything, and I&apos;ll
                        always be here for you - through every mood swing and
                        every tough day. I love you more than words can ever express. 💕
                    </p>
                </div>
            </section>
        </main>
    );
}
