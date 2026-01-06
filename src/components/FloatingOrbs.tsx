'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

interface Orb {
  className: string;
  size: number;
  x: string;
  y: string;
}

// Softer, warmer orbs for period comfort
const orbs: Orb[] = [
  { className: 'orb-rose', size: 280, x: '15%', y: '20%' },
  { className: 'orb-peach', size: 220, x: '75%', y: '15%' },
  { className: 'orb-lavender', size: 260, x: '80%', y: '55%' },
  { className: 'orb-cream', size: 240, x: '10%', y: '65%' },
  { className: 'orb-rose', size: 180, x: '50%', y: '45%' },
];

export default function FloatingOrbs() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current) return;

    const orbElements = containerRef.current.querySelectorAll('.floating-orb');

    orbElements.forEach((orb, index) => {
      // Very gentle, slow movement
      const randomX = (Math.random() - 0.5) * 60;
      const randomY = (Math.random() - 0.5) * 60;
      const duration = 20 + Math.random() * 10; // 20-30 seconds - very slow

      // Fade in
      gsap.fromTo(orb,
        { opacity: 0 },
        {
          opacity: 0.4,
          duration: 3,
          delay: index * 0.3,
          ease: 'power2.out'
        }
      );

      // Gentle floating
      gsap.to(orb, {
        x: randomX,
        y: randomY,
        duration: duration,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: index * 0.5,
      });
    });
  }, { scope: containerRef });

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-hidden pointer-events-none z-0"
      aria-hidden="true"
    >
      {orbs.map((orb, index) => (
        <div
          key={index}
          className={`floating-orb ${orb.className}`}
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.x,
            top: orb.y,
          }}
        />
      ))}
    </div>
  );
}
