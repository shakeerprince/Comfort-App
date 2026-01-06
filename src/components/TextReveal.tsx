'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

interface TextRevealProps {
    text: string;
    className?: string;
    delay?: number;
    stagger?: number;
    as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
}

export default function TextReveal({
    text,
    className = '',
    delay = 0.5,
    stagger = 0.05,
    as: Component = 'h1'
}: TextRevealProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (!containerRef.current) return;

        const chars = containerRef.current.querySelectorAll('.char');

        gsap.fromTo(chars,
            {
                opacity: 0,
                y: 50,
                rotationX: -90,
                transformOrigin: 'bottom center'
            },
            {
                opacity: 1,
                y: 0,
                rotationX: 0,
                duration: 0.8,
                stagger: stagger,
                delay: delay,
                ease: 'back.out(1.7)',
            }
        );
    }, { scope: containerRef });

    // Split text into characters, preserving spaces
    const characters = text.split('').map((char, index) => (
        <span
            key={index}
            className="char inline-block"
            style={{
                whiteSpace: char === ' ' ? 'pre' : 'normal',
                display: 'inline-block',
                minWidth: char === ' ' ? '0.3em' : 'auto'
            }}
        >
            {char === ' ' ? '\u00A0' : char}
        </span>
    ));

    return (
        <div ref={containerRef} className="perspective-1000 overflow-hidden">
            <Component className={className}>
                {characters}
            </Component>
        </div>
    );
}
