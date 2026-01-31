'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useCouple, Message } from '@/context/CoupleContext';
import { useAuth } from '@/context/AuthContext';
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
                        ? 'bg-gradient-to-br from-[#9A2143] via-[#721832] to-[#5C1328] text-white rounded-2xl rounded-br-md shadow-lg shadow-[#9A2143]/20'
                        : 'bg-white/10 backdrop-blur-sm border border-[#BFA054]/20 rounded-2xl rounded-bl-md'
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
                        ? '-right-1.5 bg-[#5C1328]'
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
    // We need useAuth to get the partner's profile picture directly
    const { partner } = useAuth();
    // Destructure startCall from useCouple
    const { myName, partnerName, messages, sendMessage, markAsRead, deleteMessage, startCall } = useCouple();
    const [inputText, setInputText] = useState('');
    const [isVanish, setIsVanish] = useState(false);
    const [showEmoji, setShowEmoji] = useState(false);

    // Remove local activeCall state since it is handled globally now

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const mainRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Partner profile pic URL
    const partnerImage = partner?.profilePic;

    const capitalize = (s: string | null | undefined) => {
        if (!s) return 'Partner';
        return s.charAt(0).toUpperCase() + s.slice(1);
    };

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' }); // Instant scroll like WA
    }, [messages]);

    useGSAP(() => {
        if (!mainRef.current) return;
        gsap.fromTo(mainRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4 });
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

    const quickEmojis = ['❤️', '😂', '😍', '🥰', '😘', '👍', '😊', '😭'];

    const insertEmoji = (emoji: string) => {
        setInputText(prev => prev + emoji);
        setShowEmoji(false);
        inputRef.current?.focus();
    };

    return (
        <main ref={mainRef} className="flex-1 flex flex-col h-[calc(100vh-4rem)] bg-[#0b141a] relative overflow-hidden">
            {/* WhatsApp Dark Mode Background Pattern */}
            <div className="absolute inset-0 opacity-[0.06]"
                style={{
                    backgroundImage: `url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")`,
                    backgroundSize: '400px'
                }}
            />

            {/* Header */}
            <div className="sticky top-0 z-20 bg-[#202c33] border-b border-[#202c33] shadow-sm">
                <div className="px-4 py-2 flex items-center gap-3">
                    <button className="p-1 -ml-1 hover:bg-white/10 rounded-full transition-colors lg:hidden">
                        <ChevronLeft className="w-6 h-6 text-[#aebac1]" />
                    </button>

                    <div className="relative cursor-pointer transition-transform active:scale-95">
                        <div className="w-10 h-10 rounded-full bg-gray-600 overflow-hidden ring-1 ring-white/10">
                            {partnerImage ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={partnerImage} alt="Partner" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-[#6a7f8a] text-white">
                                    <span className="text-lg">👤</span>
                                </div>
                            )}
                        </div>
                        {/* Online indicator */}
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#00a884] rounded-full border-2 border-[#202c33]" />
                    </div>

                    <div className="flex-1 min-w-0 cursor-pointer">
                        <h2 className="font-medium text-[#e9edef] text-base truncate leading-tight">{capitalize(partnerName)}</h2>
                        <p className="text-xs text-[#8696a0] truncate">online</p>
                    </div>

                    <div className="flex items-center gap-4 text-[#00a884]">
                        <button
                            onClick={() => startCall('video')}
                            className="hover:bg-white/5 p-2 rounded-full transition-colors"
                        >
                            <Video className="w-6 h-6" />
                        </button>
                        <button
                            onClick={() => startCall('audio')}
                            className="hover:bg-white/5 p-2 rounded-full transition-colors"
                        >
                            <Phone className="w-5 h-5" />
                        </button>
                        <button className="hover:bg-white/5 p-2 rounded-full transition-colors text-[#aebac1]">
                            <MoreVertical className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1 z-10 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                        <div className="bg-[#1f2c34] p-6 rounded-xl text-center shadow-lg max-w-xs mx-auto mt-10">
                            <div className="w-20 h-20 mx-auto rounded-full bg-[#00a884]/20 flex items-center justify-center mb-4">
                                <Sparkles className="w-10 h-10 text-[#00a884]" />
                            </div>
                            <p className="text-[#e9edef] font-medium">No messages here yet...</p>
                            <p className="text-[#8696a0] text-sm mt-2">Send a message to start the chat with {capitalize(partnerName)}! 👋</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {messages.map((message, index) => {
                            const isOwn = message.senderName === myName;
                            return (
                                <div key={message.id}>
                                    {shouldShowDateSeparator(messages, index) && (
                                        <div className="flex justify-center my-3">
                                            <span className="bg-[#1f2c34] text-[#8696a0] text-xs px-3 py-1.5 rounded-lg shadow-sm font-medium border border-[#202c33]">
                                                {formatDateSeparator(message.timestamp)}
                                            </span>
                                        </div>
                                    )}
                                    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-1 group`}>
                                        <div className={`relative max-w-[85%] md:max-w-[65%] min-w-[100px] px-3 py-1.5 rounded-lg shadow-sm text-sm ${isOwn
                                            ? 'bg-[#005c4b] text-[#e9edef] rounded-tr-none'
                                            : 'bg-[#202c33] text-[#e9edef] rounded-tl-none'
                                            }`}>
                                            {/* Tail SVG */}
                                            <div className={`absolute top-0 w-3 h-3 ${isOwn ? '-right-2' : '-left-2'} text-${isOwn ? '[#005c4b]' : '[#202c33]'}`}>
                                                {isOwn ? (
                                                    <svg viewBox="0 0 8 13" height="13" width="8" className="fill-current text-[#005c4b] block">
                                                        <path d="M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z"></path>
                                                    </svg>
                                                ) : (
                                                    <svg viewBox="0 0 8 13" height="13" width="8" className="fill-current text-[#202c33] block transform scale-x-[-1]">
                                                        <path d="M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z"></path>
                                                    </svg>
                                                )}
                                            </div>

                                            {message.type === 'vanish' && (
                                                <div className={`flex items-center gap-1.5 mb-1 text-[11px] font-medium ${isOwn ? 'text-[#00a884] brightness-150' : 'text-[#00a884]'}`}>
                                                    <Ghost className="w-3 h-3" />
                                                    <span>Vanish Mode</span>
                                                </div>
                                            )}

                                            <div className="whitespace-pre-wrap leading-relaxed pb-3 break-words relative z-10">
                                                {message.content}
                                            </div>

                                            <div className="absolute bottom-1 right-2 flex items-center gap-1 text-[10px] text-[#ffffff99]">
                                                <span>{formatMessageTime(message.timestamp)}</span>
                                                {isOwn && (
                                                    <span className={`${message.readAt ? 'text-[#53bdeb]' : 'text-[#ffffff99]'}`}>
                                                        <svg viewBox="0 0 16 15" width="16" height="15" className="fill-current w-4 h-4">
                                                            <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-7.655a.418.418 0 0 0-.063-.51zM6.79 8.16L9.65 4.67l.308-.377a.418.418 0 0 0-.063-.51l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l1.78-2.172.277-.338z"></path>
                                                        </svg>
                                                    </span>
                                                )}
                                            </div>

                                            {/* Report read status mostly via effect */}
                                            {!isOwn && !message.readAt && (
                                                <ChatMessageObserver onRead={() => handleRead(message.id)} />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Input Area */}
            <div className="sticky bottom-0 bg-[#202c33] p-2 flex items-end gap-2 z-20">
                <button
                    onClick={() => setShowEmoji(!showEmoji)}
                    className="p-3 text-[#8696a0] hover:text-[#aebac1] transition-colors"
                >
                    <span className="text-xl">😊</span>
                </button>

                {/* Vanish toggle specific */}
                <button
                    onClick={() => setIsVanish(!isVanish)}
                    className={`p-3 transition-colors ${isVanish ? 'text-[#00a884]' : 'text-[#8696a0]'}`}
                    title="Toggle Vanish Mode"
                >
                    <Ghost className="w-6 h-6" />
                </button>

                <div className="flex-1 bg-[#2a3942] rounded-2xl flex items-end min-h-[46px] mb-1">
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Message"
                        className="w-full bg-transparent text-[#e9edef] placeholder-[#8696a0] text-[15px] px-4 py-3 focus:outline-none max-h-32"
                    />
                </div>

                <button
                    onClick={handleSend}
                    className={`p-3 rounded-full mb-1 transition-all ${inputText.trim()
                        ? 'bg-[#00a884] hover:bg-[#008f70] text-white shadow-md'
                        : 'bg-[#2a3942] text-[#8696a0]'
                        }`}
                >
                    <Send className="w-5 h-5 ml-0.5" />
                </button>
            </div>

            {/* Quick emoji popover */}
            {showEmoji && (
                <div className="absolute bottom-20 left-4 bg-[#202c33] p-2 rounded-xl shadow-xl border border-white/5 z-30 flex gap-2">
                    {quickEmojis.map(emoji => (
                        <button
                            key={emoji}
                            onClick={() => insertEmoji(emoji)}
                            className="text-2xl hover:bg-white/10 p-2 rounded-lg transition-colors"
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            )}
        </main>
    );
}

// Helper for observer (since we removed the component wrapper)
function ChatMessageObserver({ onRead }: { onRead: () => void }) {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                onRead();
                observer.disconnect();
            }
        }, { threshold: 0.5 });
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [onRead]);
    return <div ref={ref} className="absolute inset-0 pointer-events-none" />;
}
