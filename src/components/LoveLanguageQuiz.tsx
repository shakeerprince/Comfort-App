'use client';

import { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Heart, Gift, MessageCircle, Clock, HandHeart, ChevronRight } from 'lucide-react';

gsap.registerPlugin(useGSAP);

interface Question {
    id: number;
    question: string;
    options: { text: string; type: LoveLanguage }[];
}

type LoveLanguage = 'words' | 'acts' | 'gifts' | 'time' | 'touch';

const loveLanguages: Record<LoveLanguage, { name: string; emoji: string; description: string; tips: string[] }> = {
    words: {
        name: "Words of Affirmation",
        emoji: "💬",
        description: "You feel most loved when you hear encouraging words and verbal compliments.",
        tips: [
            "Say 'I love you' often",
            "Write love notes",
            "Give genuine compliments",
            "Send sweet texts throughout the day"
        ]
    },
    acts: {
        name: "Acts of Service",
        emoji: "🛠️",
        description: "You feel most loved when someone does helpful things for you.",
        tips: [
            "Help with chores and tasks",
            "Cook a meal for them",
            "Take care of things they're stressed about",
            "Show up when they need help"
        ]
    },
    gifts: {
        name: "Receiving Gifts",
        emoji: "🎁",
        description: "You feel most loved through thoughtful gifts and surprises.",
        tips: [
            "Give thoughtful surprises",
            "Remember special occasions",
            "Pick up small things that remind you of them",
            "The thought matters more than price"
        ]
    },
    time: {
        name: "Quality Time",
        emoji: "⏰",
        description: "You feel most loved when someone gives you their undivided attention.",
        tips: [
            "Put away phones during conversations",
            "Plan date nights",
            "Take walks together",
            "Listen actively and attentively"
        ]
    },
    touch: {
        name: "Physical Touch",
        emoji: "🤗",
        description: "You feel most loved through physical affection and closeness.",
        tips: [
            "Hold hands often",
            "Give hugs and cuddles",
            "Sit close together",
            "Small touches throughout the day"
        ]
    }
};

const questions: Question[] = [
    {
        id: 1,
        question: "When I'm feeling down, I feel best when my partner...",
        options: [
            { text: "Tells me everything will be okay and how much they love me", type: "words" },
            { text: "Does something helpful to fix the problem", type: "acts" },
            { text: "Brings me a small gift or surprise", type: "gifts" },
            { text: "Sits with me and gives me their full attention", type: "time" },
            { text: "Holds me or gives me a comforting hug", type: "touch" }
        ]
    },
    {
        id: 2,
        question: "I feel most loved when my partner...",
        options: [
            { text: "Leaves sweet messages or notes for me", type: "words" },
            { text: "Helps me with tasks without being asked", type: "acts" },
            { text: "Surprises me with thoughtful gifts", type: "gifts" },
            { text: "Plans special time just for us", type: "time" },
            { text: "Reaches for my hand or touches my face", type: "touch" }
        ]
    },
    {
        id: 3,
        question: "What hurts me most is when my partner...",
        options: [
            { text: "Doesn't acknowledge my efforts or say kind words", type: "words" },
            { text: "Doesn't help out even when I'm struggling", type: "acts" },
            { text: "Forgets special occasions or never gives gifts", type: "gifts" },
            { text: "Is distracted or too busy to spend time with me", type: "time" },
            { text: "Seems distant and doesn't want physical closeness", type: "touch" }
        ]
    },
    {
        id: 4,
        question: "I'd prefer my partner to...",
        options: [
            { text: "Send me a long, heartfelt message", type: "words" },
            { text: "Cook my favorite meal", type: "acts" },
            { text: "Buy me something I've been wanting", type: "gifts" },
            { text: "Cancel plans to spend the day with me", type: "time" },
            { text: "Give me a relaxing massage", type: "touch" }
        ]
    },
    {
        id: 5,
        question: "When we're together, I love when...",
        options: [
            { text: "We have deep, meaningful conversations", type: "words" },
            { text: "They take care of things so I can relax", type: "acts" },
            { text: "They bring me my favorite snack or drink", type: "gifts" },
            { text: "We're completely focused on each other", type: "time" },
            { text: "We're cuddled up close together", type: "touch" }
        ]
    }
];

