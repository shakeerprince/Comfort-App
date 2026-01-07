'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useCouple } from './CoupleContext';

interface Notification {
    id: string;
    from_user: string;
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

// Deeply emotional love reminders for local display
const loveRemindersForKeerthi = [
    "Shaker is thinking about you right now... his heart aches to hold you 💕",
    "Your Shaker loves you more than you'll ever know. You're his everything 🥰",
    "Hey beautiful... Shaker just wanted you to know - you're the reason his heart beats 💓",
    "Keerthi, Shaker is counting every second until he can see you again 💘",
    "You know what? Shaker would cross oceans for you. He'd do anything to see you happy 🌊💕",
    "Shaker falls in love with you a little more every single day. You're his miracle 💝",
    "When Shaker imagines his future, you're in every single frame 🎬💕",
    "The way Shaker looks at you when you're not watching? That's pure, infinite love 👀💕",
    "You are irreplaceable. To Shaker, you're the only one who matters 🌹",
    "Shaker's heart whispers your name with every beat. Keerthi. Keerthi. Keerthi. 💓",
];

const loveRemindersForShaker = [
    "Keerthi's heart beats for you every second... 💕",
    "Your Keerthi is waiting. She loves you endlessly 🥰",
    "Right now, somewhere, Keerthi is smiling thinking about you 🤗",
    "Shaker, you're her safe place, her home, her everything 💖",
    "She chose you, Shaker. Every day, she'd choose you again 💑",
    "When Keerthi is scared, she thinks of you. You're her strength 🌸",
];

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [permissionGranted, setPermissionGranted] = useState(false);
    const { myRole, sendNotification } = useCouple();

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

            // Create a pleasant chime sound
            const playTone = (frequency: number, startTime: number, duration: number) => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime + startTime);

                // Fade in and out for smooth sound
                gainNode.gain.setValueAtTime(0, audioContext.currentTime + startTime);
                gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + startTime + 0.05);
                gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + startTime + duration);

                oscillator.start(audioContext.currentTime + startTime);
                oscillator.stop(audioContext.currentTime + startTime + duration);
            };

            // Play a sweet three-note chime (like a gentle notification)
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

                // Play custom notification sound
                playNotificationSound();

                // Vibrate if supported
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
        const pollNotifications = async () => {
            try {
                const res = await fetch(`/api/notifications?user=${myRole}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.notifications && data.notifications.length > 0) {
                        // Show browser notifications for new ones
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
    }, [myRole, notifications, showBrowserNotification]);

    // Periodic love reminders (every 2 hours)
    useEffect(() => {
        const sendLoveReminder = () => {
            // Send a love notification to partner
            sendNotification('love');

            // Show local reminder too (role-specific emotional message)
            const reminders = myRole === 'keerthi' ? loveRemindersForKeerthi : loveRemindersForShaker;
            const randomMessage = reminders[Math.floor(Math.random() * reminders.length)];
            showBrowserNotification('Comfort App 💕', randomMessage);
        };

        // Check when last reminder was sent
        const lastReminder = localStorage.getItem('comfort-last-love-reminder');
        const now = Date.now();

        if (!lastReminder || now - parseInt(lastReminder) > LOVE_REMINDER_INTERVAL) {
            // Send initial reminder after 5 minutes to not be annoying on page load
            const timeout = setTimeout(() => {
                sendLoveReminder();
                localStorage.setItem('comfort-last-love-reminder', now.toString());
            }, 5 * 60 * 1000);

            return () => clearTimeout(timeout);
        }

        // Setup interval for future reminders
        const interval = setInterval(() => {
            sendLoveReminder();
            localStorage.setItem('comfort-last-love-reminder', Date.now().toString());
        }, LOVE_REMINDER_INTERVAL);

        return () => clearInterval(interval);
    }, [myRole, sendNotification, showBrowserNotification]);

    // Period reminder notifications (daily check)
    useEffect(() => {
        if (myRole !== 'keerthi') return; // Only for Keerthi

        const checkPeriodReminder = () => {
            const cycleData = localStorage.getItem('comfort-cycle-data');
            if (!cycleData) return;

            try {
                const data = JSON.parse(cycleData);
                if (!data.lastPeriodStart) return;

                const lastStart = new Date(data.lastPeriodStart);
                const cycleLength = data.cycleLength || 28;
                const nextPeriod = new Date(lastStart);
                nextPeriod.setDate(nextPeriod.getDate() + cycleLength);

                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const daysUntil = Math.ceil((nextPeriod.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

                // Check if we already sent a reminder today
                const lastPeriodReminder = localStorage.getItem('comfort-last-period-reminder');
                const todayStr = today.toISOString().split('T')[0];
                if (lastPeriodReminder === todayStr) return;

                // Send reminders based on days until period
                if (daysUntil >= 0 && daysUntil <= 7) {
                    let message = '';
                    if (daysUntil === 0) {
                        message = "Keerthi, your period might start today! 🌸 Shaker has everything ready for you 💕";
                    } else if (daysUntil === 1) {
                        message = "Your period may start tomorrow, Keerthi! 💕 Shaker is preparing your comfort kit 🧡";
                    } else if (daysUntil <= 3) {
                        message = `Your period is expected in ${daysUntil} days. Shaker is stocking up on chocolate! 🍫💕`;
                    } else if (daysUntil <= 7) {
                        message = `Heads up Keerthi! Your period may start in about ${daysUntil} days 📅💕`;
                    }

                    if (message) {
                        showBrowserNotification('Period Reminder 🌸', message);
                        localStorage.setItem('comfort-last-period-reminder', todayStr);
                    }
                }
            } catch (e) {
                console.error('Error checking period reminder:', e);
            }
        };

        // Check on load (after 10 seconds) and then every hour
        const initialTimeout = setTimeout(checkPeriodReminder, 10000);
        const interval = setInterval(checkPeriodReminder, 60 * 60 * 1000);

        return () => {
            clearTimeout(initialTimeout);
            clearInterval(interval);
        };
    }, [myRole, showBrowserNotification]);

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
