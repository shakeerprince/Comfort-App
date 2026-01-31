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
// Subtle Royal Orbs
const orbs: Orb[] = [
  { className: 'orb-rose', size: 300, x: '10%', y: '20%' }, // Burgundy
  { className: 'orb-peach', size: 350, x: '80%', y: '60%' }, // Gold
  { className: 'orb-rose', size: 200, x: '60%', y: '20%' }, // Burgundy
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
