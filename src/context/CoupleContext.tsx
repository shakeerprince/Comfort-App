'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { useAuth } from './AuthContext';

// Types
export type VibeStatus = 'focused' | 'miss-you' | 'sleepy' | 'happy' | 'sad' | 'cuddly';

export interface UserState {
    name?: string;
    profilePic?: string;
    status: VibeStatus;
    location: { lat: number; lng: number } | null;
    lastPulse: number | null;
    lastSeen: number;
}

export interface Message {
    id: string;
    senderId: string;
    senderName?: string;
    content: string;
    type: 'text' | 'vanish';
    timestamp: number;
    readAt?: number | null;
}

interface CoupleContextType {
    // Identity
    myId: string | null;
    myName: string;
    partnerId: string | null;
    partnerName: string;

    // Status
    myStatus: VibeStatus;
    partnerStatus: VibeStatus;
    setMyStatus: (status: VibeStatus) => void;

    // Location
    myLocation: { lat: number; lng: number } | null;
    partnerLocation: { lat: number; lng: number } | null;
    setMyLocation: (loc: { lat: number; lng: number } | null) => void;
    distance: number | null;

    // Pulse
    lastPartnerPulse: number | null;
    sendPulse: () => void;

    // Chat
    messages: Message[];
    sendMessage: (content: string, type: 'text' | 'vanish') => void;
    markAsRead: (messageId: string) => void;
    deleteMessage: (messageId: string) => void;

    // Connection status
    isOnline: boolean;
    partnerLastSeen: number | null;
    isPaired: boolean;

    // Notifications
    sendNotification: (type: 'hug' | 'pain' | 'craving' | 'love') => void;
    notificationQueue: any[]; // Queue of notifications to show
    clearNotification: (id: string) => void;

    // Calls
    incomingCall: { callerId: string; type: 'audio' | 'video'; status: string; offer?: RTCSessionDescriptionInit } | null;
    activeCallConfig: { isActive: boolean; type: 'audio' | 'video'; isIncoming: boolean; status: string } | null;
    startCall: (type: 'audio' | 'video') => Promise<void>;
    endCall: () => Promise<void>;
    answerCall: () => Promise<void>;
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
}

const CoupleContext = createContext<CoupleContextType | null>(null);

