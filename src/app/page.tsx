'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import VibeDashboard from '@/components/VibeDashboard';
import RoleSelector from '@/components/RoleSelector';
import PersonalMessages from '@/components/PersonalMessages';
import { useCouple } from '@/context/CoupleContext';
import { Heart, Sparkles, ArrowRight, Camera, Smile } from 'lucide-react';

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
    href: '/location',
    label: 'Location',
    emoji: '📍',
    description: 'Share live location',
  },
  {
    href: '/chat',
    label: 'Vanish Chat',
    emoji: '💬',
    description: 'Private messages',
  },
  {
    href: '/support',
    label: 'Send a Hug',
    emoji: '🤗',
    description: 'Virtual warm embrace',
  },
  {
    href: '/memories',
    label: 'Our Memories',
    emoji: '📸',
    description: 'Photo gallery',
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
  const [hasSelectedRole, setHasSelectedRole] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { myRole, partnerRole } = useCouple();
  const mainRef = useRef<HTMLDivElement>(null);
  const [greeting, setGreeting] = useState({ greeting: 'Hello', emoji: '💕' });

  useEffect(() => {
    // Check if role was previously selected
    const saved = localStorage.getItem('cozycycle-couple');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.myRole) {
          setHasSelectedRole(true);
        }
      } catch (e) { }
    }
    setIsLoading(false);
    setGreeting(getGreeting());
  }, []);

  useGSAP(() => {
    if (!mainRef.current || !hasSelectedRole) return;

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
  }, { scope: mainRef, dependencies: [hasSelectedRole] });

  if (isLoading) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <span className="text-4xl animate-pulse">🌸</span>
          <p className="mt-2 opacity-60">Loading...</p>
        </div>
      </main>
    );
  }

  if (!hasSelectedRole) {
    return <RoleSelector onSelect={() => setHasSelectedRole(true)} />;
  }

  const partnerDisplayName = partnerRole === 'keerthi' ? 'Keerthi' : 'Shaker';

  return (
    <main ref={mainRef} className="flex-1 px-6 py-8">
      {/* Personalized Greeting */}
      <section className="section text-center mb-6">
        <div className="inline-flex items-center gap-2 mb-2">
          <span className="text-3xl">{greeting.emoji}</span>
          <h1 className="text-3xl font-bold text-gradient">
            {greeting.greeting}, {myRole === 'keerthi' ? 'Keerthi' : 'Shaker'}!
          </h1>
          <span className="text-3xl">💕</span>
        </div>
        <p className="text-lg opacity-70">Stay connected with {partnerDisplayName}, always</p>
      </section>

      {/* Personal Message from Shaker */}
      <section className="section max-w-md mx-auto mb-6">
        <PersonalMessages />
      </section>

      {/* Vibe Dashboard */}
      <section className="section glass-card p-6 mb-8 max-w-md mx-auto">
        <VibeDashboard />
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
              className="glass-card p-4 flex flex-col items-center gap-2 hover:scale-105 transition-transform text-center group"
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
    </main>
  );
}

