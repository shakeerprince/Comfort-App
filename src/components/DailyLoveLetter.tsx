'use client';

import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Heart, Mail, Sparkles } from 'lucide-react';
import { useCouple } from '@/context/CoupleContext';

gsap.registerPlugin(useGSAP);

// Love letter templates - use {partnerName} and {myName} placeholders
const loveLetterTemplates = [
    {
        greeting: "My Dearest {partnerName},",
        message: "Every morning I wake up grateful that you exist in this world. You are my first thought and my last dream. I love you more than words could ever express.",
        closing: "Forever yours, {myName} 💕"
    },
    {
        greeting: "To the love of my life,",
        message: "Your smile is my favorite thing in this entire universe. Just thinking about you makes my heart race. I can't believe I'm lucky enough to call you mine.",
        closing: "With all my love, {myName} 💖"
    },
    {
        greeting: "My Beautiful {partnerName},",
        message: "You are the reason I believe in magic. Every moment with you feels like a fairytale. I promise to cherish you every single day of my life.",
        closing: "Yours completely, {myName} 🌹"
    },
    {
        greeting: "Hey my love,",
        message: "I hope you know that you're the most amazing person I've ever met. Your kindness, your laugh, your everything - I'm obsessed with all of you.",
        closing: "Madly in love, {myName} 💘"
    },
    {
        greeting: "My Sweet {partnerName},",
        message: "Distance means nothing when someone means everything. No matter where I am, my heart is always with you. You are my home.",
        closing: "Missing you always, {myName} 🏠💕"
    },
    {
        greeting: "To my soulmate,",
        message: "Before I met you, I never knew what it felt like to smile for no reason. Now I smile because of you, always because of you.",
        closing: "Smiling because of you, {myName} 😊💕"
    },
    {
        greeting: "My Precious {partnerName},",
        message: "If I had a flower for every time you made me smile, I'd have an endless garden. You bring so much joy into my life.",
        closing: "Your biggest fan, {myName} 🌸"
    },
    {
        greeting: "Dear heart of my heart,",
        message: "I love you not only for what you are, but for what I am when I'm with you. You make me want to be the best version of myself.",
        closing: "Growing with you, {myName} 🌱💕"
    },
    {
        greeting: "My Darling {partnerName},",
        message: "You are my today and all of my tomorrows. I can't imagine a future without you in it. You are my forever person.",
        closing: "For all eternity, {myName} ♾️💕"
    },
    {
        greeting: "To my everything,",
        message: "In a world full of temporary things, you are my forever. Thank you for loving me the way you do. I am so blessed.",
        closing: "Grateful for you, {myName} 🙏💕"
    },
    {
        greeting: "My Lovely {partnerName},",
        message: "Your voice is my favorite sound. Your name is my favorite word. Your hug is my favorite feeling. You are my favorite everything.",
        closing: "Completely devoted, {myName} 💓"
    },
    {
        greeting: "Hey beautiful,",
        message: "I still get butterflies every time I see you. Even after all this time, my heart beats faster when you're near. That's how I know this is real.",
        closing: "Still falling for you, {myName} 🦋"
    },
    {
        greeting: "My Wonderful {partnerName},",
        message: "You don't just make me happy - you make me a better person. Loving you has taught me what it means to truly care about someone.",
        closing: "Learning love with you, {myName} 📚💕"
    },
    {
        greeting: "To the one who stole my heart,",
        message: "You didn't just steal my heart - you gave me yours too. I promise to protect it and cherish it forever.",
        closing: "Heart keeper, {myName} 💝"
    },
    {
        greeting: "My Angel {partnerName},",
        message: "When I'm with you, hours feel like seconds. When we're apart, days feel like years. You are the most important part of my life.",
        closing: "Counting seconds till I see you, {myName} ⏰💕"
    },
    {
        greeting: "Dear love of my life,",
        message: "Every love song makes sense now. Every romantic movie reminds me of us. You've given me the love story I always dreamed of.",
        closing: "Living our love story, {myName} 🎬💕"
    },
    {
        greeting: "My Sunshine {partnerName},",
        message: "Even on my darkest days, you are the light that guides me home. Your love is my strength and my peace.",
        closing: "Shining because of you, {myName} ☀️"
    },
    {
        greeting: "To my best friend and love,",
        message: "Not only are you the love of my life, but you're also my best friend. I can share anything with you, and that means the world to me.",
        closing: "Your best friend forever, {myName} 👫💕"
    },
    {
        greeting: "My Gorgeous {partnerName},",
        message: "I want to be your favorite hello and your hardest goodbye. I want to be the reason you look forward to tomorrow.",
        closing: "Your reason to smile, {myName} 😊💕"
    },
    {
        greeting: "Hey my royalty,",
        message: "You deserve the world, and I promise to spend my life trying to give it to you. You are worth every effort.",
        closing: "Your devoted one, {myName} 👑💕"
    },
    {
        greeting: "My Heart {partnerName},",
        message: "I look at you and I'm home. I see nothing worse than to be without you. You are my safe place.",
        closing: "Forever home with you, {myName} 🏡💕"
    },
    {
        greeting: "To my favorite person,",
        message: "Of all the people in the world, you're my favorite. I'd choose you a thousand times over, in any lifetime.",
        closing: "Always choosing you, {myName} 💫"
    },
    {
        greeting: "My Treasure {partnerName},",
        message: "You are more precious to me than all the jewels in the world. Your love is the greatest treasure I've ever found.",
        closing: "Treasure hunter, {myName} 💎💕"
    },
    {
        greeting: "Dear partner in crime,",
        message: "Life with you is an adventure I never want to end. Every moment, every laugh, every challenge - I want it all with you.",
        closing: "Your adventure partner, {myName} 🗺️💕"
    },
    {
        greeting: "My Dream {partnerName},",
        message: "You are the dream I never knew I had. Meeting you made me realize what I was missing all along.",
        closing: "Living the dream, {myName} 💭💕"
    },
    {
        greeting: "To my miracle,",
        message: "Finding you was like finding a miracle. Against all odds, we found each other. That's how I know we're meant to be.",
        closing: "Your miracle, {myName} ✨💕"
    },
    {
        greeting: "My Forever {partnerName},",
        message: "I don't want just a moment with you. I want forever. I want to grow old with you, laugh with you, love you endlessly.",
        closing: "Forever and always, {myName} ♾️💕"
    },
    {
        greeting: "Hey sweetheart,",
        message: "Thank you for accepting me exactly as I am. Your unconditional love has healed parts of me I didn't know were broken.",
        closing: "Healed by your love, {myName} 🩹💕"
    },
    {
        greeting: "My Star {partnerName},",
        message: "Among all the stars in the sky, you shine the brightest. You are extraordinary, and I'm so proud to love you.",
        closing: "Stargazing at you, {myName} ⭐💕"
    },
    {
        greeting: "To my whole world,",
        message: "You are my world, {partnerName}. Everything I do, I do for us. Our future together is all I think about.",
        closing: "Building our future, {myName} 🌍💕"
    },
];

