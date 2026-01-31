'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Music, Heart, Frown, Sparkles, ExternalLink } from 'lucide-react';

gsap.registerPlugin(useGSAP);

interface Playlist {
    name: string;
    emoji: string;
    description: string;
    url: string;
    mood: string;
}

// Add your actual playlist URLs here!
const playlists: Playlist[] = [
    {
        name: "Our Favorites",
        emoji: "💕",
        description: "Songs that remind us of each other",
        url: "https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M", // Replace with actual
        mood: "love"
    },
    {
        name: "Comfort Songs",
        emoji: "🧸",
        description: "When you need a warm hug in music form",
        url: "https://open.spotify.com/playlist/37i9dQZF1DX3rxVfibe1L0", // Replace with actual
        mood: "comfort"
    },
    {
        name: "Happy Vibes",
        emoji: "☀️",
        description: "To lift your spirits and make you smile",
        url: "https://open.spotify.com/playlist/37i9dQZF1DXdPec7aLTmlC", // Replace with actual
        mood: "happy"
    },
    {
        name: "Sad Hours",
        emoji: "🌧️",
        description: "When you need to feel your feelings",
        url: "https://open.spotify.com/playlist/37i9dQZF1DX7qK8ma5wgG1", // Replace with actual
        mood: "sad"
    },
    {
        name: "Sleep & Relax",
        emoji: "🌙",
        description: "Peaceful songs to drift away to",
        url: "https://open.spotify.com/playlist/37i9dQZF1DWZd79rJ6a7lp", // Replace with actual
        mood: "sleep"
    },
    {
        name: "Period Comfort",
        emoji: "🌸",
        description: "Gentle songs for those tough days",
        url: "https://open.spotify.com/playlist/37i9dQZF1DX4WYpdgoIcn6", // Replace with actual
        mood: "period"
    },
];

interface ComfortPlaylistProps {
    compact?: boolean;
}

export default function ComfortPlaylist({ compact = false }: ComfortPlaylistProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (!containerRef.current) return;
        gsap.fromTo(containerRef.current,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
        );
    }, { scope: containerRef });

    const getMoodIcon = (mood: string) => {
        switch (mood) {
            case 'love': return <Heart className="w-4 h-4" />;
            case 'sad': return <Frown className="w-4 h-4" />;
            case 'happy': return <Sparkles className="w-4 h-4" />;
            default: return <Music className="w-4 h-4" />;
        }
    };

    if (compact) {
        return (
            <div ref={containerRef} className="w-full">
                <div className="flex items-center gap-2 mb-3">
                    <Music className="w-5 h-5 text-[#BFA054]" />
                    <h3 className="font-semibold">Quick Playlists</h3>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {playlists.slice(0, 4).map((playlist, index) => (
                        <a
                            key={index}
                            href={playlist.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-shrink-0 glass-card p-3 flex flex-col items-center gap-1 min-w-[80px] hover:scale-105 transition-transform active:scale-95"
                        >
                            <span className="text-2xl">{playlist.emoji}</span>
                            <span className="text-xs text-center">{playlist.name.split(' ')[0]}</span>
                        </a>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="w-full space-y-4">
            <div className="flex items-center gap-2 mb-4">
                <Music className="w-6 h-6 text-[#BFA054]" />
                <h3 className="text-lg font-semibold">Comfort Playlists</h3>
                <span className="text-xs bg-[#BFA054]/20 text-[#BFA054] px-2 py-1 rounded-full">Spotify</span>
            </div>

            <div className="grid gap-3">
                {playlists.map((playlist, index) => (
                    <a
                        key={index}
                        href={playlist.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="glass-card p-4 flex items-center gap-4 hover:scale-[1.02] transition-transform active:scale-98"
                    >
                        <div className="text-3xl">{playlist.emoji}</div>
                        <div className="flex-1">
                            <h4 className="font-semibold flex items-center gap-2">
                                {playlist.name}
                                {getMoodIcon(playlist.mood)}
                            </h4>
                            <p className="text-sm opacity-70">{playlist.description}</p>
                        </div>
                        <ExternalLink className="w-5 h-5 opacity-50" />
                    </a>
                ))}
            </div>

            <p className="text-center text-sm opacity-50">
                🎵 Tap any playlist to open in Spotify
            </p>
        </div>
    );
}
