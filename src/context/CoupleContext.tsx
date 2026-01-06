'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';

// Types
export type UserRole = 'shaker' | 'keerthi';
export type VibeStatus = 'focused' | 'miss-you' | 'sleepy' | 'happy' | 'sad' | 'cuddly';

export interface UserState {
    status: VibeStatus;
    location: { lat: number; lng: number } | null;
    lastPulse: number | null;
    lastSeen: number;
}

export interface Message {
    id: string;
    sender: UserRole;
    content: string;
    type: 'text' | 'vanish';
    timestamp: number;
    readAt?: number;
}

interface CoupleContextType {
    // Identity
    myRole: UserRole;
    partnerRole: UserRole;
    setMyRole: (role: UserRole) => void;

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

    // Notifications
    sendNotification: (type: 'hug' | 'pain' | 'craving' | 'love') => void;
}

const CoupleContext = createContext<CoupleContextType | null>(null);

const STORAGE_KEY = 'cozycycle-couple';
const POLL_INTERVAL = 5000; // Poll every 5 seconds (increased for reliability)

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

export function CoupleProvider({ children }: { children: ReactNode }) {
    const [myRole, setMyRoleState] = useState<UserRole>('keerthi');
    const [myStatus, setMyStatusState] = useState<VibeStatus>('happy');
    const [partnerStatus, setPartnerStatus] = useState<VibeStatus>('happy');
    const [myLocation, setMyLocationState] = useState<{ lat: number; lng: number } | null>(null);
    const [partnerLocation, setPartnerLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [lastPartnerPulse, setLastPartnerPulse] = useState<number | null>(null);
    const [partnerLastSeen, setPartnerLastSeen] = useState<number | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isOnline, setIsOnline] = useState(true);

    const lastPulseRef = useRef<number | null>(null);
    const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const pendingMessagesRef = useRef<Set<string>>(new Set()); // Track pending message IDs
    const isSendingRef = useRef(false);

    const partnerRole = myRole === 'shaker' ? 'keerthi' : 'shaker';

    // Calculate distance
    const distance = myLocation && partnerLocation
        ? calculateDistance(myLocation.lat, myLocation.lng, partnerLocation.lat, partnerLocation.lng)
        : null;

    // Load saved state from localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    if (parsed.myRole) setMyRoleState(parsed.myRole);
                } catch (e) {
                    console.error('Failed to parse saved state');
                }
            }
        }
    }, []);

    // Save role to localStorage
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ myRole }));
    }, [myRole]);

    // Poll for updates from server
    useEffect(() => {
        const pollServer = async () => {
            // Don't poll while sending a message (prevents race condition)
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
                        const serverMessages: Message[] = data.messages.map((m: { id: string; sender: string; content: string; type: string; timestamp: number; read_at: number | null }) => ({
                            id: m.id,
                            sender: m.sender as UserRole,
                            content: m.content,
                            type: m.type as 'text' | 'vanish',
                            timestamp: Number(m.timestamp),
                            readAt: m.read_at ? Number(m.read_at) : undefined
                        }));

                        // Merge server messages with pending local messages
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
                    if (data.users && data.users[partnerRole]) {
                        const partner = data.users[partnerRole];
                        setPartnerStatus(partner.status as VibeStatus);
                        if (partner.lat && partner.lng) {
                            setPartnerLocation({ lat: partner.lat, lng: partner.lng });
                        }
                        if (partner.lastPulse && partner.lastPulse !== lastPulseRef.current) {
                            lastPulseRef.current = partner.lastPulse;
                            setLastPartnerPulse(partner.lastPulse);
                            // Trigger vibration
                            if (navigator.vibrate) {
                                navigator.vibrate([200, 100, 200]);
                            }
                        }
                        if (partner.lastSeen) {
                            setPartnerLastSeen(partner.lastSeen);
                        }
                    }
                }

                setIsOnline(true);
            } catch (error) {
                console.error('Poll error:', error);
                setIsOnline(false);
            }

            // Schedule next poll
            pollTimeoutRef.current = setTimeout(pollServer, POLL_INTERVAL);
        };

        // Initial delay to let any pending operations complete
        pollTimeoutRef.current = setTimeout(pollServer, 1000);

        return () => {
            if (pollTimeoutRef.current) {
                clearTimeout(pollTimeoutRef.current);
            }
        };
    }, [partnerRole]);

    // Update status on server
    const updateServerStatus = useCallback(async (updates: { status?: VibeStatus; lat?: number; lng?: number; lastPulse?: number }) => {
        try {
            await fetch('/api/status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userRole: myRole, ...updates })
            });
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    }, [myRole]);

    // Set my role
    const setMyRole = useCallback((role: UserRole) => {
        setMyRoleState(role);
    }, []);

    // Set my status and sync
    const setMyStatus = useCallback((status: VibeStatus) => {
        setMyStatusState(status);
        updateServerStatus({ status });
    }, [updateServerStatus]);

    // Set my location and sync
    const setMyLocation = useCallback((loc: { lat: number; lng: number } | null) => {
        setMyLocationState(loc);
        if (loc) {
            updateServerStatus({ lat: loc.lat, lng: loc.lng });
        }
    }, [updateServerStatus]);

    // Send pulse
    const sendPulse = useCallback(() => {
        const pulseTime = Date.now();
        updateServerStatus({ lastPulse: pulseTime });
        // Self feedback vibration
        if (navigator.vibrate) {
            navigator.vibrate(100);
        }
    }, [updateServerStatus]);

    // Send message
    const sendMessage = useCallback(async (content: string, type: 'text' | 'vanish') => {
        const message: Message = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            sender: myRole,
            content,
            type,
            timestamp: Date.now(),
        };

        // Mark as pending
        pendingMessagesRef.current.add(message.id);
        isSendingRef.current = true;

        // Optimistic update
        setMessages(prev => [...prev, message]);

        try {
            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(message)
            });

            if (res.ok) {
                // Message saved successfully, remove from pending
                pendingMessagesRef.current.delete(message.id);
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            // Keep in pending so it stays visible
        } finally {
            isSendingRef.current = false;
        }
    }, [myRole]);

    // Mark as read
    const markAsRead = useCallback(async (messageId: string) => {
        const readAt = Date.now();

        // Optimistic update
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
        // Optimistic update
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
        try {
            await fetch('/api/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    from: myRole,
                    to: partnerRole,
                    type,
                    timestamp: Date.now()
                })
            });
        } catch (error) {
            console.error('Failed to send notification:', error);
        }
    }, [myRole, partnerRole]);

    return (
        <CoupleContext.Provider value={{
            myRole,
            partnerRole,
            setMyRole,
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
            sendNotification,
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
