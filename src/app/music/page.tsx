'use client';

import { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Music, Headphones, Heart, ExternalLink } from 'lucide-react';

gsap.registerPlugin(useGSAP);

const playlists = [
    {
        id: 'softpop',
        title: 'Soft Pop Hits 🎵',
        description: 'Special playlist for you',
        spotifyId: '37i9dQZF1DX44F1QWqYoaV', // User's playlist
        emoji: '💖',
        color: 'from-pink-500 to-rose-500',
    },
    {
        id: 'comfort',
        title: 'Period Comfort 🌸',
        description: 'Soft, calming music for painful days',
        spotifyId: '37i9dQZF1DX3rxVfibe1L0', // Peaceful Piano
        emoji: '🎹',
        color: 'from-pink-400 to-rose-400',
    },
    {
        id: 'trending',
        title: 'Trending English 🔥',
        description: 'Latest English hits & CO2 vibes',
        spotifyId: '37i9dQZF1DXcBWIGoYBM5M', // Today's Top Hits
        emoji: '🎤',
        color: 'from-purple-500 to-pink-500',
    },
    {
        id: 'englishlove',
        title: 'English Love Songs 💗',
        description: 'Romantic English ballads',
        spotifyId: '37i9dQZF1DX5IDTimEWoTd', // Sad Songs
        emoji: '🥹',
        color: 'from-rose-400 to-red-400',
    },
    {
        id: 'cozy',
        title: 'Cozy Vibes ☕',
        description: 'Warm and fuzzy feelings',
        spotifyId: '37i9dQZF1DX4WYpdgoIcn6', // Chill Hits
        emoji: '☕',
        color: 'from-amber-400 to-orange-400',
    },
    {
        id: 'lofi',
        title: 'Lo-Fi Beats 🎧',
        description: 'Chill beats to relax',
        spotifyId: '37i9dQZF1DWWQRwui0ExPn', // Lo-Fi Beats
        emoji: '🎧',
        color: 'from-cyan-400 to-blue-400',
    },
    {
        id: 'sleep',
        title: 'Sleepy Time 😴',
        description: 'Drift off peacefully',
        spotifyId: '37i9dQZF1DWZd79rJ6a7lp', // Sleep
        emoji: '🌙',
        color: 'from-indigo-400 to-purple-400',
    },
    {
        id: 'happy',
        title: 'Happy Boost 🌈',
        description: 'When you need a pick-me-up',
        spotifyId: '37i9dQZF1DXdPec7aLTmlC', // Happy Hits
        emoji: '🌈',
        color: 'from-yellow-400 to-green-400',
    },
    {
        id: 'romance',
        title: 'Our Songs 💕',
        description: 'Music that reminds us of each other',
        spotifyId: '37i9dQZF1DX50QitC6Oqtn', // Love Pop
        emoji: '💕',
        color: 'from-red-400 to-pink-400',
    },
];

const quickSounds = [
    { emoji: '🌧️', label: 'Rain', url: 'https://www.youtube.com/watch?v=mPZkdNFkNps' },
    { emoji: '🌊', label: 'Ocean', url: 'https://www.youtube.com/watch?v=WHPEKLQID4U' },
    { emoji: '🔥', label: 'Fireplace', url: 'https://www.youtube.com/watch?v=L_LUpnjgPso' },
    { emoji: '☕', label: 'Cafe', url: 'https://www.youtube.com/watch?v=h2zkV-l_TbY' },
];

export default function MusicPage() {
    const [activePlaylist, setActivePlaylist] = useState<string | null>(null);
    const mainRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (!mainRef.current) return;

        const sections = mainRef.current.querySelectorAll('.section');
        gsap.fromTo(sections,
            { opacity: 0, y: 20 },
            {
                opacity: 1,
                y: 0,
                duration: 0.5,
                stagger: 0.15,
                ease: 'power2.out',
            }
        );
    }, { scope: mainRef });

    const selectedPlaylist = playlists.find(p => p.id === activePlaylist);

    return (
        <main ref={mainRef} className="flex-1 px-6 py-8">
            {/* Header */}
            <section className="section text-center mb-6">
                <div className="flex items-center justify-center gap-3 mb-3">
                    <Music className="w-8 h-8 text-purple-400" />
                    <h1 className="text-3xl font-bold text-gradient">Music & Vibes</h1>
                </div>
                <p className="text-lg opacity-70">
                    Curated playlists for every mood 🎧
                </p>
            </section>

            {/* Spotify Player */}
            {selectedPlaylist && (
                <section className="section mb-8 max-w-md mx-auto">
                    <div className="glass-card p-4 rounded-2xl">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold flex items-center gap-2">
                                <span>{selectedPlaylist.emoji}</span>
                                {selectedPlaylist.title}
                            </h3>
                            <button
                                onClick={() => setActivePlaylist(null)}
                                className="text-xs opacity-50 hover:opacity-100"
                            >
                                Close
                            </button>
                        </div>

                        <iframe
                            src={`https://open.spotify.com/embed/playlist/${selectedPlaylist.spotifyId}?theme=0`}
                            width="100%"
                            height="352"
                            frameBorder="0"
                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                            loading="lazy"
                            className="rounded-xl"
                        />
                    </div>
                </section>
            )}

            {/* Playlists Grid */}
            <section className="section max-w-md mx-auto mb-8">
                <div className="flex items-center justify-center gap-2 mb-4">
                    <Headphones className="w-5 h-5 text-purple-400" />
                    <h2 className="text-lg font-semibold">Comfort Playlists</h2>
                </div>

                <div className="space-y-3">
                    {playlists.map((playlist) => (
                        <button
                            key={playlist.id}
                            onClick={() => setActivePlaylist(playlist.id)}
                            className={`w-full glass-card p-4 flex items-center gap-4 hover:scale-102 transition-all ${activePlaylist === playlist.id ? 'ring-2 ring-pink-400' : ''
                                }`}
                        >
                            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${playlist.color} flex items-center justify-center text-2xl`}>
                                {playlist.emoji}
                            </div>
                            <div className="text-left flex-1">
                                <h3 className="font-semibold">{playlist.title}</h3>
                                <p className="text-sm opacity-60">{playlist.description}</p>
                            </div>
                            <ExternalLink className="w-5 h-5 opacity-40" />
                        </button>
                    ))}
                </div>
            </section>

            {/* Quick Ambient Sounds */}
            <section className="section max-w-md mx-auto">
                <h3 className="text-lg font-semibold text-center mb-4">Ambient Sounds</h3>
                <div className="grid grid-cols-4 gap-3">
                    {quickSounds.map((sound) => (
                        <a
                            key={sound.label}
                            href={sound.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="glass-card p-4 flex flex-col items-center gap-2 hover:scale-105 transition-transform"
                        >
                            <span className="text-2xl">{sound.emoji}</span>
                            <span className="text-xs">{sound.label}</span>
                        </a>
                    ))}
                </div>
            </section>

            {/* Partner's Note */}
            <section className="section max-w-md mx-auto mt-8">
                <div className="empathy-box">
                    <div className="flex items-start gap-3">
                        <Heart className="w-5 h-5 text-pink-400 flex-shrink-0 mt-1" fill="#f472b6" />
                        <div>
                            <p className="text-sm">
                                Put on some music, close your eyes, and let your partner know if you need anything.
                                We&apos;re here for you. 💕
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