export const CoupleProvider = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, user, isPaired } = useAuth();
    const myId = user?.id || null;
    const coupleId = (user as any)?.coupleId || null;
    const myName = user?.name || 'Partner';
    const partnerId = (user as any)?.partnerId || null;
    const partnerName = 'Partner'; // derived or passed

    // Existing State
    // ... we need to make sure we don't duplicate state that was already there or if I deleted it.
    // Based on my previous view, I see I pasted the NEW state (incomingCall etc) right after "existing code".
    // but the closure for CoupleProvider was missing.

    // Let's assume the previous replace removed the provider opening.
    // I will restart the provider here.

    // Call State
    const [incomingCall, setIncomingCall] = useState<{ callerId: string; type: 'audio' | 'video'; status: string; offer?: RTCSessionDescriptionInit } | null>(null);
    const [activeCallConfig, setActiveCallConfig] = useState<{ isActive: boolean; type: 'audio' | 'video'; isIncoming: boolean; status: string } | null>(null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const iceCandidatesBuffer = useRef<RTCIceCandidate[]>([]);

    const cleanupCall = useCallback(() => {
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            setLocalStream(null);
        }
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }
        setRemoteStream(null);
        setIncomingCall(null);
        setActiveCallConfig(null);
        iceCandidatesBuffer.current = [];
    }, [localStream]);

    const createPeerConnection = useCallback(() => {
        if (peerConnectionRef.current) return peerConnectionRef.current;

        const pc = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:global.stun.twilio.com:3478' }
            ]
        });

        pc.onicecandidate = async (event) => {
            if (event.candidate) {
                // Send candidate to Signaling Server
                const role = activeCallConfig?.isIncoming ? 'callee' : 'caller';
                // Wait for activeCallConfig to be set/stable or pass role as arg?
                // Using ref or getting role from somewhere else might be safer, but let's try this.
                // Actually activeCallConfig might be stale in closure.
                // We will handle this by checking pc.localDescription?
                // Simplified: Just send it.
                // We need to know our role.
                await fetch('/api/call', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'signal',
                        candidate: event.candidate,
                        role: pc.localDescription?.type === 'offer' ? 'caller' : 'callee'
                    })
                });
            }
        };

        pc.ontrack = (event) => {
            console.log("Remote track received", event.streams[0]);
            setRemoteStream(event.streams[0]);
        };

        peerConnectionRef.current = pc;
        return pc;
    }, [activeCallConfig]);

    // Poll for calls and signals
    useEffect(() => {
        if (!isAuthenticated || !coupleId) return;

        const checkCall = async () => {
            try {
                const res = await fetch('/api/call');
                if (res.ok) {
                    const data = await res.json();
                    const call = data.activeCall;

                    if (call) {
                        // SIGNALING LOGIC
                        const pc = peerConnectionRef.current;
                        const isCaller = call.callerId === myId;

                        // 1. Handle Remote Description (Answer for Caller, Offer for Callee handled in answerCall usually?)
                        // Actually, Callee processes Offer when answering. Caller processes Answer here.
                        if (isCaller && call.answer && pc && pc.signalingState === 'have-local-offer') {
                            await pc.setRemoteDescription(new RTCSessionDescription(call.answer));
                        }

                        // 2. Handle ICE Candidates
                        const candidates = isCaller ? call.calleeCandidates : call.callerCandidates;
                        if (pc && candidates && candidates.length > 0) {
                            // simplistic: add all. Browser dedupes.
                            for (const cand of candidates) {
                                try {
                                    await pc.addIceCandidate(new RTCIceCandidate(cand));
                                } catch (e) { /* ignore duplicate or invalid */ }
                            }
                        }

                        // Existing State Logic
                        if (isCaller) {
                            if (activeCallConfig && activeCallConfig.isActive) {
                                if (activeCallConfig.status !== call.status) {
                                    setActiveCallConfig(prev => prev ? ({ ...prev, status: call.status }) : null);
                                }
                            } else {
                                // Re-sync if page refreshed
                                // NOTE: This misses 'offer' reconstruction if refreshed. 
                                // For MVP, if you refresh mid-call, it might break.
                                setActiveCallConfig({ isActive: true, type: call.type, isIncoming: false, status: call.status });
                            }
                        } else {
                            // Incoming
                            if (call.status === 'ringing') {
                                if (!activeCallConfig?.isActive) setIncomingCall(call);
                            } else if (call.status === 'connected') {
                                setIncomingCall(null);
                                if (!activeCallConfig) {
                                    setActiveCallConfig({ isActive: true, type: call.type, isIncoming: true, status: 'connected' });
                                } else if (activeCallConfig.status !== 'connected') {
                                    setActiveCallConfig(prev => prev ? ({ ...prev, status: 'connected' }) : null);
                                }
                            }
                        }
                    } else {
                        // Call ended
                        if (activeCallConfig || incomingCall) {
                            cleanupCall();
                        }
                    }
                }
            } catch (e) {
                console.error("Call poll error", e);
            }
        };

        const interval = setInterval(checkCall, 1000); // Poll faster (1s) for signaling
        return () => clearInterval(interval);
    }, [isAuthenticated, coupleId, myId, incomingCall, activeCallConfig, cleanupCall]);

    const startCall = useCallback(async (type: 'audio' | 'video') => {
        try {
            // 1. Get User Media
            const stream = await navigator.mediaDevices.getUserMedia({ video: type === 'video', audio: true });
            setLocalStream(stream);

            // 2. Create PC & Add Tracks
            const pc = new RTCPeerConnection({
                iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
            });

            // Re-implement onicecandidate here to capture closure role correctly? 
            // Or use the refined createPeerConnection logic above.
            // Let's keep it defined inside this flow to capture 'caller' role explicitly?
            // Actually, let's use the ref.

            pc.onicecandidate = async (event) => {
                if (event.candidate) {
                    await fetch('/api/call', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'signal', candidate: event.candidate, role: 'caller' })
                    });
                }
            };
            pc.ontrack = (event) => setRemoteStream(event.streams[0]);

            stream.getTracks().forEach(track => pc.addTrack(track, stream));
            peerConnectionRef.current = pc;

            // 3. Create Offer
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            // 4. Send to Server
            setActiveCallConfig({ isActive: true, type, isIncoming: false, status: 'ringing' });
            await fetch('/api/call', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'start', type, role: 'caller', offer })
            });

            // Hack: send offer separately as signal if start doesn't support it?
            // My API modification supports updating offer via 'signal', but 'start' resets it.
            // I need to update 'start' in API to accept offer, OR call signal immediately after.
            // Let's call signal immediately.
            await fetch('/api/call', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'signal', offer, role: 'caller' })
            });

        } catch (err) {
            console.error("Start call error", err);
            // Fallback UI error needed?
        }
    }, [activeCallConfig]); // Dependencies?

    const endCall = useCallback(async () => {
        cleanupCall();
        await fetch('/api/call', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'end' })
        });
    }, [cleanupCall]);

    const answerCall = useCallback(async () => {
        if (!incomingCall) return;

        try {
            // 1. Get User Media
            const stream = await navigator.mediaDevices.getUserMedia({ video: incomingCall.type === 'video', audio: true });
            setLocalStream(stream);

            // 2. Create PC
            const pc = new RTCPeerConnection({
                iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
            });

            pc.onicecandidate = async (event) => {
                if (event.candidate) {
                    await fetch('/api/call', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'signal', candidate: event.candidate, role: 'callee' })
                    });
                }
            };
            pc.ontrack = (event) => setRemoteStream(event.streams[0]);

            stream.getTracks().forEach(track => pc.addTrack(track, stream));
            peerConnectionRef.current = pc;

            // 3. Set Remote Description (Offer)
            if (incomingCall.offer) {
                await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));

                // 4. Create Answer
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);

                // 5. Send Answer
                setActiveCallConfig({ isActive: true, type: incomingCall.type, isIncoming: true, status: 'connected' });
                setIncomingCall(null);

                await fetch('/api/call', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'answer' })
                });

                await fetch('/api/call', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'signal', answer, role: 'callee' })
                });
            } else {
                console.error("No offer found in incoming call");
            }
        } catch (e) {
            console.error("Answer call error", e);
        }
    }, [incomingCall]);

    // ... return value ...
    // Add localStream, remoteStream to context value

    const POLL_INTERVAL = 5000; // Poll every 5 seconds

    // Calculate distance between two coordinates (Haversine formula)
    // Calculate distance between two coordinates (Haversine formula)
    function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    const [myStatus, setMyStatusState] = useState<VibeStatus>('happy');
    const [partnerStatus, setPartnerStatus] = useState<VibeStatus>('happy');
    const [myLocation, setMyLocationState] = useState<{ lat: number; lng: number } | null>(null);
    const [partnerLocation, setPartnerLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [lastPartnerPulse, setLastPartnerPulse] = useState<number | null>(null);
    const [partnerLastSeen, setPartnerLastSeen] = useState<number | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isOnline, setIsOnline] = useState(true);
    const [notificationQueue, setNotificationQueue] = useState<any[]>([]);

    // Refs for deduplication
    const processedNotificationsRef = useRef<Set<string>>(new Set());

    const lastPulseRef = useRef<number | null>(null);
    const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const pendingMessagesRef = useRef<Set<string>>(new Set());
    const isSendingRef = useRef(false);


    // Calculate distance
    const distance = myLocation && partnerLocation
        ? calculateDistance(myLocation.lat, myLocation.lng, partnerLocation.lat, partnerLocation.lng)
        : null;

    // Poll for updates from server
    useEffect(() => {
        if (!isAuthenticated || !coupleId) {
            return;
        }

        const pollServer = async () => {
            if (isSendingRef.current) {
                pollTimeoutRef.current = setTimeout(pollServer, POLL_INTERVAL);
                return;
            }

            try {
                // Fetch messages
                const messagesRes = await fetch('/api/messages');
                if (messagesRes.ok) {
                    const data = await messagesRes.json();
                    if (data.messages) {
                        const serverMessages: Message[] = data.messages.map((m: any) => ({
                            id: m.id,
                            senderId: m.senderId,
                            senderName: m.senderName,
                            content: m.content,
                            type: m.type as 'text' | 'vanish',
                            timestamp: m.timestamp,
                            readAt: m.readAt
                        }));

                        setMessages(prev => {
                            const serverIds = new Set(serverMessages.map(m => m.id));
                            const pendingLocal = prev.filter(m =>
                                pendingMessagesRef.current.has(m.id) && !serverIds.has(m.id)
                            );
                            return [...serverMessages, ...pendingLocal].sort((a, b) => a.timestamp - b.timestamp);
                        });
                    }
                }

                // Fetch status
                const statusRes = await fetch('/api/status');
                if (statusRes.ok) {
                    const data = await statusRes.json();
                    if (data.users && partnerId && data.users[partnerId]) {
                        const partnerData = data.users[partnerId];
                        setPartnerStatus(partnerData.status as VibeStatus);
                        if (partnerData.lat && partnerData.lng) {
                            setPartnerLocation({ lat: partnerData.lat, lng: partnerData.lng });
                        }
                        if (partnerData.lastPulse && partnerData.lastPulse !== lastPulseRef.current) {
                            lastPulseRef.current = partnerData.lastPulse;
                            setLastPartnerPulse(partnerData.lastPulse);
                            if (navigator.vibrate) {
                                navigator.vibrate([200, 100, 200]);
                            }
                        }
                        if (partnerData.lastSeen) {
                            setPartnerLastSeen(partnerData.lastSeen);
                        }
                    }
                }

                setIsOnline(true);
            } catch (error) {
                console.error('Poll error:', error);
                setIsOnline(false);
            }

            pollTimeoutRef.current = setTimeout(pollServer, POLL_INTERVAL);
        };

        pollTimeoutRef.current = setTimeout(pollServer, 1000);

        return () => {
            if (pollTimeoutRef.current) {
                clearTimeout(pollTimeoutRef.current);
            }
        };
    }, [isAuthenticated, coupleId, partnerId]);

    // Update status on server
    const updateServerStatus = useCallback(async (updates: { status?: VibeStatus; lat?: number; lng?: number; lastPulse?: number }) => {
        if (!isAuthenticated) return;

        try {
            await fetch('/api/status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    }, [isAuthenticated]);

    // Set my status and sync
    const setMyStatus = useCallback((status: VibeStatus) => {
        setMyStatusState(status);
        updateServerStatus({ status });
    }, [updateServerStatus]);

    const lastLocationUpdateRef = useRef<number>(0);

    // Set my location and sync (Throttled)
    const setMyLocation = useCallback((loc: { lat: number; lng: number } | null) => {
        setMyLocationState(loc);
        if (loc) {
            const now = Date.now();
            // Sync to server only every 5 seconds to match poll rate and save battery/data
            if (now - lastLocationUpdateRef.current > 5000) {
                updateServerStatus({ lat: loc.lat, lng: loc.lng });
                lastLocationUpdateRef.current = now;
            }
        }
    }, [updateServerStatus]);

    // Send pulse
    const sendPulse = useCallback(() => {
        const pulseTime = Date.now();
        updateServerStatus({ lastPulse: pulseTime });
        if (navigator.vibrate) {
            navigator.vibrate(100);
        }
    }, [updateServerStatus]);

    // Send message
    const sendMessage = useCallback(async (content: string, type: 'text' | 'vanish') => {
        if (!isAuthenticated || !isPaired) return;

        const message: Message = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            senderId: myId || '',
            senderName: myName,
            content,
            type,
            timestamp: Date.now(),
        };

        pendingMessagesRef.current.add(message.id);
        isSendingRef.current = true;

        setMessages(prev => [...prev, message]);

        try {
            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, type })
            });

            if (res.ok) {
                pendingMessagesRef.current.delete(message.id);
            }
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            isSendingRef.current = false;
        }
    }, [isAuthenticated, isPaired, myId, myName]);

    // Mark as read
    const markAsRead = useCallback(async (messageId: string) => {
        const readAt = Date.now();

        setMessages(prev => prev.map(m =>
            m.id === messageId && !m.readAt ? { ...m, readAt } : m
        ));

        try {
            await fetch('/api/messages', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messageId, readAt })
            });
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    }, []);

    // Delete message
    const deleteMessage = useCallback(async (messageId: string) => {
        setMessages(prev => prev.filter(m => m.id !== messageId));

        try {
            await fetch('/api/messages', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messageId })
            });
        } catch (error) {
            console.error('Failed to delete message:', error);
        }
    }, []);

    // Send notification to partner
    const sendNotification = useCallback(async (type: 'hug' | 'pain' | 'craving' | 'love') => {
        if (!isAuthenticated || !isPaired) return;

        try {
            await fetch('/api/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type })
            });
        } catch (error) {
            console.error('Failed to send notification:', error);
        }
    }, [isAuthenticated, isPaired]);



    return (
        <CoupleContext.Provider value={{
            myId,
            myName,
            partnerId,
            partnerName,
            myStatus,
            partnerStatus,
            setMyStatus,
            myLocation,
            partnerLocation,
            setMyLocation,
            distance,
            lastPartnerPulse,
            sendPulse,
            messages,
            sendMessage,
            markAsRead,
            deleteMessage,
            isOnline,
            partnerLastSeen,
            isPaired,
            sendNotification,
            notificationQueue,
            clearNotification: (id: string) => setNotificationQueue(prev => prev.filter(n => n.id !== id)),

            // Calls
            incomingCall,
            activeCallConfig,
            startCall,
            endCall,
            answerCall,
            localStream,
            remoteStream
        }}>
            {children}
        </CoupleContext.Provider>
    );
}

export function useCouple() {
    const context = useContext(CoupleContext);
    if (!context) {
        throw new Error('useCouple must be used within a CoupleProvider');
    }
    return context;
}
