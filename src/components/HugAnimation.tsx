'use client';

import { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Heart } from 'lucide-react';
import { useCouple } from '@/context/CoupleContext';

gsap.registerPlugin(useGSAP);

interface HugAnimationProps {
    partnerName?: string;
    onHugSent?: () => void;
}

export default function HugAnimation({ partnerName = 'Partner', onHugSent }: HugAnimationProps) {
    const [isHugging, setIsHugging] = useState(false);
    const [hugCount, setHugCount] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const heartRef = useRef<HTMLDivElement>(null);
    const { sendNotification } = useCouple();

    useGSAP(() => {
        if (!containerRef.current) return;

        gsap.fromTo(containerRef.current,
            { opacity: 0, scale: 0.9 },
            { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.7)' }
        );
    }, { scope: containerRef });

    const sendHug = () => {
        if (isHugging) return;

        setIsHugging(true);
        setHugCount(prev => prev + 1);

        // Haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate([100, 50, 100, 50, 200]);
        }

        // Heart animation
        if (heartRef.current) {
            const tl = gsap.timeline();

            // Pulse the heart
            tl.to(heartRef.current, {
                scale: 1.3,
                duration: 0.2,
                ease: 'power2.out',
            });

            tl.to(heartRef.current, {
                scale: 1,
                duration: 0.3,
                ease: 'elastic.out(1, 0.3)',
            });

            // Create floating hearts
            createFloatingHearts();
        }

        // Send notification to partner
        sendNotification('hug');
        onHugSent?.();

        setTimeout(() => setIsHugging(false), 2000);
    };

    const createFloatingHearts = () => {
        if (!containerRef.current) return;

        const colors = ['#f472b6', '#ec4899', '#db2777', '#be185d', '#9d174d'];

        for (let i = 0; i < 12; i++) {
            const heart = document.createElement('div');
            heart.innerHTML = '💕';
            heart.style.cssText = `
                position: absolute;
                font-size: ${16 + Math.random() * 16}px;
                pointer-events: none;
                z-index: 50;
                left: 50%;
                top: 50%;
            `;
            containerRef.current.appendChild(heart);

            const angle = (Math.PI * 2 * i) / 12;
            const distance = 80 + Math.random() * 60;

            gsap.to(heart, {
                x: Math.cos(angle) * distance,
                y: Math.sin(angle) * distance - 50,
                opacity: 0,
                scale: 0,
                rotation: Math.random() * 360,
                duration: 1 + Math.random() * 0.5,
                ease: 'power2.out',
                onComplete: () => heart.remove(),
            });
        }
    };

    return (
        <div ref={containerRef} className="relative flex flex-col items-center">
            <p className="text-center text-sm opacity-70 mb-4">
                Send a warm hug to {partnerName} 🤗
            </p>

            <button
                onClick={sendHug}
                disabled={isHugging}
                className={`relative w-40 h-40 rounded-full flex items-center justify-center transition-all ${isHugging
                    ? 'bg-gradient-to-br from-pink-400 to-rose-500 scale-110'
                    : 'bg-gradient-to-br from-pink-300 to-rose-400 hover:scale-105'
                    }`}
                style={{
                    boxShadow: isHugging
                        ? '0 0 40px rgba(244, 114, 182, 0.6), 0 0 80px rgba(244, 114, 182, 0.3)'
                        : '0 0 20px rgba(244, 114, 182, 0.3)',
                }}
            >
                {/* Animated rings */}
                {isHugging && (
                    <>
                        <div className="absolute inset-0 rounded-full bg-pink-300 animate-ping opacity-30" />
                        <div
                            className="absolute inset-4 rounded-full bg-pink-300 animate-ping opacity-20"
                            style={{ animationDelay: '0.2s' }}
                        />
                    </>
                )}

                <div ref={heartRef} className="relative z-10 flex flex-col items-center text-white">
                    <span className="text-5xl mb-1">🤗</span>
                    <span className="text-sm font-semibold">
                        {isHugging ? 'Sending...' : 'HUG'}
                    </span>
                </div>
            </button>

            {isHugging && (
                <div className="mt-6 text-center animate-bounce">
                    <p className="text-lg font-semibold text-pink-500">
                        Sending love to {partnerName}! 💕
                    </p>
                    <p className="text-sm opacity-60">
                        They'll feel your warmth ✨
                    </p>
                </div>
            )}

            {hugCount > 0 && !isHugging && (
                <p className="mt-4 text-xs opacity-50">
                    {hugCount} hug{hugCount > 1 ? 's' : ''} sent today 💝
                </p>
            )}
        </div>
    );
}
