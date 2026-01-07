'use client';

import { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Phone, Heart, AlertTriangle, Frown, HeartCrack, MessageCircle } from 'lucide-react';
import { useCouple } from '@/context/CoupleContext';

gsap.registerPlugin(useGSAP);

interface SOSOption {
    emoji: string;
    label: string;
    message: string;
    color: string;
    action: 'call' | 'notify';
}

const sosOptions: SOSOption[] = [
    {
        emoji: "📞",
        label: "Call Shaker NOW",
        message: "Calling Shaker immediately...",
        color: "from-red-500 to-rose-600",
        action: "call"
    },
    {
        emoji: "😢",
        label: "Having a bad day",
        message: "Notifying Shaker you need comfort...",
        color: "from-blue-400 to-indigo-500",
        action: "notify"
    },
    {
        emoji: "🤗",
        label: "Need a hug",
        message: "Sending virtual hug request...",
        color: "from-pink-400 to-rose-500",
        action: "notify"
    },
    {
        emoji: "💔",
        label: "Feeling anxious",
        message: "Alerting Shaker that you need support...",
        color: "from-purple-400 to-violet-500",
        action: "notify"
    },
];

export default function QuickSOS() {
    const [showConfirmation, setShowConfirmation] = useState<string | null>(null);
    const [actionTaken, setActionTaken] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const { sendNotification } = useCouple();

    // Shaker's phone number
    const SHAKER_PHONE = "8688031427";

    useGSAP(() => {
        if (!containerRef.current) return;
        gsap.fromTo(containerRef.current,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
        );
    }, { scope: containerRef });

    const handleSOS = (option: SOSOption) => {
        if (option.action === 'call') {
            // Initiate phone call
            window.location.href = `tel:${SHAKER_PHONE}`;
            setActionTaken(true);
        } else {
            // Send notification to Shaker
            sendNotification('hug'); // Using hug type for all SOS notifications
            setShowConfirmation(option.message);
            setActionTaken(true);

            // Show browser notification
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('SOS Sent! 💕', {
                    body: option.message,
                    icon: '/icon-192.png'
                });
            }

            setTimeout(() => {
                setShowConfirmation(null);
            }, 3000);
        }
    };

    const resetSOS = () => {
        setActionTaken(false);
        setShowConfirmation(null);
    };

    return (
        <div ref={containerRef} className="w-full space-y-4">
            <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-6 h-6 text-red-400" />
                <h3 className="text-lg font-semibold">Quick SOS</h3>
                <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full">Emergency</span>
            </div>

            {showConfirmation ? (
                <div className="glass-card p-6 text-center bg-green-500/20 border border-green-400/30">
                    <span className="text-5xl mb-4 block">✓</span>
                    <h4 className="text-xl font-semibold text-green-400 mb-2">Sent!</h4>
                    <p className="opacity-70">{showConfirmation}</p>
                    <p className="text-sm mt-3 opacity-60">Shaker will be there for you soon 💕</p>
                    <button
                        onClick={resetSOS}
                        className="mt-4 px-6 py-2 bg-green-500/20 rounded-xl text-green-400 text-sm"
                    >
                        Done
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-3">
                    {sosOptions.map((option, index) => (
                        <button
                            key={index}
                            onClick={() => handleSOS(option)}
                            className={`glass-card p-4 flex flex-col items-center gap-2 transition-all active:scale-95 hover:scale-105
                                ${option.action === 'call' ? 'col-span-2 bg-gradient-to-r ' + option.color + ' text-white' : ''}`}
                        >
                            <span className={`text-3xl ${option.action === 'call' ? 'animate-pulse' : ''}`}>
                                {option.emoji}
                            </span>
                            <span className="font-medium text-sm">{option.label}</span>
                            {option.action === 'call' && (
                                <span className="text-xs opacity-80 flex items-center gap-1">
                                    <Phone className="w-3 h-3" /> Tap to call immediately
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            )}

            {/* Emergency Message */}
            <div className="glass-card p-4 bg-pink-500/10 border border-pink-400/20">
                <div className="flex items-center gap-3">
                    <Heart className="w-8 h-8 text-pink-400" />
                    <div>
                        <p className="font-medium">Remember, Keerthi...</p>
                        <p className="text-sm opacity-70">Shaker is always just one tap away. You&apos;re never alone. 💕</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
