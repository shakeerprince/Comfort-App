'use client';

import { useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Heart, Flame, Cookie, MessageCircle, Calendar, MapPin, Music, MessageSquare } from 'lucide-react';

gsap.registerPlugin(useGSAP);

const quickLinks = [
    { href: '/comfort', label: 'Comfort', icon: Flame },
    { href: '/cravings', label: 'Cravings', icon: Cookie },
    { href: '/location', label: 'Location', icon: MapPin },
    { href: '/chat', label: 'Chat', icon: MessageSquare },
    { href: '/music', label: 'Music', icon: Music },
    { href: '/support', label: 'Support', icon: MessageCircle },
    { href: '/tracker', label: 'Tracker', icon: Calendar },
];

export default function Footer() {
    const footerRef = useRef<HTMLElement>(null);

    useGSAP(() => {
        if (!footerRef.current) return;

        const hearts = footerRef.current.querySelectorAll('.floating-heart');
        hearts.forEach((heart, i) => {
            gsap.to(heart, {
                y: -8,
                duration: 2 + Math.random(),
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
                delay: i * 0.3,
            });
        });
    }, { scope: footerRef });

    return (
        <footer ref={footerRef} className="relative mt-auto pt-16 pb-8 px-6">
            {/* Top border */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-1 bg-gradient-to-r from-transparent via-rose-300 to-transparent rounded-full" />

            {/* Floating decorations */}
            <div className="absolute top-4 left-1/4 opacity-30">
                <span className="floating-heart text-2xl">🌸</span>
            </div>
            <div className="absolute top-6 right-1/4 opacity-30">
                <span className="floating-heart text-xl">💕</span>
            </div>

            <div className="max-w-4xl mx-auto">
                {/* Quick Links */}
                <div className="flex flex-wrap justify-center gap-2 mb-8">
                    {quickLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-all text-xs opacity-70 hover:opacity-100"
                        >
                            <link.icon className="w-3 h-3" />
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* Main message */}
                <div className="text-center space-y-3">
                    <div className="flex items-center justify-center gap-2 text-lg">
                        <span>Made with</span>
                        <Heart className="w-5 h-5 text-red-400 animate-pulse" fill="#f87171" />
                        <span>by</span>
                        <span className="font-bold text-warm">Shaker</span>
                    </div>

                    <p className="text-lg">
                        For my strongest, bravest{' '}
                        <span className="font-bold text-cozy">Keerthi</span> 🌸
                    </p>

                    <p className="text-sm opacity-60 max-w-md mx-auto">
                        You&apos;re never alone in this. I&apos;m always here for you, even when I can&apos;t physically be there.
                        Send me a pulse anytime 💕
                    </p>

                    <p className="text-xs opacity-40 pt-4">
                        Comfort App © {new Date().getFullYear()} • With infinite love from Shaker 💕
                    </p>
                </div>
            </div>
        </footer>
    );
}
