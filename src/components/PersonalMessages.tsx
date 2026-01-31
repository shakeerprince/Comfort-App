'use client';

import { useState, useEffect } from 'react';
import { Heart, Sparkles, Sun, Moon, Coffee, Star } from 'lucide-react';
import { useCouple } from '@/context/CoupleContext';

interface PersonalMessage {
    text: string;
    emoji: string;
    time?: 'morning' | 'afternoon' | 'evening' | 'night';
}

// Templates use {partnerName} placeholder
const messageTemplates: PersonalMessage[] = [
    // Morning messages
    { text: "Good morning, my sunshine! Hope today treats you gently 🌸", emoji: "☀️", time: 'morning' },
    { text: "Rise and shine, beautiful! Remember, I love you endlessly 💕", emoji: "🌅", time: 'morning' },
    { text: "Waking up knowing you exist makes every morning magical ✨", emoji: "💖", time: 'morning' },

    // Afternoon messages
    { text: "Hey cutie! Just a reminder that you're amazing 💝", emoji: "🌸", time: 'afternoon' },
    { text: "Thinking of you right now... Hope your day is going well 💕", emoji: "💭", time: 'afternoon' },
    { text: "You're doing great, {partnerName}! Keep going, I believe in you 🌟", emoji: "⭐", time: 'afternoon' },

    // Evening messages
    { text: "Almost through the day! I'm so proud of you 💗", emoji: "🌆", time: 'evening' },
    { text: "Can't wait to talk to you later! You make evenings beautiful 💕", emoji: "✨", time: 'evening' },
    { text: "You've done so well today. Time to rest soon, my love 🌙", emoji: "💝", time: 'evening' },

    // Night messages
    { text: "Sweet dreams, my beautiful! I love you to the moon and back 🌙", emoji: "🌙", time: 'night' },
    { text: "Rest well, {partnerName}. Tomorrow is a new day full of love 💕", emoji: "😴", time: 'night' },
    { text: "Goodnight, my everything. You're always in my heart 💖", emoji: "🛏️", time: 'night' },

    // Generic love messages (anytime)
    { text: "You are the best thing that ever happened to me 💕", emoji: "💖" },
    { text: "Every moment with you is a blessing I cherish 🌸", emoji: "✨" },
    { text: "I fall more in love with you every single day 💗", emoji: "🥰" },
    { text: "You make my heart do happy little flips 🦋", emoji: "💕" },
    { text: "Distance means nothing when someone means everything 💝", emoji: "🌏" },
    { text: "You're not just my partner, you're my best friend 💖", emoji: "👫" },
    { text: "Thank you for being you. You're perfect to me 🌟", emoji: "⭐" },
    { text: "I'm so lucky to have you in my life 🍀", emoji: "💚" },
    { text: "Your smile is my favorite thing in the whole world 😊", emoji: "💕" },
    { text: "No matter what, I'm always here for you 💪", emoji: "💖" },
];

function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
}

function getTimeIcon() {
    const time = getTimeOfDay();
    switch (time) {
        case 'morning': return <Sun className="w-5 h-5 text-yellow-400" />;
        case 'afternoon': return <Coffee className="w-5 h-5 text-amber-400" />;
        case 'evening': return <Star className="w-5 h-5 text-orange-400" />;
        case 'night': return <Moon className="w-5 h-5 text-indigo-400" />;
    }
}

function replacePlaceholders(text: string, partnerName: string): string {
    return text.replace(/{partnerName}/g, partnerName);
}

export default function PersonalMessages() {
    const [currentMessage, setCurrentMessage] = useState<PersonalMessage | null>(null);
    const [isVisible, setIsVisible] = useState(true);
    const { myName, partnerName } = useCouple();

    useEffect(() => {
        const timeOfDay = getTimeOfDay();

        // Filter messages for current time or generic
        const appropriateMessages = messageTemplates.filter(
            m => m.time === timeOfDay || !m.time
        );

        // Pick a random message
        const randomMessage = appropriateMessages[
            Math.floor(Math.random() * appropriateMessages.length)
        ];

        setCurrentMessage(randomMessage);
    }, []);

    const getNewMessage = () => {
        setIsVisible(false);
        setTimeout(() => {
            const timeOfDay = getTimeOfDay();
            const appropriateMessages = messageTemplates.filter(
                m => m.time === timeOfDay || !m.time
            );
            const randomMessage = appropriateMessages[
                Math.floor(Math.random() * appropriateMessages.length)
            ];
            setCurrentMessage(randomMessage);
            setIsVisible(true);
        }, 300);
    };

    if (!currentMessage) return null;

    const displayText = replacePlaceholders(currentMessage.text, partnerName);

    return (
        <div className="empathy-box cursor-pointer hover:shadow-lg transition-all" onClick={getNewMessage}>
            <div className="flex items-start gap-3">
                <div className="flex flex-col items-center gap-1">
                    <Heart className="w-5 h-5 text-[#9A2143] flex-shrink-0" fill="#9A2143" />
                    {getTimeIcon()}
                </div>
                <div className={`transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
                    <p className="text-sm leading-relaxed">
                        <span className="mr-2">{currentMessage.emoji}</span>
                        {displayText}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                        <p className="text-xs opacity-50">- {myName} 💕</p>
                        <p className="text-xs opacity-40 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            Tap for another
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