function replacePlaceholders(text: string, myName: string, partnerName: string): string {
    return text.replace(/{myName}/g, myName).replace(/{partnerName}/g, partnerName);
}

export default function DailyLoveLetter() {
    const [isOpen, setIsOpen] = useState(false);
    const [hasRead, setHasRead] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const letterRef = useRef<HTMLDivElement>(null);
    const { myName, partnerName } = useCouple();

    // Get today's letter based on day of month
    const dayOfMonth = new Date().getDate();
    const todayTemplate = loveLetterTemplates[(dayOfMonth - 1) % loveLetterTemplates.length];

    const todayLetter = {
        greeting: replacePlaceholders(todayTemplate.greeting, myName, partnerName),
        message: replacePlaceholders(todayTemplate.message, myName, partnerName),
        closing: replacePlaceholders(todayTemplate.closing, myName, partnerName),
    };

    useEffect(() => {
        // Check if today's letter was already read
        const lastRead = localStorage.getItem('comfort-last-love-letter');
        const today = new Date().toISOString().split('T')[0];
        setHasRead(lastRead === today);
    }, []);

    useGSAP(() => {
        if (!containerRef.current) return;
        gsap.fromTo(containerRef.current,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
        );
    }, { scope: containerRef });

    const openLetter = () => {
        setIsOpen(true);
        setHasRead(true);
        localStorage.setItem('comfort-last-love-letter', new Date().toISOString().split('T')[0]);

        // Animate letter opening
        if (letterRef.current) {
            gsap.fromTo(letterRef.current,
                { scale: 0.8, opacity: 0, rotateX: -30 },
                { scale: 1, opacity: 1, rotateX: 0, duration: 0.5, ease: 'back.out(1.7)' }
            );
        }
    };

    const closeLetter = () => {
        if (letterRef.current) {
            gsap.to(letterRef.current, {
                scale: 0.8, opacity: 0, duration: 0.3,
                onComplete: () => setIsOpen(false)
            });
        }
    };

    return (
        <div ref={containerRef} className="w-full">
            {!isOpen ? (
                <button
                    onClick={openLetter}
                    className={`w-full glass-card p-6 flex items-center gap-4 transition-all active:scale-98 ${!hasRead ? 'ring-2 ring-[#BFA054] animate-pulse' : ''
                        }`}
                >
                    <div className={`p-4 rounded-2xl ${!hasRead ? 'bg-gradient-to-br from-[#9A2143] to-[#C44569]' : 'bg-[#9A2143]/20'}`}>
                        <Mail className={`w-8 h-8 ${!hasRead ? 'text-white' : 'text-[#9A2143]'}`} />
                    </div>
                    <div className="text-left flex-1">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                            Daily Love Letter
                            {!hasRead && <Sparkles className="w-4 h-4 text-yellow-400" />}
                        </h3>
                        <p className="text-sm opacity-70">
                            {!hasRead ? `You have a new letter from ${myName}! 💕` : "Tap to read today's letter again"}
                        </p>
                    </div>
                    <Heart className={`w-6 h-6 ${!hasRead ? 'text-[#9A2143] animate-pulse' : 'opacity-40'}`} />
                </button>
            ) : (
                <div
                    ref={letterRef}
                    className="glass-card p-6 perspective-1000"
                >
                    <div className="bg-gradient-to-br from-[#FBF8F2] to-white dark:from-[#1E2742] dark:to-[#2D3A5E] rounded-2xl p-6 space-y-4 border border-[#BFA054]/20">
                        <div className="text-center">
                            <span className="text-4xl">💌</span>
                            <p className="text-xs opacity-50 mt-2">
                                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                            </p>
                        </div>

                        <div className="space-y-4 text-center">
                            <p className="font-semibold text-[#9A2143] dark:text-[#C44569]">{todayLetter.greeting}</p>
                            <p className="text-lg leading-relaxed">{todayLetter.message}</p>
                            <p className="font-medium italic text-[#9A2143] dark:text-[#C44569]">{todayLetter.closing}</p>
                        </div>

                        <button
                            onClick={closeLetter}
                            className="w-full mt-4 py-3 bg-gradient-to-r from-[#9A2143] to-[#C44569] text-white rounded-xl font-medium active:scale-95 transition-transform shadow-md"
                        >
                            Close Letter 💕
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
