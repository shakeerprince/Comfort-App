import { useRef, useEffect } from 'react';
import { Heart, AlertTriangle, Cookie, X, Bell } from 'lucide-react';
import gsap from 'gsap';

export type ToastType = 'hug' | 'pain' | 'craving' | 'love' | 'info';

interface ToastProps {
    id: string;
    type: ToastType;
    title: string;
    message: string;
    onClose: (id: string) => void;
}

export default function Toast({ id, type, title, message, onClose }: ToastProps) {
    const toastRef = useRef<HTMLDivElement>(null);

    // Config based on type
    const config = {
        hug: {
            icon: Heart,
            bg: 'bg-pink-500/90',
            border: 'border-pink-400/50',
            iconColor: 'text-white',
            shadow: 'shadow-pink-500/20'
        },
        pain: {
            icon: AlertTriangle,
            bg: 'bg-red-500/90',
            border: 'border-red-400/50',
            iconColor: 'text-white',
            shadow: 'shadow-red-500/20'
        },
        craving: {
            icon: Cookie,
            bg: 'bg-amber-500/90',
            border: 'border-amber-400/50',
            iconColor: 'text-white',
            shadow: 'shadow-amber-500/20'
        },
        love: {
            icon: Heart,
            bg: 'bg-rose-500/90',
            border: 'border-rose-400/50',
            iconColor: 'text-white',
            shadow: 'shadow-rose-500/20'
        },
        info: {
            icon: Bell,
            bg: 'bg-blue-500/90',
            border: 'border-blue-400/50',
            iconColor: 'text-white',
            shadow: 'shadow-blue-500/20'
        }
    }[type] || {
        icon: Bell,
        bg: 'bg-gray-800/90',
        border: 'border-gray-700/50',
        iconColor: 'text-white',
        shadow: 'shadow-black/20'
    };

    const Icon = config.icon;

    useEffect(() => {
        // Animate in
        gsap.fromTo(toastRef.current,
            { x: 100, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.4, ease: 'back.out(1.2)' }
        );

        // Auto close after 5 seconds
        const timer = setTimeout(() => {
            handleClose();
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        gsap.to(toastRef.current, {
            x: 100,
            opacity: 0,
            duration: 0.3,
            ease: 'power2.in',
            onComplete: () => onClose(id)
        });
    };

    return (
        <div
            ref={toastRef}
            className={`pointer-events-auto w-full max-w-sm overflow-hidden rounded-2xl backdrop-blur-xl border ${config.bg} ${config.border} ${config.shadow} shadow-lg text-white`}
        >
            <div className="p-4 flex items-start gap-4">
                <div className="shrink-0 pt-0.5">
                    <Icon className={`w-6 h-6 ${config.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold leading-none mb-1">{title}</h3>
                    <p className="text-sm opacity-90 leading-relaxed">{message}</p>
                </div>
                <button
                    onClick={handleClose}
                    className="shrink-0 p-1 rounded-full hover:bg-white/20 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
            {/* Progress bar */}
            <div className="h-1 bg-black/10">
                <div
                    className="h-full bg-white/40"
                    style={{
                        animation: 'shrink 5s linear forwards'
                    }}
                />
            </div>
            <style jsx>{`
                @keyframes shrink {
                    from { width: 100%; }
                    to { width: 0%; }
                }
            `}</style>
        </div>
    );
}
