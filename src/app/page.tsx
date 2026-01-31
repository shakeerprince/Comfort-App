'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import VibeDashboard from '@/components/VibeDashboard';
import PersonalMessages from '@/components/PersonalMessages';
import DailyLoveLetter from '@/components/DailyLoveLetter';
import SpecialDatesCountdown from '@/components/SpecialDatesCountdown';
import ComfortPlaylist from '@/components/ComfortPlaylist';
import WeatherCare from '@/components/WeatherCare';
import { useCouple } from '@/context/CoupleContext';
import { useAuth } from '@/context/AuthContext';
import { Heart, Sparkles, ArrowRight, Users } from 'lucide-react';

gsap.registerPlugin(useGSAP);

const quickActions = [
  {
    href: '/comfort',
    label: 'Comfort Tools',
    emoji: '🔥',
    description: 'Heating pad & breathing',
  },
  {
    href: '/cravings',
    label: 'Need Something',
    emoji: '🍫',
    description: 'Alert your partner',
  },
  {
    href: '/tracker',
    label: 'Period Tracker',
    emoji: '📅',
    description: 'Track & predict cycle',
  },
  {
    href: '/chat',
    label: 'Vanish Chat',
    emoji: '💬',
    description: 'Private messages',
  },
  {
    href: '/support',
    label: 'Quick SOS',
    emoji: '🆘',
    description: 'Need help now',
  },
  {
    href: '/memories',
    label: 'Our Memories',
    emoji: '📸',
    description: 'Photo gallery',
  },
  {
    href: '/location',
    label: 'Location',
    emoji: '📍',
    description: 'Share live location',
  },
  {
    href: '/love-quiz',
    label: 'Love Quiz',
    emoji: '💕',
    description: 'Love language test',
  },
];

function getGreeting(): { greeting: string; emoji: string } {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return { greeting: 'Good Morning', emoji: '🌅' };
  } else if (hour >= 12 && hour < 17) {
    return { greeting: 'Good Afternoon', emoji: '☀️' };
  } else if (hour >= 17 && hour < 21) {
    return { greeting: 'Good Evening', emoji: '🌆' };
  } else {
    return { greeting: 'Good Night', emoji: '🌙' };
  }
}

export default function Home() {
  const { isAuthenticated, isLoading: authLoading, user, isPaired } = useAuth();
  const { myName, partnerName } = useCouple();
  const mainRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [greeting, setGreeting] = useState({ greeting: 'Hello', emoji: '💕' });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setGreeting(getGreeting());
  }, []);

  useGSAP(() => {
    if (!mainRef.current || !mounted || authLoading) return;

    const sections = mainRef.current.querySelectorAll('.section');
    gsap.fromTo(sections,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power2.out',
      }
    );
  }, { scope: mainRef, dependencies: [mounted, authLoading, isAuthenticated] });

  if (authLoading || !mounted) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <span className="text-4xl animate-pulse">🌸</span>
          <p className="mt-2 opacity-60">Loading...</p>
        </div>
      </main>
    );
  }

  // Not authenticated - show welcome screen
  if (!isAuthenticated) {
    return (
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-lg">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-[#9A2143] to-[#721832] mb-6 shadow-lg shadow-[#9A2143]/30">
            <Heart className="w-12 h-12 text-white" fill="white" />
          </div>
          <h1 className="text-4xl font-bold text-gradient mb-4">Comfort App 💕</h1>
          <p className="text-lg opacity-70 mb-8">
            A warm, supportive app for couples. Connect, share moments, and care for each other every day.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login" className="btn-primary px-8 py-3 inline-flex items-center justify-center gap-2">
              Sign In
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/register" className="btn-secondary px-8 py-3">
              Create Account
            </Link>
          </div>
          <div className="mt-10 opacity-60">
            <div className="inline-flex items-center gap-2 text-sm">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span>Private chat • Location sharing • Mood tracking • Memories</span>
              <Sparkles className="w-4 h-4 text-yellow-400" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Authenticated but not paired - prompt to pair
  if (!isPaired) {
    return (
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-lg">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-violet-500 mb-6 shadow-lg shadow-purple-500/30">
            <Users className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gradient mb-3">
            Welcome, {myName}! 👋
          </h1>
          <p className="text-lg opacity-70 mb-8">
            Connect with your partner to start using Comfort App together.
          </p>
          <Link href="/pair" className="btn-primary px-8 py-3 inline-flex items-center gap-2">
            Connect with Partner
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </main>
    );
  }

  // Fully authenticated and paired - show main app
  return (
    <main ref={mainRef} className="flex-1 px-6 py-8 space-y-6">
      {/* Personalized Greeting */}
      <section className="section flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-2 mb-1">
            <span className="text-2xl">{greeting.emoji}</span>
            <h1 className="text-2xl font-bold text-gradient">
              {greeting.greeting}, {myName}!
            </h1>
          </div>
          <p className="text-sm opacity-70 font-medium tracking-wide">Stay connected with {partnerName} 💕</p>
        </div>
        <Link href="/profile" className="relative group">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#BFA054] to-[#8F763B] p-0.5 shadow-md group-hover:scale-105 transition-transform">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
              {user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.image} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-lg font-bold text-pink-500">{myName.charAt(0).toUpperCase()}</span>
              )}
            </div>
          </div>
        </Link>
      </section>

      {/* Daily Love Letter */}
      <section className="section max-w-md mx-auto">
        <DailyLoveLetter />
      </section>

      {/* Weather Care */}
      <section className="section max-w-md mx-auto">
        <WeatherCare />
      </section>

      {/* Personal Message from Partner */}
      <section className="section max-w-md mx-auto">
        <PersonalMessages />
      </section>

      {/* Vibe Dashboard */}
      <section className="section glass-card p-6 max-w-md mx-auto">
        <VibeDashboard />
      </section>

      {/* Quick Playlists */}
      <section className="section max-w-md mx-auto">
        <ComfortPlaylist compact />
      </section>

      {/* Quick Actions */}
      <section className="section max-w-md mx-auto">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-yellow-400" />
          <h2 className="text-lg font-semibold">Quick Actions</h2>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="glass-card p-4 flex flex-col items-center gap-2 hover:scale-105 transition-transform text-center group active:scale-95"
            >
              <span className="text-3xl">{action.emoji}</span>
              <div>
                <h3 className="font-semibold text-sm">{action.label}</h3>
                <p className="text-xs opacity-60">{action.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Special Dates Countdown */}
      <section className="section max-w-md mx-auto">
        <SpecialDatesCountdown />
      </section>
    </main>
  );
}
