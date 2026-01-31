'use client';

import { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Cookie, Check, Bell } from 'lucide-react';
import { useCouple } from '@/context/CoupleContext';

gsap.registerPlugin(useGSAP);

const cravings = [
    { id: 1, emoji: '🍫', label: 'Chocolate', message: 'Sweet comfort incoming!' },
    { id: 2, emoji: '🍦', label: 'Ice Cream', message: 'Cold treat on the way!' },
    { id: 3, emoji: '🍜', label: 'Hot Soup', message: 'Warm and cozy soup!' },
    { id: 4, emoji: '🍕', label: 'Comfort Food', message: 'Your favorites coming up!' },
    { id: 5, emoji: '☕', label: 'Hot Drink', message: 'Cozy drink on the way!' },
    { id: 6, emoji: '🧸', label: 'Cuddles', message: 'Partner is on the way! 🏃‍♂️' },
];

interface SentRequest {
    id: number;
    label: string;
    time: string;
}

export default function CravingAlert() {
    const [sentRequests, setSentRequests] = useState<SentRequest[]>([]);
    const [justSent, setJustSent] = useState<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const { sendNotification } = useCouple();

    useGSAP(() => {
        if (!containerRef.current) return;

        const buttons = containerRef.current.querySelectorAll('.craving-btn');
        gsap.fromTo(buttons,
            { opacity: 0, y: 20, scale: 0.9 },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.5,
                stagger: 0.08,
                ease: 'back.out(1.7)',
            }
        );
    }, { scope: containerRef });

    const sendRequest = (craving: typeof cravings[0]) => {
        // Animate the button
        const button = containerRef.current?.querySelector(`[data-id="${craving.id}"]`);
        if (button) {
            gsap.to(button, {
                scale: 1.2,
                duration: 0.15,
                onComplete: () => {
                    gsap.to(button, {
                        scale: 1,
                        duration: 0.4,
                        ease: 'elastic.out(1, 0.3)',
                    });
                }
            });
        }

        // Add to sent requests
        const newRequest: SentRequest = {
            id: craving.id,
            label: craving.label,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setSentRequests(prev => [newRequest, ...prev.slice(0, 4)]);
        setJustSent(craving.id);

        // Send notification to partner
        sendNotification('craving');

        // Reset "just sent" after animation
        setTimeout(() => setJustSent(null), 2000);
    };

    return (
        <div ref={containerRef} className="w-full max-w-md mx-auto">
            <div className="flex items-center justify-center gap-2 mb-4">
                <Cookie className="w-6 h-6 text-[#BFA054]" />
                <h3 className="text-xl font-semibold">What are you craving?</h3>
            </div>

            <p className="text-sm opacity-60 text-center mb-6">
                One tap and your partner will know! 🚀
            </p>

            {/* Craving Buttons Grid */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                {cravings.map((craving) => (
                    <button
                        key={craving.id}
                        data-id={craving.id}
                        onClick={() => sendRequest(craving)}
                        className={`craving-btn btn-craving flex flex-col items-center gap-2 py-4 ${justSent === craving.id ? 'ring-2 ring-[#BFA054]' : ''
                            }`}
                    >
                        <span className="text-3xl">{craving.emoji}</span>
                        <span className="text-xs font-medium">{craving.label}</span>
                        {justSent === craving.id && (
                            <Check className="absolute top-2 right-2 w-4 h-4 text-[#BFA054]" />
                        )}
                    </button>
                ))}
            </div>

            {/* Confirmation message */}
            {justSent && (
                <div className="empathy-box mb-6 animate-bounce-in">
                    <div className="flex items-center gap-3">
                        <Bell className="w-5 h-5 text-[#BFA054]" />
                        <div>
                            <p className="font-medium">
                                {cravings.find(c => c.id === justSent)?.message}
                            </p>
                            <p className="text-sm opacity-60">
                                Partner has been notified 💕
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Request History */}
            {sentRequests.length > 0 && (
                <div className="glass-card p-4">
                    <p className="text-sm font-medium mb-3 opacity-70">Recent requests:</p>
                    <div className="space-y-2">
                        {sentRequests.map((req, i) => (
                            <div
                                key={`${req.id}-${i}`}
                                className="flex items-center justify-between text-sm opacity-60"
                            >
                                <span>{cravings.find(c => c.id === req.id)?.emoji} {req.label}</span>
                                <span>{req.time}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
