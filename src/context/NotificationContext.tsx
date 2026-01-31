'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useCouple } from './CoupleContext';
import { useAuth } from './AuthContext';

interface Notification {
    id: string;
    fromUserId: string;
    fromUserName: string;
    type: string;
    message: string;
    timestamp: number;
    read: boolean;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    markAsRead: (id: string) => void;
    clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

const POLL_INTERVAL = 10000; // Check every 10 seconds
const LOVE_REMINDER_INTERVAL = 2 * 60 * 60 * 1000; // 2 hours in ms

// Love reminder templates (use {partnerName} placeholder)
const loveReminderTemplates = [
    "{partnerName} is thinking about you right now... 💕",
    "Your {partnerName} loves you more than you'll ever know 🥰",
    "Hey beautiful... {partnerName} just wanted you to know - you're amazing 💓",
    "{partnerName} is counting every second until they can see you again 💘",
    "{partnerName} would cross oceans for you. Always remember that 🌊💕",
    "{partnerName} falls in love with you a little more every single day 💝",
    "When {partnerName} imagines their future, you're in every single frame 🎬💕",
    "You are irreplaceable. To {partnerName}, you're the only one who matters 🌹",
    "Right now, somewhere, {partnerName} is smiling thinking about you 🤗",
    "You're {partnerName}'s safe place, their home, their everything 💖",
];

function replacePlaceholders(message: string, partnerName: string): string {
    return message.replace(/{partnerName}/g, partnerName);
}

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [permissionGranted, setPermissionGranted] = useState(false);
    const { sendNotification, partnerName, isPaired } = useCouple();
    const { isAuthenticated, user } = useAuth();

    // Request notification permission
    useEffect(() => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            if (Notification.permission === 'granted') {
                setPermissionGranted(true);
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(permission => {
                    setPermissionGranted(permission === 'granted');
                });
            }
        }
    }, []);

    // Play custom notification sound using Web Audio API
    const playNotificationSound = useCallback(() => {
        try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

            const playTone = (frequency: number, startTime: number, duration: number) => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime + startTime);

                gainNode.gain.setValueAtTime(0, audioContext.currentTime + startTime);
                gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + startTime + 0.05);
                gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + startTime + duration);

                oscillator.start(audioContext.currentTime + startTime);
                oscillator.stop(audioContext.currentTime + startTime + duration);
            };

            // Play a sweet three-note chime
            playTone(523.25, 0, 0.15);      // C5
            playTone(659.25, 0.12, 0.15);   // E5
            playTone(783.99, 0.24, 0.2);    // G5

        } catch (e) {
            console.log('Could not play notification sound:', e);
        }
    }, []);

    // Show browser notification
    const showBrowserNotification = useCallback((title: string, body: string) => {
        if (permissionGranted && typeof window !== 'undefined' && 'Notification' in window) {
            try {
                new Notification(title, {
                    body,
                    icon: '/icon-192.png',
                    badge: '/icon-192.png',
                });

                playNotificationSound();

                if (navigator.vibrate) {
                    navigator.vibrate([200, 100, 200]);
                }
            } catch (e) {
                console.error('Failed to show notification:', e);
            }
        }
    }, [permissionGranted, playNotificationSound]);

    // Poll for notifications
    useEffect(() => {
        if (!isAuthenticated || !isPaired) return;

        const pollNotifications = async () => {
            try {
                const res = await fetch('/api/notifications');
                if (res.ok) {
                    const data = await res.json();
                    if (data.notifications && data.notifications.length > 0) {
                        const newNotifs = data.notifications.filter(
                            (n: Notification) => !notifications.find(existing => existing.id === n.id)
                        );

                        newNotifs.forEach((n: Notification) => {
                            showBrowserNotification('Comfort App 💕', n.message);
                        });

                        setNotifications(data.notifications);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch notifications:', error);
            }
        };

        pollNotifications();
        const interval = setInterval(pollNotifications, POLL_INTERVAL);

        return () => clearInterval(interval);
    }, [isAuthenticated, isPaired, notifications, showBrowserNotification]);

    // Periodic love reminders (every 2 hours)
    useEffect(() => {
        if (!isAuthenticated || !isPaired) return;

        const sendLoveReminder = () => {
            sendNotification('love');

            // Show local reminder with partner's name
            const template = loveReminderTemplates[Math.floor(Math.random() * loveReminderTemplates.length)];
            const randomMessage = replacePlaceholders(template, partnerName);
            showBrowserNotification('Comfort App 💕', randomMessage);
        };

        const lastReminder = localStorage.getItem('comfort-last-love-reminder');
        const now = Date.now();

        if (!lastReminder || now - parseInt(lastReminder) > LOVE_REMINDER_INTERVAL) {
            const timeout = setTimeout(() => {
                sendLoveReminder();
                localStorage.setItem('comfort-last-love-reminder', now.toString());
            }, 5 * 60 * 1000);

            return () => clearTimeout(timeout);
        }

        const interval = setInterval(() => {
            sendLoveReminder();
            localStorage.setItem('comfort-last-love-reminder', Date.now().toString());
        }, LOVE_REMINDER_INTERVAL);

        return () => clearInterval(interval);
    }, [isAuthenticated, isPaired, partnerName, sendNotification, showBrowserNotification]);

    const markAsRead = useCallback(async (id: string) => {
        setNotifications(prev => prev.map(n =>
            n.id === id ? { ...n, read: true } : n
        ));

        try {
            await fetch('/api/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notificationId: id })
            });
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    }, []);

    const clearAll = useCallback(() => {
        setNotifications([]);
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            markAsRead,
            clearAll,
        }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
}
