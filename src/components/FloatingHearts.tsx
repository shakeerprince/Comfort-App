'use client';

import { useEffect, useState } from 'react';

interface FloatingHeart {
    id: number;
    x: number;
    y: number;
    size: number;
    duration: number;
    delay: number;
    emoji: string;
}

const heartEmojis = ['💕', '💖', '💗', '✨', '🌸', '💝', '💓'];

export default function FloatingHearts() {
    const [hearts, setHearts] = useState<FloatingHeart[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);

        // Generate initial hearts
        const initialHearts: FloatingHeart[] = Array.from({ length: 15 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: 14 + Math.random() * 12,
            duration: 15 + Math.random() * 20,
            delay: Math.random() * 10,
            emoji: heartEmojis[Math.floor(Math.random() * heartEmojis.length)],
        }));

        setHearts(initialHearts);
    }, []);

    if (!mounted) return null;

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            {hearts.map((heart) => (
                <div
                    key={heart.id}
                    className="absolute animate-float-gentle opacity-20"
                    style={{
                        left: `${heart.x}%`,
                        top: `${heart.y}%`,
                        fontSize: `${heart.size}px`,
                        animation: `float-gentle ${heart.duration}s ease-in-out infinite`,
                        animationDelay: `${heart.delay}s`,
                    }}
                >
                    {heart.emoji}
                </div>
            ))}

            <style jsx>{`
                @keyframes float-gentle {
                    0%, 100% {
                        transform: translateY(0) translateX(0) rotate(0deg);
                    }
                    25% {
                        transform: translateY(-20px) translateX(10px) rotate(5deg);
                    }
                    50% {
                        transform: translateY(-10px) translateX(-5px) rotate(-3deg);
                    }
                    75% {
                        transform: translateY(-25px) translateX(5px) rotate(3deg);
                    }
                }
            `}</style>
        </div>
    );
}
