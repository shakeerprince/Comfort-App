'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import CravingAlert from '@/components/CravingAlert';
import { Cookie, Heart } from 'lucide-react';

gsap.registerPlugin(useGSAP);

export default function CravingsPage() {
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
                    <Cookie className="w-8 h-8 text-amber-400" />
                    <h1 className="text-3xl font-bold text-gradient">Craving Something?</h1>
                    <Cookie className="w-8 h-8 text-amber-400" />
                </div>
                <p className="text-lg opacity-70">
                    Tell Shaker what you need! 🚀
                </p>
            </section>

            {/* Craving Alert System */}
            <section className="section glass-card p-6 mb-8 max-w-md mx-auto">
                <CravingAlert />
            </section>

            {/* How it works */}
            <section className="section max-w-md mx-auto">
                <div className="empathy-box">
                    <div className="flex items-start gap-3">
                        <Heart className="w-5 h-5 text-pink-400 flex-shrink-0 mt-1" fill="#f472b6" />
                        <div>
                            <p className="font-medium mb-2">How this works:</p>
                            <ol className="text-sm opacity-80 space-y-1 list-decimal list-inside">
                                <li>Tap what you&apos;re craving</li>
                                <li>Shaker gets notified instantly</li>
                                <li>Help is on the way! 🏃‍♂️💨</li>
                            </ol>
                            <p className="text-xs opacity-60 mt-3">
                                (Shaker monitors this very closely during your period 😊)
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
