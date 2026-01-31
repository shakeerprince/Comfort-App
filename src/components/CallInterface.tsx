'use client';

import { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, Maximize2, Minimize2 } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface CallInterfaceProps {
    partnerName: string;
    partnerImage?: string | null;
    isVideo: boolean;
    status: string; // 'ringing' | 'connected'
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
    onEndCall: () => void;
}

export default function CallInterface({ partnerName, partnerImage, isVideo, status, localStream, remoteStream, onEndCall }: CallInterfaceProps) {
    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(!isVideo);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [duration, setDuration] = useState(0);

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // Initial Animation
    useGSAP(() => {
        if (!containerRef.current) return;
        gsap.fromTo(containerRef.current,
            { opacity: 0, scale: 0.95 },
            { opacity: 1, scale: 1, duration: 0.5, ease: 'power3.out' }
        );
    }, { scope: containerRef });

    // Handle Streams
    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    // Remote Audio/Video
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const remoteAudioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        if (remoteStream) {
            console.log("Attaching remote stream", remoteStream.getTracks());
            if (isVideo && remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = remoteStream;
            }
            if (remoteAudioRef.current) {
                remoteAudioRef.current.srcObject = remoteStream;
                remoteAudioRef.current.play().catch(e => console.error("Audio play error", e));
            }
        }
    }, [remoteStream, isVideo]);

    useEffect(() => {
        // Cleanup tracks? No, context handles stream lifecycle.
    }, []);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (status === 'connected') {
            interval = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [status]);

    const formatDuration = (secs: number) => {
        const mins = Math.floor(secs / 60);
        const remainingSecs = secs % 60;
        return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
    };

    const toggleMute = () => {
        if (streamRef.current) {
            streamRef.current.getAudioTracks().forEach(track => track.enabled = !isMuted);
            setIsMuted(!isMuted);
        }
    };

    const toggleCamera = () => {
        // Logic to stop/start video track
        setIsCameraOff(!isCameraOff);
    };

    return (
        <div ref={containerRef} className="fixed inset-0 z-50 bg-[#0b141a] flex flex-col items-center justify-between py-12 px-6">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: `url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")`,
                    backgroundSize: '400px'
                }}
            />

            {/* Remote Video (Fullscreen Background) */}
            {isVideo && (
                <div className="absolute inset-0 z-0">
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover opacity-80"
                    />
                    <div className="absolute inset-0 bg-black/40" /> {/* Overlay for readability */}
                </div>
            )}

            {/* Hidden Audio for Remote Stream */}
            <audio ref={remoteAudioRef} autoPlay />

            {/* Header / Info */}
            <div className="z-10 flex flex-col items-center gap-4 mt-8">
                <div className="relative">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#202c33] shadow-2xl relative z-10">
                        {partnerImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={partnerImage} alt={partnerName} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-gray-600 flex items-center justify-center text-white text-4xl">
                                👤
                            </div>
                        )}
                    </div>
                    {/* Ripple effect only when ringing */}
                    {status === 'ringing' && (
                        <>
                            <div className="absolute inset-0 rounded-full border border-white/20 animate-ping" />
                            <div className="absolute inset-0 rounded-full border border-white/10 animate-ping delay-150" />
                        </>
                    )}
                </div>

                <div className="text-center space-y-1">
                    <h2 className="text-2xl font-semibold text-[#e9edef]">{partnerName}</h2>
                    <p className="text-[#00a884] font-medium tracking-wide">
                        {status === 'connected' ? formatDuration(duration) : (status === 'ringing' ? 'Calling...' : status)}
                    </p>
                    {errorMsg && (
                        <p className="text-red-400 text-sm bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
                            ⚠️ {errorMsg}
                        </p>
                    )}
                </div>
            </div>

            {/* Local Video Preview (Picture in Picture) */}
            {!isCameraOff && (
                <div className="absolute right-4 top-4 w-32 aspect-[3/4] bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10 z-20">
                    <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover transform -scale-x-100"
                    />
                </div>
            )}

            {/* Controls */}
            <div className="w-full max-w-md bg-[#202c33] rounded-3xl p-6 shadow-2xl z-10 border border-white/5">
                <div className="flex items-center justify-between px-4">
                    <button
                        onClick={toggleCamera}
                        className={`p-4 rounded-full transition-all ${isCameraOff ? 'bg-white/10 text-white' : 'bg-[#e9edef]/10 text-white'}`}
                    >
                        {isCameraOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                    </button>

                    <button
                        onClick={toggleMute}
                        className={`p-4 rounded-full transition-all ${isMuted ? 'bg-white/10 text-white' : 'bg-[#e9edef]/10 text-white'}`}
                    >
                        {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                    </button>

                    <button
                        onClick={onEndCall}
                        className="p-4 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30 transform hover:scale-105 transition-all"
                    >
                        <PhoneOff className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>
    );
}
