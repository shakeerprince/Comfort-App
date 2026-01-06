'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useCouple, Message } from '@/context/CoupleContext';
import { Send, Ghost, Heart, Sparkles, ChevronLeft, MoreVertical, Phone, Video } from 'lucide-react';

gsap.registerPlugin(useGSAP);

function formatMessageTime(timestamp: number) {
    return new Date(timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatDateSeparator(timestamp: number) {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
        return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
    }
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}

function shouldShowDateSeparator(messages: Message[], index: number): boolean {
    if (index === 0) return true;
    const currentDate = new Date(messages[index].timestamp).toDateString();
    const prevDate = new Date(messages[index - 1].timestamp).toDateString();
    return currentDate !== prevDate;
}

function ChatMessage({
    message,
    isOwn,
    onRead,
    onDelete
}: {
    message: Message;
    isOwn: boolean;
    onRead: () => void;
    onDelete: () => void;
}) {
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [opacity, setOpacity] = useState(1);
    const messageRef = useRef<HTMLDivElement>(null);

    // Handle vanish timer
    useEffect(() => {
        if (message.type !== 'vanish' || !message.readAt) return;

        const interval = setInterval(() => {
            const elapsed = Date.now() - message.readAt!;
            const remaining = Math.max(0, 60000 - elapsed);
            setTimeLeft(remaining);

            // Start fading in last 10 seconds
            if (remaining <= 10000) {
                setOpacity(remaining / 10000);
            }

            // Delete when timer ends
            if (remaining <= 0) {
                onDelete();
                clearInterval(interval);
            }
        }, 100);

        return () => clearInterval(interval);
    }, [message.readAt, message.type, onDelete]);

    // Mark as read when visible (for non-own messages)
    useEffect(() => {
        if (!isOwn && !message.readAt && messageRef.current) {
            const observer = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) {
                        onRead();
                        observer.disconnect();
                    }
                },
                { threshold: 0.5 }
            );

            observer.observe(messageRef.current);
            return () => observer.disconnect();
        }
    }, [isOwn, message.readAt, onRead]);

    // Calculate vanish progress for ring animation
    const vanishProgress = timeLeft !== null ? (60000 - timeLeft) / 60000 : 0;

    return (
        <div
            ref={messageRef}
            className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3 message-bubble`}
            style={{ opacity }}
        >
            <div className={`relative max-w-[80%] ${isOwn ? 'order-1' : 'order-2'}`}>
                {/* Vanish countdown ring */}
                {message.type === 'vanish' && timeLeft !== null && (
                    <div className="absolute -top-1 -right-1 z-10">
                        <svg className="w-5 h-5 transform -rotate-90">
                            <circle
                                cx="10"
                                cy="10"
                                r="8"
                                fill="none"
                                stroke="rgba(168, 85, 247, 0.3)"
                                strokeWidth="2"
                            />
                            <circle
                                cx="10"
                                cy="10"
                                r="8"
                                fill="none"
                                stroke="#a855f7"
                                strokeWidth="2"
                                strokeDasharray={`${(1 - vanishProgress) * 50.26} 50.26`}
                                strokeLinecap="round"
                            />
                        </svg>
                    </div>
                )}

                <div
                    className={`px-4 py-3 ${isOwn
                        ? 'bg-gradient-to-br from-pink-500 via-rose-500 to-pink-600 text-white rounded-2xl rounded-br-md shadow-lg shadow-pink-500/20'
                        : 'bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl rounded-bl-md'
                        } ${message.type === 'vanish' ? 'ring-2 ring-purple-400/50 ring-offset-2 ring-offset-transparent' : ''}`}
                >
                    {/* Vanish indicator */}
                    {message.type === 'vanish' && (
                        <div className={`flex items-center gap-1.5 mb-2 text-xs ${isOwn ? 'text-white/80' : 'text-purple-400'}`}>
                            <Ghost className="w-3.5 h-3.5" />
                            <span className="font-medium">Vanish Message</span>
                            {timeLeft !== null && (
                                <span className="ml-auto tabular-nums font-bold">
                                    {Math.ceil(timeLeft / 1000)}s
                                </span>
                            )}
                        </div>
                    )}

                    <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.content}</p>

                    <div className={`flex items-center gap-2 mt-2 text-[11px] ${isOwn ? 'text-white/70 justify-end' : 'opacity-50'}`}>
                        <span>{formatMessageTime(message.timestamp)}</span>
                        {isOwn && (
                            <span className="flex items-center gap-0.5">
                                {message.readAt ? (
                                    <>
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                                            <path d="M2 12l5.5 5.5L20 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M8 12l5.5 5.5L26 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
                                        </svg>
                                    </>
                                ) : (
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                                        <path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                )}
                            </span>
                        )}
                    </div>
                </div>

                {/* Message tail */}
                <div
                    className={`absolute bottom-0 w-3 h-3 ${isOwn
                        ? '-right-1.5 bg-pink-600'
                        : '-left-1.5 bg-white/10'
                        }`}
                    style={{
                        clipPath: isOwn
                            ? 'polygon(0 0, 100% 100%, 0 100%)'
                            : 'polygon(100% 0, 100% 100%, 0 100%)'
                    }}
                />
            </div>
        </div>
    );
}

export default function ChatPage() {
    const { myRole, partnerRole, messages, sendMessage, markAsRead, deleteMessage } = useCouple();
    const [inputText, setInputText] = useState('');
    const [isVanish, setIsVanish] = useState(false);
    const [showEmoji, setShowEmoji] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const mainRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useGSAP(() => {
        if (!mainRef.current) return;

        gsap.fromTo(mainRef.current,
            { opacity: 0 },
            { opacity: 1, duration: 0.4 }
        );
    }, { scope: mainRef });

    const handleSend = () => {
        if (!inputText.trim()) return;

        sendMessage(inputText.trim(), isVanish ? 'vanish' : 'text');
        setInputText('');
        inputRef.current?.focus();
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleRead = useCallback((messageId: string) => {
        markAsRead(messageId);
    }, [markAsRead]);

    const handleDelete = useCallback((messageId: string) => {
        deleteMessage(messageId);
    }, [deleteMessage]);

    const quickEmojis = ['❤️', '😍', '🥰', '😘', '💕', '🤗', '😊', '💖'];

    const insertEmoji = (emoji: string) => {
        setInputText(prev => prev + emoji);
        setShowEmoji(false);
        inputRef.current?.focus();
    };

    return (
        <main ref={mainRef} className="flex-1 flex flex-col h-[calc(100vh-4rem)] bg-gradient-to-b from-transparent to-pink-950/10">
            {/* Header */}
            <div className="sticky top-0 z-20 backdrop-blur-xl bg-black/20 border-b border-white/10">
                <div className="px-4 py-3 flex items-center gap-3">
                    <button className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors lg:hidden">
                        <ChevronLeft className="w-5 h-5" />
                    </button>

                    <div className="relative">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-pink-400 via-rose-400 to-pink-500 flex items-center justify-center ring-2 ring-pink-400/30 ring-offset-2 ring-offset-black/20">
                            <span className="text-lg">{partnerRole === 'keerthi' ? '👸' : '🤴'}</span>
                        </div>
                        {/* Online indicator */}
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-black/20" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <h2 className="font-semibold text-lg truncate">{capitalize(partnerRole)}</h2>
                        <p className="text-xs text-green-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                            Online now
                        </p>
                    </div>

                    <div className="flex items-center gap-1">
                        <a
                            href={`tel:${partnerRole === 'keerthi' ? '6281643830' : '8688031427'}`}
                            className="p-2.5 hover:bg-white/10 rounded-full transition-colors"
                            title={`Call ${capitalize(partnerRole)}`}
                        >
                            <Phone className="w-5 h-5 opacity-70" />
                        </a>
                        <button className="p-2.5 hover:bg-white/10 rounded-full transition-colors">
                            <Video className="w-5 h-5 opacity-70" />
                        </button>
                        <button className="p-2.5 hover:bg-white/10 rounded-full transition-colors">
                            <MoreVertical className="w-5 h-5 opacity-70" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
                {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                        <div className="text-center space-y-4 p-8">
                            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-pink-500/20 to-rose-500/20 flex items-center justify-center">
                                <Heart className="w-10 h-10 text-pink-400" />
                            </div>
                            <div>
                                <p className="text-lg font-medium">Start a conversation</p>
                                <p className="text-sm opacity-50 mt-1">Send your first message to {capitalize(partnerRole)} 💕</p>
                            </div>
                            <div className="flex items-center justify-center gap-2 text-xs opacity-40">
                                <Sparkles className="w-3 h-3" />
                                <span>Messages are end-to-end encrypted</span>
                                <Sparkles className="w-3 h-3" />
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        {messages.map((message, index) => (
                            <div key={message.id}>
                                {/* Date separator */}
                                {shouldShowDateSeparator(messages, index) && (
                                    <div className="flex items-center justify-center my-4">
                                        <div className="px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-xs font-medium">
                                            {formatDateSeparator(message.timestamp)}
                                        </div>
                                    </div>
                                )}
                                <ChatMessage
                                    message={message}
                                    isOwn={message.sender === myRole}
                                    onRead={() => handleRead(message.id)}
                                    onDelete={() => handleDelete(message.id)}
                                />
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Input Area */}
            <div className="sticky bottom-0 p-4 backdrop-blur-xl bg-black/30 border-t border-white/10">
                {/* Vanish toggle */}
                <div className="flex items-center justify-center mb-3">
                    <button
                        onClick={() => setIsVanish(!isVanish)}
                        className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${isVanish
                            ? 'bg-gradient-to-r from-purple-500 to-violet-500 text-white shadow-lg shadow-purple-500/30 scale-105'
                            : 'bg-white/5 hover:bg-white/10 opacity-70 hover:opacity-100'
                            }`}
                    >
                        <Ghost className={`w-4 h-4 ${isVanish ? 'animate-bounce' : ''}`} />
                        <span>Vanish Mode</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${isVanish ? 'bg-white/20' : 'bg-white/10'
                            }`}>
                            {isVanish ? 'ON' : 'OFF'}
                        </span>
                    </button>
                </div>

                {isVanish && (
                    <p className="text-xs text-center text-purple-400 mb-3 animate-pulse">
                        👻 Messages will disappear 60 seconds after being read
                    </p>
                )}

                {/* Quick emoji picker */}
                {showEmoji && (
                    <div className="flex items-center justify-center gap-2 mb-3 p-2 bg-white/5 rounded-2xl">
                        {quickEmojis.map(emoji => (
                            <button
                                key={emoji}
                                onClick={() => insertEmoji(emoji)}
                                className="text-2xl hover:scale-125 transition-transform p-1"
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                )}

                <div className="flex items-end gap-2">
                    <button
                        onClick={() => setShowEmoji(!showEmoji)}
                        className={`p-3 rounded-full transition-all ${showEmoji ? 'bg-pink-500 text-white' : 'bg-white/5 hover:bg-white/10'
                            }`}
                    >
                        <span className="text-xl">😊</span>
                    </button>

                    <div className="flex-1 relative">
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder={`Message ${capitalize(partnerRole)}...`}
                            className="w-full bg-white/5 hover:bg-white/10 focus:bg-white/10 border border-white/10 focus:border-pink-400/50 rounded-2xl px-5 py-3.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-pink-400/20 transition-all placeholder:opacity-40"
                        />
                    </div>

                    <button
                        onClick={handleSend}
                        disabled={!inputText.trim()}
                        className={`p-3.5 rounded-full transition-all duration-300 ${inputText.trim()
                            ? 'bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/30 hover:scale-105 hover:shadow-pink-500/50'
                            : 'bg-white/5 opacity-30 cursor-not-allowed'
                            }`}
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <style jsx>{`
                .message-bubble {
                    animation: slideIn 0.3s ease-out;
                }
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </main>
    );
}
