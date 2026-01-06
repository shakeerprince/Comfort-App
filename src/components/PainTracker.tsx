'use client';

import { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Heart } from 'lucide-react';
import { useCouple } from '@/context/CoupleContext';

gsap.registerPlugin(useGSAP);

const painResponses = [
    { level: 1, emoji: '😊', message: "Feeling okay! That's wonderful 💕" },
    { level: 2, emoji: '🙂', message: "Just a little uncomfortable. You've got this!" },
    { level: 3, emoji: '😐', message: "Mild discomfort. Take it easy, okay?" },
    { level: 4, emoji: '😕', message: "I see you're uncomfortable. Sending hugs 🤗" },
    { level: 5, emoji: '😣', message: "Halfway there. You're doing so well, Keerthi" },
    { level: 6, emoji: '😢', message: "I wish I could take this pain away 💕" },
    { level: 7, emoji: '😥', message: "You're so strong. I'm proud of you 💪" },
    { level: 8, emoji: '😭', message: "I'm here with you. You're not alone ❤️" },
    { level: 9, emoji: '🥺', message: "My brave girl. This will pass, I promise" },
    { level: 10, emoji: '💔', message: "I love you so much. Call me? I'm here 📞" },
];

export default function PainTracker() {
    const [painLevel, setPainLevel] = useState(1);
    const [lastNotifiedLevel, setLastNotifiedLevel] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const responseRef = useRef<HTMLDivElement>(null);
    const { sendNotification } = useCouple();

    const currentResponse = painResponses.find(r => r.level === painLevel) || painResponses[0];

    useGSAP(() => {
        if (!containerRef.current) return;

        gsap.fromTo(containerRef.current,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
        );
    }, { scope: containerRef });

    const handlePainChange = (newLevel: number) => {
        setPainLevel(newLevel);

        // Send notification if pain is high (5+) and not already notified at this level
        if (newLevel >= 5 && newLevel > lastNotifiedLevel) {
            sendNotification('pain');
            setLastNotifiedLevel(newLevel);
        }

        if (responseRef.current) {
            gsap.fromTo(responseRef.current,
                { opacity: 0, scale: 0.95 },
                { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(1.7)' }
            );
        }
    };

    const getPainColor = () => {
        if (painLevel <= 3) return 'text-green-500';
        if (painLevel <= 5) return 'text-yellow-500';
        if (painLevel <= 7) return 'text-orange-500';
        return 'text-red-500';
    };

    return (
        <div ref={containerRef} className="w-full max-w-md mx-auto">
            <div className="text-center mb-6">
                <p className="text-lg opacity-80 mb-2">
                    How are you feeling right now, Keerthi?
                </p>
                <p className="text-sm opacity-60">
                    Be honest - there&apos;s no judgment here 💕
                </p>
            </div>

            {/* Pain Level Display */}
            <div className="text-center mb-6">
                <span className="text-6xl mb-2 block">{currentResponse.emoji}</span>
                <span className={`text-4xl font-bold ${getPainColor()}`}>
                    {painLevel}/10
                </span>
            </div>

            {/* Slider */}
            <div className="relative mb-8 px-2">
                <input
                    type="range"
                    min="1"
                    max="10"
                    value={painLevel}
                    onChange={(e) => handlePainChange(parseInt(e.target.value))}
                    className="pain-slider w-full cursor-pointer"
                />
                <div className="flex justify-between mt-2 text-xs opacity-50">
                    <span>Feeling good</span>
                    <span>Hurting a lot</span>
                </div>
            </div>

            {/* Empathetic Response */}
            <div
                ref={responseRef}
                className="empathy-box"
            >
                <div className="flex items-start gap-3">
                    <Heart className="w-5 h-5 text-pink-400 flex-shrink-0 mt-0.5" fill="#f472b6" />
                    <div>
                        <p className="font-medium text-lg">{currentResponse.message}</p>
                        <p className="text-sm opacity-60 mt-1">- Shaker 💕</p>
                    </div>
                </div>
            </div>

            {/* High pain alert */}
            {painLevel >= 8 && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 text-center">
                    <p className="text-red-600 dark:text-red-300 font-medium">
                        High pain detected 💔
                    </p>
                    <p className="text-sm text-red-500 dark:text-red-400 mt-1">
                        Please take your medicine if needed. Should I alert Shaker?
                    </p>
                    <a
                        href="tel:8688031427"
                        className="mt-3 px-6 py-2 bg-red-500 text-white rounded-full text-sm font-medium hover:bg-red-600 transition-colors inline-block"
                    >
                        📞 Call Shaker Now
                    </a>
                </div>
            )}
        </div>
    );
}
