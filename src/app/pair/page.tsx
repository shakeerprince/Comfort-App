'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Heart, Link2, Copy, Check, Users, ArrowRight, Sparkles, RefreshCw } from 'lucide-react';

export default function PairPage() {
    const [inviteInput, setInviteInput] = useState('');
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [isJoining, setIsJoining] = useState(false);
    const [showJoinForm, setShowJoinForm] = useState(false);
    const { user, partner, isPaired, inviteCode, createInviteCode, joinWithInviteCode, isLoading, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isLoading, isAuthenticated, router]);

    useEffect(() => {
        if (isPaired) {
            // Redirect to home after successful pairing
            setTimeout(() => {
                router.push('/');
                router.refresh();
            }, 2000);
        }
    }, [isPaired, router]);

    const handleCreateInvite = async () => {
        setIsCreating(true);
        setError('');
        const result = await createInviteCode();
        if (!result.success) {
            setError(result.error || 'Failed to create invite code');
        }
        setIsCreating(false);
    };

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteInput.trim()) return;

        setIsJoining(true);
        setError('');
        const result = await joinWithInviteCode(inviteInput.trim().toUpperCase());
        if (!result.success) {
            setError(result.error || 'Failed to join');
        }
        setIsJoining(false);
    };

    const copyInviteCode = () => {
        if (inviteCode) {
            navigator.clipboard.writeText(inviteCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (isLoading) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-3 border-pink-400/30 border-t-pink-400 rounded-full animate-spin mx-auto mb-4" />
                    <p className="opacity-60">Loading...</p>
                </div>
            </main>
        );
    }

    if (isPaired && partner) {
        return (
            <main className="min-h-screen flex items-center justify-center px-4 py-8">
                <div className="text-center animate-fade-in max-w-md">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 mb-6 shadow-lg shadow-green-500/30 animate-bounce-slow">
                        <Heart className="w-12 h-12 text-white" fill="white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gradient mb-3">You&apos;re Connected! 💕</h1>
                    <p className="text-lg opacity-80 mb-6">
                        {user?.name} + {partner.name}
                    </p>
                    <div className="glass-card p-6 inline-block">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-2xl font-bold text-white shadow-md">
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="text-3xl">💕</div>
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center text-2xl font-bold text-white shadow-md">
                                {partner.name.charAt(0).toUpperCase()}
                            </div>
                        </div>
                    </div>
                    <p className="mt-6 opacity-60">Redirecting to home...</p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8 animate-fade-in">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 mb-4 shadow-lg shadow-pink-500/30">
                        <Users className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gradient mb-2">Connect with Partner</h1>
                    <p className="text-base opacity-70">
                        Welcome, {user?.name}! 👋<br />
                        Let&apos;s connect you with your special someone.
                    </p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm mb-6 text-center">
                        {error}
                    </div>
                )}

                {/* Invite Code Section */}
                {inviteCode ? (
                    <div className="glass-card p-6 mb-6 text-center animate-fade-in">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <Link2 className="w-5 h-5 text-pink-400" />
                            <span className="font-medium">Your Invite Code</span>
                        </div>
                        <div className="bg-black/20 rounded-xl p-4 mb-4">
                            <div className="text-4xl font-mono font-bold tracking-widest text-gradient">
                                {inviteCode}
                            </div>
                        </div>
                        <button
                            onClick={copyInviteCode}
                            className="btn-secondary inline-flex items-center gap-2"
                        >
                            {copied ? (
                                <>
                                    <Check className="w-4 h-4 text-green-400" />
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <Copy className="w-4 h-4" />
                                    Copy Code
                                </>
                            )}
                        </button>
                        <p className="mt-4 text-sm opacity-60">
                            Share this code with your partner to connect 💕
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Create Invite Option */}
                        <button
                            onClick={handleCreateInvite}
                            disabled={isCreating}
                            className="glass-card p-6 w-full text-left hover:scale-[1.02] transition-all group"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center shadow-md">
                                        <Link2 className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">Create Invite Link</h3>
                                        <p className="text-sm opacity-60">Generate a code to share with your partner</p>
                                    </div>
                                </div>
                                {isCreating ? (
                                    <RefreshCw className="w-5 h-5 animate-spin opacity-50" />
                                ) : (
                                    <ArrowRight className="w-5 h-5 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                )}
                            </div>
                        </button>

                        {/* Divider */}
                        <div className="flex items-center gap-4">
                            <div className="flex-1 h-px bg-white/10" />
                            <span className="text-sm opacity-50">or</span>
                            <div className="flex-1 h-px bg-white/10" />
                        </div>

                        {/* Join with Code Option */}
                        {!showJoinForm ? (
                            <button
                                onClick={() => setShowJoinForm(true)}
                                className="glass-card p-6 w-full text-left hover:scale-[1.02] transition-all group"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center shadow-md">
                                            <Heart className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg">Join Partner</h3>
                                            <p className="text-sm opacity-60">Enter your partner&apos;s invite code</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-5 h-5 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                </div>
                            </button>
                        ) : (
                            <form onSubmit={handleJoin} className="glass-card p-6 animate-fade-in">
                                <div className="flex items-center gap-2 mb-4">
                                    <Heart className="w-5 h-5 text-purple-400" />
                                    <span className="font-medium">Enter Invite Code</span>
                                </div>
                                <input
                                    type="text"
                                    value={inviteInput}
                                    onChange={(e) => setInviteInput(e.target.value.toUpperCase())}
                                    placeholder="ABC123"
                                    maxLength={6}
                                    className="input-field w-full text-center text-2xl font-mono tracking-widest uppercase mb-4"
                                    autoFocus
                                />
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowJoinForm(false)}
                                        className="btn-secondary flex-1"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isJoining || inviteInput.length < 6}
                                        className="btn-primary flex-1 flex items-center justify-center gap-2"
                                    >
                                        {isJoining ? (
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <>
                                                Join
                                                <ArrowRight className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                )}

                {/* Footer Info */}
                <div className="mt-10 text-center opacity-60">
                    <div className="inline-flex items-center gap-2 text-sm">
                        <Sparkles className="w-4 h-4 text-yellow-400" />
                        <span>Your connection is private and secure</span>
                        <Sparkles className="w-4 h-4 text-yellow-400" />
                    </div>
                </div>
            </div>
        </main>
    );
}