export default function LoveLanguageQuiz() {
    const [started, setStarted] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<LoveLanguage[]>([]);
    const [result, setResult] = useState<LoveLanguage | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (!containerRef.current) return;
        gsap.fromTo(containerRef.current,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
        );
    }, { scope: containerRef });

    const handleAnswer = (type: LoveLanguage) => {
        const newAnswers = [...answers, type];
        setAnswers(newAnswers);

        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(prev => prev + 1);
        } else {
            // Calculate result
            const counts: Record<LoveLanguage, number> = {
                words: 0, acts: 0, gifts: 0, time: 0, touch: 0
            };
            newAnswers.forEach(a => counts[a]++);

            const topLanguage = (Object.entries(counts) as [LoveLanguage, number][])
                .sort((a, b) => b[1] - a[1])[0][0];
            setResult(topLanguage);
        }
    };

    const resetQuiz = () => {
        setStarted(false);
        setCurrentQuestion(0);
        setAnswers([]);
        setResult(null);
    };

    if (!started) {
        return (
            <div ref={containerRef} className="w-full">
                <button
                    onClick={() => setStarted(true)}
                    className="w-full glass-card p-6 text-center hover:scale-[1.02] transition-transform active:scale-98"
                >
                    <span className="text-5xl mb-4 block">💕</span>
                    <h3 className="text-xl font-bold mb-2">Love Language Quiz</h3>
                    <p className="text-sm opacity-70 mb-4">Discover how you prefer to give and receive love</p>
                    <div className="flex items-center justify-center gap-2 text-pink-400">
                        <span>Start Quiz</span>
                        <ChevronRight className="w-5 h-5" />
                    </div>
                </button>
            </div>
        );
    }

    if (result) {
        const language = loveLanguages[result];
        return (
            <div ref={containerRef} className="w-full">
                <div className="glass-card p-6 text-center">
                    <span className="text-6xl mb-4 block">{language.emoji}</span>
                    <h3 className="text-2xl font-bold text-gradient mb-2">Your Love Language:</h3>
                    <h4 className="text-xl font-semibold mb-4">{language.name}</h4>
                    <p className="text-sm opacity-80 mb-6">{language.description}</p>

                    <div className="bg-white/10 rounded-xl p-4 text-left mb-6">
                        <p className="font-semibold mb-3 flex items-center gap-2">
                            <Heart className="w-4 h-4 text-pink-400" />
                            How your partner can show you love:
                        </p>
                        <ul className="space-y-2">
                            {language.tips.map((tip, index) => (
                                <li key={index} className="text-sm flex items-center gap-2">
                                    <span className="text-pink-400">♥</span>
                                    {tip}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <button
                        onClick={resetQuiz}
                        className="px-6 py-3 bg-gradient-to-r from-pink-400 to-rose-500 text-white rounded-xl font-medium active:scale-95 transition-transform"
                    >
                        Take Quiz Again
                    </button>
                </div>
            </div>
        );
    }

    const question = questions[currentQuestion];

    return (
        <div ref={containerRef} className="w-full">
            <div className="glass-card p-6">
                <div className="flex justify-between items-center mb-6">
                    <span className="text-sm opacity-50">Question {currentQuestion + 1}/{questions.length}</span>
                    <div className="flex gap-1">
                        {questions.map((_, i) => (
                            <div
                                key={i}
                                className={`w-2 h-2 rounded-full ${i <= currentQuestion ? 'bg-pink-400' : 'bg-white/20'}`}
                            />
                        ))}
                    </div>
                </div>

                <h4 className="text-lg font-semibold mb-6">{question.question}</h4>

                <div className="space-y-3">
                    {question.options.map((option, index) => (
                        <button
                            key={index}
                            onClick={() => handleAnswer(option.type)}
                            className="w-full p-4 text-left bg-white/10 hover:bg-white/20 rounded-xl transition-all active:scale-98"
                        >
                            <span className="text-sm">{option.text}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
