'use client';

import { useState, useEffect } from 'react';
import { useCouple } from '@/context/CoupleContext';
import Toast, { ToastType } from './ui/Toast';

interface ActiveToast {
    id: string;
    type: ToastType;
    title: string;
    message: string;
}

export default function NotificationManager() {
    const { notificationQueue, clearNotification } = useCouple();
    const [toasts, setToasts] = useState<ActiveToast[]>([]);

    useEffect(() => {
        // Request notification permission on mount
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    // Watch for new notifications in the queue
    useEffect(() => {
        if (notificationQueue.length > 0) {
            const newNotification = notificationQueue[0];

            // Add to toasts
            addToast(
                newNotification.id,
                newNotification.type as ToastType,
                getNotificationTitle(newNotification.type),
                newNotification.message
            );

            // Trigger sound
            playSound(newNotification.type);

            // Remove from queue
            clearNotification(newNotification.id);
        }
    }, [notificationQueue, clearNotification]);

    const addToast = (id: string, type: ToastType, title: string, message: string) => {
        setToasts(prev => {
            // Prevent duplicates
            if (prev.some(t => t.id === id)) return prev;
            // Limit to 3 toasts at a time
            const filtered = prev.length >= 3 ? prev.slice(1) : prev;
            return [...filtered, { id, type, title, message }];
        });
    };

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const getNotificationTitle = (type: string) => {
        switch (type) {
            case 'hug': return 'Virtual Hug Incoming! 🤗';
            case 'pain': return 'Partner Alert 🚨';
            case 'craving': return 'Craving Alert 🍪';
            case 'love': return 'Love Note 💌';
            default: return 'New Notification 🔔';
        }
    };

    const playSound = (type: string) => {
        const audio = new Audio(
            type === 'pain'
                ? '/sounds/alert.mp3'
                : '/sounds/notification.mp3'
        );
        audio.volume = 0.5;
        audio.play().catch(e => console.log('Audio play failed', e));
    };

    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none">
            {toasts.map(toast => (
                <Toast
                    key={toast.id}
                    {...toast}
                    onClose={removeToast}
                />
            ))}
        </div>
    );
}
