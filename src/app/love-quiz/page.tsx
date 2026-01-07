'use client';

import LoveLanguageQuiz from '@/components/LoveLanguageQuiz';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function LoveQuizPage() {
    return (
        <main className="flex-1 px-6 py-8">
            {/* Header */}
            <section className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-3">
                    <Link href="/" className="absolute left-4 top-20 p-2 glass-card rounded-full">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <span className="text-4xl">💕</span>
                    <h1 className="text-3xl font-bold text-gradient">Love Language</h1>
                </div>
                <p className="text-lg opacity-70">
                    Discover how you give and receive love
                </p>
            </section>

            {/* Quiz */}
            <section className="max-w-md mx-auto">
                <LoveLanguageQuiz />
            </section>

            {/* Info */}
            <section className="max-w-md mx-auto mt-8 text-center">
                <div className="glass-card p-4">
                    <p className="text-sm opacity-70">
                        Based on Dr. Gary Chapman&apos;s "The 5 Love Languages"
                    </p>
                    <p className="text-xs opacity-50 mt-2">
                        Take this quiz together to better understand each other! 💕
                    </p>
                </div>
            </section>
        </main>
    );
}
