'use client';

import { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Heart, Candy, Coffee } from 'lucide-react';

gsap.registerPlugin(useGSAP);

const emergencies = [
    { icon: '🍫', label: 'Chocolate', message: 'Chocolate delivery requested! 🚀' },
    { icon: '🤗', label: 'Cuddles', message: 'Virtual cuddles incoming! 💕' },
    { icon: '☕', label: 'Hot drink', message: 'Cozy drink on the way! ☕' },
];

export default function SOSButton() {
    const containerRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [activated, setActivated] = useState(false);
    const [selectedEmergency, setSelectedEmergency] = useState<number | null>(null);

    useGSAP(() => {
        if (!buttonRef.current) return;

        // Entry animation
        gsap.fromTo(buttonRef.current,
            { opacity: 0, scale: 0.5, y: 30 },
            {
                opacity: 1,
                scale: 1,
                y: 0,
                duration: 0.8,
                delay: 2.2,
                ease: 'elastic.out(1, 0.5)',
            }
        );

        // Continuous heartbeat animation
        gsap.to(buttonRef.current, {
            scale: 1.05,
            duration: 0.8,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            delay: 3,
        });
    }, { scope: containerRef });

    const handleSOSClick = () => {
        if (activated) return;

        // Big bounce on click
        gsap.to(buttonRef.current, {
            scale: 1.2,
            duration: 0.15,
            ease: 'power2.out',
            onComplete: () => {
                gsap.to(buttonRef.current, {
                    scale: 1,
                    duration: 0.6,
                    ease: 'elastic.out(1, 0.3)',
                });
            }
        });

        setActivated(true);
    };

    const handleEmergencySelect = (index: number) => {
        setSelectedEmergency(index);

        // Animate selection
        const cards = containerRef.current?.querySelectorAll('.emergency-card');
        if (cards) {
            cards.forEach((card, i) => {
                if (i === index) {
                    gsap.to(card, {
                        scale: 1.1,
                        backgroundColor: 'rgba(154, 33, 67, 0.3)', // Burgundy
                        duration: 0.3,
                        ease: 'back.out(1.7)',
                    });
                } else {
                    gsap.to(card, {
                        scale: 0.9,
                        opacity: 0.5,
                        duration: 0.3,
                    });
                }
            });
        }

        // Reset after showing message
        setTimeout(() => {
            setActivated(false);
            setSelectedEmergency(null);

            if (cards) {
                cards.forEach((card) => {
                    gsap.to(card, {
                        scale: 1,
                        opacity: 1,
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        duration: 0.3,
                    });
                });
            }
        }, 3000);
    };

    return (
        <div ref={containerRef} className="w-full max-w-md mx-auto flex flex-col items-center">
            <p className="text-center text-lg mb-6 opacity-80">
                Need something urgently? 🆘
            </p>

            {!activated ? (
                <button
                    ref={buttonRef}
                    onClick={handleSOSClick}
                    className="sos-button"
                    aria-label="SOS - I need comfort"
                >
                    <Heart className="w-8 h-8" fill="white" />
                    <span>SOS</span>
                </button>
            ) : selectedEmergency === null ? (
                <div className="flex gap-4 animate-in fade-in duration-300">
                    {emergencies.map((item, index) => (
                        <button
                            key={index}
                            className="emergency-card glass-card p-4 flex flex-col items-center gap-2 cursor-pointer transition-all"
                            onClick={() => handleEmergencySelect(index)}
                        >
                            <span className="text-3xl">{item.icon}</span>
                            <span className="text-sm font-medium">{item.label}</span>
                        </button>
                    ))}
                </div>
            ) : (
                <div className="glass-card p-6 text-center animate-in fade-in zoom-in duration-300">
                    <span className="text-5xl mb-4 block">
                        {emergencies[selectedEmergency].icon}
                    </span>
                    <p className="text-xl font-semibold text-gradient">
                        {emergencies[selectedEmergency].message}
                    </p>
                    <p className="text-sm mt-2 opacity-70">
                        Your request has been noted! 💕
                    </p>
                </div>
            )}

            {!activated && (
                <p className="text-sm text-center mt-4 opacity-60">
                    This button has a heartbeat because it&apos;s waiting for you 💓
                </p>
            )}
        </div>
    );
}
