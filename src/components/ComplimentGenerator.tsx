'use client';

import { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Sparkles, RefreshCw } from 'lucide-react';

gsap.registerPlugin(useGSAP);

const compliments = [
    "You're the most beautiful person I know, inside and out 💕",
    "Your laugh is my favorite sound in the world 🎵",
    "Being with you feels like magic ✨",
    "You make everything better just by being you 🌸",
    "Your smile could light up the entire universe 🌟",
    "I fall more in love with you every single day 💖",
    "You're not just my partner, you're my best friend 💑",
    "Every moment with you is a treasure 💎",
    "You're the reason I believe in soulmates 💫",
    "Your kindness makes the world a better place 🌍",
    "I'm so lucky to have you in my life 🍀",
    "You're stronger than you know, and I'm so proud of you 💪",
    "Your hugs are my safe place 🤗",
    "You're my favorite notification 📱💕",
    "Nothing compares to you 👑",
    "You're the best thing that ever happened to me 🎁",
    "I love the way your eyes light up when you're happy ✨",
    "You deserve all the happiness in the world 🌈",
    "Being loved by you is my greatest blessing 🙏",
    "You're my today and all of my tomorrows 💒",
];

export default function ComplimentGenerator() {
    const [compliment, setCompliment] = useState('');
    const [isAnimating, setIsAnimating] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLParagraphElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        // Set initial compliment
        setCompliment(compliments[Math.floor(Math.random() * compliments.length)]);
    }, []);

    useGSAP(() => {
        if (!containerRef.current) return;

        // Entry animation
        gsap.fromTo(containerRef.current,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
        );
    }, { scope: containerRef });

    const generateNewCompliment = () => {
        if (isAnimating) return;
        setIsAnimating(true);

        // Spin button
        gsap.to(buttonRef.current, {
            rotation: '+=360',
            duration: 0.5,
            ease: 'power2.out',
        });

        // Fade out current compliment
        gsap.to(textRef.current, {
            opacity: 0,
            y: -20,
            duration: 0.3,
            ease: 'power2.in',
            onComplete: () => {
                // Get new random compliment
                let newCompliment;
                do {
                    newCompliment = compliments[Math.floor(Math.random() * compliments.length)];
                } while (newCompliment === compliment && compliments.length > 1);

                setCompliment(newCompliment);

                // Fade in new compliment
                gsap.fromTo(textRef.current,
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.4,
                        ease: 'back.out(1.7)',
                        onComplete: () => setIsAnimating(false)
                    }
                );

                // Heart burst effect
                createHeartBurst();
            }
        });
    };

    const createHeartBurst = () => {
        if (!containerRef.current) return;

        const container = containerRef.current;
        const hearts = ['💕', '💖', '💗', '💝', '✨'];

        for (let i = 0; i < 8; i++) {
            const heart = document.createElement('span');
            heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
            heart.className = 'absolute text-2xl pointer-events-none';
            heart.style.left = '50%';
            heart.style.top = '50%';
            container.appendChild(heart);

            const angle = (i / 8) * Math.PI * 2;
            const distance = 60 + Math.random() * 40;

            gsap.fromTo(heart,
                {
                    x: 0,
                    y: 0,
                    scale: 0,
                    opacity: 1
                },
                {
                    x: Math.cos(angle) * distance,
                    y: Math.sin(angle) * distance,
                    scale: 1,
                    opacity: 0,
                    duration: 0.8,
                    ease: 'power2.out',
                    onComplete: () => heart.remove(),
                }
            );
        }
    };

    return (
        <div
            ref={containerRef}
            className="relative w-full max-w-md mx-auto glass-card p-8 text-center overflow-visible"
        >
            <div className="flex items-center justify-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                <span className="text-sm font-medium opacity-70">For You</span>
                <Sparkles className="w-5 h-5 text-yellow-400" />
            </div>

            <p
                ref={textRef}
                className="text-xl font-medium leading-relaxed mb-6 min-h-[4rem]"
            >
                {compliment}
            </p>

            <button
                ref={buttonRef}
                onClick={generateNewCompliment}
                disabled={isAnimating}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full text-white font-medium hover:shadow-lg hover:shadow-pink-500/30 transition-shadow disabled:opacity-50"
            >
                <RefreshCw className="w-4 h-4" />
                More Love
            </button>
        </div>
    );
}
