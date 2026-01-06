'use client';

import { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Mail, Heart } from 'lucide-react';

gsap.registerPlugin(useGSAP);

const loveNotes = [
    "You are my favorite person in the entire universe 💫",
    "Every moment with you is a gift I treasure 🎁",
    "Your smile is the best medicine for any bad day 💝",
    "I fall more in love with you every single day 💕",
    "You make my heart do happy little flips 🦋",
    "Being with you feels like coming home 🏠💖",
];

export default function LoveEnvelope() {
    const containerRef = useRef<HTMLDivElement>(null);
    const envelopeRef = useRef<HTMLDivElement>(null);
    const flapRef = useRef<HTMLDivElement>(null);
    const noteRef = useRef<HTMLDivElement>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [currentNote, setCurrentNote] = useState('');
    const [showConfetti, setShowConfetti] = useState(false);

    useGSAP(() => {
        if (!containerRef.current) return;

        // Entry animation
        gsap.fromTo(containerRef.current,
            { opacity: 0, y: 40, scale: 0.9 },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.8,
                delay: 1.8,
                ease: 'back.out(1.7)',
            }
        );
    }, { scope: containerRef });

    const handleClick = () => {
        if (isOpen) {
            // Close envelope
            closeEnvelope();
        } else {
            // Open envelope
            openEnvelope();
        }
    };

    const openEnvelope = () => {
        const tl = gsap.timeline();

        // Pick random note
        const randomNote = loveNotes[Math.floor(Math.random() * loveNotes.length)];
        setCurrentNote(randomNote);

        // Shake animation
        tl.to(envelopeRef.current, {
            x: -5,
            duration: 0.05,
            repeat: 5,
            yoyo: true,
            ease: 'power1.inOut',
        });

        // Open flap
        tl.to(flapRef.current, {
            rotationX: 180,
            duration: 0.5,
            ease: 'power2.out',
        });

        // Slide note out
        tl.to(noteRef.current, {
            y: -80,
            opacity: 1,
            scale: 1,
            duration: 0.6,
            ease: 'back.out(1.7)',
        }, '-=0.2');

        // Show confetti
        tl.call(() => {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 2000);
        }, [], '-=0.3');

        setIsOpen(true);
    };

    const closeEnvelope = () => {
        const tl = gsap.timeline();

        // Hide note
        tl.to(noteRef.current, {
            y: 0,
            opacity: 0,
            scale: 0.8,
            duration: 0.4,
            ease: 'power2.in',
        });

        // Close flap
        tl.to(flapRef.current, {
            rotationX: 0,
            duration: 0.4,
            ease: 'power2.out',
        });

        setIsOpen(false);
    };

    return (
        <div ref={containerRef} className="w-full max-w-md mx-auto flex flex-col items-center">
            <p className="text-center text-lg mb-6 opacity-80">
                Tap the envelope for a surprise ✉️
            </p>

            <div
                ref={envelopeRef}
                className="relative cursor-pointer perspective-1000"
                onClick={handleClick}
            >
                {/* The note that slides out */}
                <div
                    ref={noteRef}
                    className="absolute left-1/2 -translate-x-1/2 w-64 p-4 glass-card text-center z-10"
                    style={{
                        top: '50%',
                        opacity: 0,
                        transform: 'translate(-50%, 0) scale(0.8)',
                    }}
                >
                    <Heart className="w-6 h-6 mx-auto mb-2 text-pink-500" fill="#ec407a" />
                    <p className="text-lg font-medium">{currentNote}</p>
                </div>

                {/* Envelope body */}
                <div className="relative w-48 h-32 bg-gradient-to-br from-pink-200 to-pink-300 rounded-lg shadow-lg overflow-visible">
                    {/* Envelope flap */}
                    <div
                        ref={flapRef}
                        className="absolute top-0 left-0 right-0 h-16 origin-top"
                        style={{
                            transformStyle: 'preserve-3d',
                            zIndex: 20,
                        }}
                    >
                        {/* Front of flap */}
                        <div
                            className="absolute inset-0 bg-gradient-to-b from-pink-300 to-pink-200"
                            style={{
                                clipPath: 'polygon(0 0, 50% 100%, 100% 0)',
                                backfaceVisibility: 'hidden',
                            }}
                        />
                        {/* Back of flap */}
                        <div
                            className="absolute inset-0 bg-pink-100"
                            style={{
                                clipPath: 'polygon(0 0, 50% 100%, 100% 0)',
                                transform: 'rotateX(180deg)',
                                backfaceVisibility: 'hidden',
                            }}
                        />
                    </div>

                    {/* Heart seal */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
                        <Heart
                            className="w-10 h-10 text-red-400 drop-shadow-md"
                            fill="#f87171"
                            strokeWidth={1}
                        />
                    </div>

                    {/* Inner envelope lines */}
                    <div className="absolute bottom-4 left-4 right-4 space-y-2">
                        <div className="h-2 bg-pink-100 rounded-full opacity-50"></div>
                        <div className="h-2 bg-pink-100 rounded-full opacity-50 w-3/4"></div>
                    </div>
                </div>

                {/* Tap indicator */}
                {!isOpen && (
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 text-sm opacity-60">
                        <Mail className="w-4 h-4" />
                        <span>Tap me!</span>
                    </div>
                )}
            </div>

            {/* Simple confetti effect */}
            {showConfetti && (
                <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
                    {Array.from({ length: 30 }).map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-3 h-3 rounded-full animate-bounce"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: '-20px',
                                backgroundColor: ['#ec407a', '#ba68c8', '#ffab91', '#d1c4e9'][i % 4],
                                animation: `fall ${1 + Math.random()}s ease-out forwards`,
                                animationDelay: `${Math.random() * 0.5}s`,
                            }}
                        />
                    ))}
                </div>
            )}

            <style jsx>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
        </div>
    );
}
