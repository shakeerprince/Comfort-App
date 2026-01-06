'use client';

import { useRef, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useCouple } from '@/context/CoupleContext';
import { MapPin, Navigation, RefreshCw, AlertCircle, ExternalLink } from 'lucide-react';

gsap.registerPlugin(useGSAP);

// Dynamically import map to avoid SSR issues
const MapComponent = dynamic(() => import('@/components/LocationMap'), {
    ssr: false,
    loading: () => (
        <div className="h-[400px] rounded-2xl bg-white/10 flex items-center justify-center">
            <div className="text-center">
                <MapPin className="w-8 h-8 mx-auto mb-2 animate-pulse opacity-50" />
                <p className="text-sm opacity-50">Loading map...</p>
            </div>
        </div>
    ),
});

export default function LocationPage() {
    const { myRole, partnerRole, myLocation, partnerLocation, setMyLocation, distance } = useCouple();
    const [isTracking, setIsTracking] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [watchId, setWatchId] = useState<number | null>(null);
    const mainRef = useRef<HTMLDivElement>(null);

    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

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

    const startTracking = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            return;
        }

        setError(null);
        setIsTracking(true);

        const id = navigator.geolocation.watchPosition(
            (position) => {
                setMyLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
                setError(null);
            },
            (err) => {
                setError(`Error: ${err.message}`);
                setIsTracking(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 5000,
            }
        );

        setWatchId(id);
    };

    const stopTracking = () => {
        if (watchId !== null) {
            navigator.geolocation.clearWatch(watchId);
            setWatchId(null);
        }
        setIsTracking(false);
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (watchId !== null) {
                navigator.geolocation.clearWatch(watchId);
            }
        };
    }, [watchId]);

    return (
        <main ref={mainRef} className="flex-1 px-6 py-8">
            {/* Header */}
            <section className="section text-center mb-6">
                <div className="flex items-center justify-center gap-3 mb-3">
                    <MapPin className="w-8 h-8 text-blue-400" />
                    <h1 className="text-3xl font-bold text-gradient">Live Location</h1>
                </div>
                <p className="text-lg opacity-70">
                    See where {capitalize(partnerRole)} is 💕
                </p>
            </section>

            {/* Distance Display */}
            <section className="section cozy-card p-6 mb-6 max-w-md mx-auto text-center">
                <p className="text-sm opacity-60 mb-2">Distance Apart</p>
                {distance !== null ? (
                    <p className="text-4xl font-bold text-gradient">
                        {distance < 1 ? `${Math.round(distance * 1000)} meters` : `${distance.toFixed(1)} km`}
                    </p>
                ) : (
                    <p className="text-2xl opacity-40">Both users need to share location</p>
                )}
            </section>

            {/* Map */}
            <section className="section max-w-2xl mx-auto mb-6">
                <div className="glass-card p-4 rounded-2xl overflow-hidden">
                    <MapComponent
                        myLocation={myLocation}
                        partnerLocation={partnerLocation}
                        myRole={myRole}
                        partnerRole={partnerRole}
                    />
                </div>
            </section>

            {/* Navigate to Partner */}
            {partnerLocation && (
                <section className="section max-w-md mx-auto mb-6">
                    <button
                        onClick={() => {
                            const url = `https://www.google.com/maps/dir/?api=1&destination=${partnerLocation.lat},${partnerLocation.lng}&travelmode=driving`;
                            window.open(url, '_blank');
                        }}
                        className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-4 px-6 rounded-2xl font-semibold flex items-center justify-center gap-3 hover:scale-105 transition-transform shadow-lg shadow-blue-500/30"
                    >
                        <Navigation className="w-6 h-6" />
                        Navigate to {capitalize(partnerRole)}
                        <ExternalLink className="w-5 h-5 opacity-70" />
                    </button>
                    <p className="text-xs text-center opacity-50 mt-2">
                        Opens Google Maps with directions 🗺️
                    </p>
                </section>
            )}

            {/* Controls */}
            <section className="section max-w-md mx-auto">
                <div className="glass-card p-6">
                    <h3 className="font-semibold mb-4 text-center">Location Sharing</h3>

                    {error && (
                        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center gap-2 text-red-600 dark:text-red-300">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <span className="text-sm">{error}</span>
                        </div>
                    )}

                    <div className="flex gap-3">
                        {!isTracking ? (
                            <button
                                onClick={startTracking}
                                className="flex-1 btn-cozy flex items-center justify-center gap-2"
                            >
                                <Navigation className="w-5 h-5" />
                                Share My Location
                            </button>
                        ) : (
                            <button
                                onClick={stopTracking}
                                className="flex-1 py-3 px-6 rounded-full bg-red-500 text-white font-semibold flex items-center justify-center gap-2"
                            >
                                <RefreshCw className="w-5 h-5 animate-spin" />
                                Stop Sharing
                            </button>
                        )}
                    </div>

                    {myLocation && (
                        <p className="text-xs text-center opacity-50 mt-4">
                            📍 Your location: {myLocation.lat.toFixed(4)}, {myLocation.lng.toFixed(4)}
                        </p>
                    )}

                    {partnerLocation && (
                        <p className="text-xs text-center opacity-50 mt-2">
                            💕 {capitalize(partnerRole)}&apos;s location: {partnerLocation.lat.toFixed(4)}, {partnerLocation.lng.toFixed(4)}
                        </p>
                    )}
                </div>
            </section>
        </main>
    );
}
