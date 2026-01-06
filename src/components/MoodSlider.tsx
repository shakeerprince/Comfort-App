'use client';

import { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

interface MoodOption {
    emoji: string;
    label: string;
    message: string;
}

const moods: MoodOption[] = [
    { emoji: '😢', label: 'Sad', message: "It's okay to feel sad. I'm here for you 💕" },
    { emoji: '😣', label: 'Pain', message: 'Sending you all my warmth and comfort 🫂' },
    { emoji: '🥰', label: 'Cuddly', message: "I wish I could hug you right now! 💝" },
];

export default function MoodSlider() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [selectedMood, setSelectedMood] = useState<number | null>(null);
    const [message, setMessage] = useState<string>('');
    const messageRef = useRef<HTMLParagraphElement>(null);

    useGSAP(() => {
        if (!containerRef.current) return;

        const buttons = containerRef.current.querySelectorAll('.mood-btn');

        // Stagger entry animation
        gsap.fromTo(buttons,
            { opacity: 0, y: 30, scale: 0.8 },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.6,
                stagger: 0.15,
                delay: 1.2,
                ease: 'back.out(1.7)',
            }
        );
    }, { scope: containerRef });

    const handleMoodClick = (index: number) => {
        if (!containerRef.current) return;

        const buttons = containerRef.current.querySelectorAll('.mood-btn');

        // Animate all buttons
        buttons.forEach((btn, i) => {
            if (i === index) {
                // Selected button - bounce up with elastic
                gsap.to(btn, {
                    scale: 1.3,
                    duration: 0.5,
                    ease: 'elastic.out(1, 0.3)',
                });
                gsap.to(btn, {
                    backgroundColor: 'rgba(236, 64, 122, 0.2)',
                    borderColor: '#ec407a',
                    duration: 0.3,
                });
            } else {
                // Other buttons - shrink and fade
                gsap.to(btn, {
                    scale: 0.9,
                    opacity: 0.5,
                    duration: 0.4,
                    ease: 'power2.out',
                });
            }
        });

        setSelectedMood(index);
        setMessage(moods[index].message);

        // Animate message in
        if (messageRef.current) {
            gsap.fromTo(messageRef.current,
                { opacity: 0, y: 20, scale: 0.9 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.5,
                    delay: 0.2,
                    ease: 'back.out(1.7)',
                }
            );
        }
    };

    const resetSelection = () => {
        if (!containerRef.current) return;

        const buttons = containerRef.current.querySelectorAll('.mood-btn');

        buttons.forEach((btn) => {
            gsap.to(btn, {
                scale: 1,
                opacity: 1,
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                borderColor: 'transparent',
                duration: 0.4,
                ease: 'power2.out',
            });
        });

        setSelectedMood(null);
        setMessage('');
    };

    return (
        <div ref={containerRef} className="w-full max-w-md mx-auto">
            <p className="text-center text-lg mb-6 opacity-80">
                How are you feeling right now? 💭
            </p>

            <div className="flex justify-center gap-4 mb-6">
                {moods.map((mood, index) => (
                    <button
                        key={index}
                        className="mood-btn emoji-btn flex flex-col items-center gap-2"
                        onClick={() => selectedMood === index ? resetSelection() : handleMoodClick(index)}
                        aria-label={mood.label}
                    >
                        <span className="text-4xl">{mood.emoji}</span>
                        <span className="text-sm font-medium opacity-70">{mood.label}</span>
                    </button>
                ))}
            </div>

            {message && (
                <p
                    ref={messageRef}
                    className="text-center text-xl font-medium text-gradient px-4 py-3"
                >
                    {message}
                </p>
            )}
        </div>
    );
}
