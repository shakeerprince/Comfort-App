'use client';

import { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useCouple, VibeStatus } from '@/context/CoupleContext';
import { Heart, Zap, MapPin, Sparkles } from 'lucide-react';

gsap.registerPlugin(useGSAP);

const statusOptions: { value: VibeStatus; emoji: string; label: string; color: string }[] = [
    { value: 'happy', emoji: '😊', label: 'Happy', color: 'from-yellow-400 to-orange-400' },
    { value: 'miss-you', emoji: '🥺', label: 'Miss You', color: 'from-pink-400 to-rose-400' },
    { value: 'sleepy', emoji: '😴', label: 'Sleepy', color: 'from-indigo-400 to-purple-400' },
    { value: 'focused', emoji: '🎯', label: 'Focused', color: 'from-blue-400 to-cyan-400' },
    { value: 'sad', emoji: '😢', label: 'Sad', color: 'from-gray-400 to-slate-500' },
    { value: 'cuddly', emoji: '🤗', label: 'Cuddly', color: 'from-rose-400 to-pink-500' },
];

export default function VibeDashboard() {
    const {
        myRole,
        partnerRole,
        myStatus,
        partnerStatus,
        setMyStatus,
        distance,
        lastPartnerPulse,
        sendPulse
    } = useCouple();

    const [pulseAnimation, setPulseAnimation] = useState(false);
    const [receivedPulse, setReceivedPulse] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const pulseButtonRef = useRef<HTMLButtonElement>(null);

    // Animate on partner pulse
    useEffect(() => {
        if (lastPartnerPulse) {
            setReceivedPulse(true);
            setTimeout(() => setReceivedPulse(false), 2000);
        }
    }, [lastPartnerPulse]);

    useGSAP(() => {
        if (!containerRef.current) return;

        const elements = containerRef.current.querySelectorAll('.animate-in');
        gsap.fromTo(elements,
            { opacity: 0, y: 20 },
            {
                opacity: 1,
                y: 0,
                duration: 0.5,
                stagger: 0.1,
                ease: 'back.out(1.7)',
            }
        );
    }, { scope: containerRef });

    const handlePulse = () => {
        sendPulse();
        setPulseAnimation(true);

        if (pulseButtonRef.current) {
            gsap.to(pulseButtonRef.current, {
                scale: 1.2,
                duration: 0.15,
                onComplete: () => {
                    gsap.to(pulseButtonRef.current, {
                        scale: 1,
                        duration: 0.4,
                        ease: 'elastic.out(1, 0.3)',
                    });
                }
            });
        }

        setTimeout(() => setPulseAnimation(false), 500);
    };

    const partnerStatusInfo = statusOptions.find(s => s.value === partnerStatus);
    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

    return (
        <div ref={containerRef} className="space-y-6">
            {/* Received Pulse Alert */}
            {receivedPulse && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-bounce">
                    <div className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full shadow-lg flex items-center gap-2">
                        <Heart className="w-5 h-5 animate-pulse" fill="white" />
                        <span className="font-semibold">{capitalize(partnerRole)} sent you a pulse! 💕</span>
                    </div>
                </div>
            )}

            {/* Partner Status Card */}
            <div className="animate-in glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg opacity-70">
                        {capitalize(partnerRole)}&apos;s Vibe
                    </h3>
                    <div className="flex items-center gap-2 text-xs opacity-50">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        Online
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${partnerStatusInfo?.color} flex items-center justify-center`}>
                        <span className="text-3xl">{partnerStatusInfo?.emoji}</span>
                    </div>
                    <div>
                        <p className="text-2xl font-bold">{partnerStatusInfo?.label}</p>
                        <p className="text-sm opacity-60">
                            {partnerRole === 'keerthi' ? 'Your girl' : 'Your love'} is feeling {partnerStatusInfo?.label.toLowerCase()}
                        </p>
                    </div>
                </div>
            </div>

            {/* Haptic Pulse Button */}
            <div className="animate-in text-center">
                <p className="text-sm opacity-60 mb-4">
                    Tap to send a vibration to {capitalize(partnerRole)}&apos;s phone
                </p>

                <button
                    ref={pulseButtonRef}
                    onClick={handlePulse}
                    className={`relative w-32 h-32 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 shadow-lg mx-auto flex items-center justify-center transition-all ${pulseAnimation ? 'ring-4 ring-pink-300 ring-opacity-50' : ''
                        }`}
                >
                    {/* Pulse rings */}
                    <div className="absolute inset-0 rounded-full bg-pink-400 animate-ping opacity-20" />
                    <div className="absolute inset-2 rounded-full bg-pink-400 animate-ping opacity-10" style={{ animationDelay: '0.3s' }} />

                    <div className="relative flex flex-col items-center text-white">
                        <Zap className="w-10 h-10 mb-1" fill="white" />
                        <span className="text-sm font-semibold">PULSE</span>
                    </div>
                </button>

                <p className="text-xs opacity-40 mt-4">
                    {capitalize(partnerRole)} will feel a vibration 💕
                </p>
            </div>

            {/* Distance Tether */}
            <div className="animate-in glass-card p-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                    <MapPin className="w-5 h-5 text-blue-400" />
                    <h3 className="font-semibold">Distance Tether</h3>
                </div>

                {distance !== null ? (
                    <>
                        <p className="text-4xl font-bold text-gradient mb-2">
                            {distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`}
                        </p>
                        <p className="text-sm opacity-60">
                            Between you and {capitalize(partnerRole)}
                        </p>
                    </>
                ) : (
                    <>
                        <p className="text-2xl opacity-50 mb-2">--</p>
                        <p className="text-sm opacity-60">
                            Enable location on the Location page to see distance
                        </p>
                    </>
                )}
            </div>

            {/* My Status Selector */}
            <div className="animate-in">
                <div className="flex items-center justify-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                    <h3 className="font-semibold">What&apos;s Your Vibe?</h3>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    {statusOptions.map((status) => (
                        <button
                            key={status.value}
                            onClick={() => setMyStatus(status.value)}
                            className={`p-4 rounded-2xl flex flex-col items-center gap-2 transition-all ${myStatus === status.value
                                    ? `bg-gradient-to-br ${status.color} text-white scale-105 shadow-lg`
                                    : 'glass-card hover:scale-102'
                                }`}
                        >
                            <span className="text-2xl">{status.emoji}</span>
                            <span className="text-xs font-medium">{status.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
