'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Heart, Mail, Lock, Eye, EyeOff, ArrowRight, User, Sparkles, Check } from 'lucide-react';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { register, login } = useAuth();
    const router = useRouter();

    const passwordRequirements = [
        { met: password.length >= 6, text: 'At least 6 characters' },
        { met: password === confirmPassword && password.length > 0, text: 'Passwords match' },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);

        const result = await register(email, password, name);

        if (result.success) {
            setSuccess(true);
            // Auto-login after registration
            const loginResult = await login(email, password);
            if (loginResult.success) {
                setTimeout(() => {
                    router.push('/pair');
                    router.refresh();
                }, 1000);
            }
        } else {
            setError(result.error || 'Registration failed');
        }

        setIsLoading(false);
    };

    if (success) {
        return (
            <main className="min-h-screen flex items-center justify-center px-4 py-8">
                <div className="text-center animate-fade-in">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 mb-4 shadow-lg shadow-green-500/30">
                        <Check className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gradient mb-2">Account Created! 🎉</h1>
                    <p className="text-base opacity-70">Redirecting you to pair with your partner...</p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-md">
                {/* Logo & Header */}
                <div className="text-center mb-8 animate-fade-in">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 mb-4 shadow-lg shadow-pink-500/30">
                        <Heart className="w-10 h-10 text-white" fill="white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gradient mb-2">Create Account</h1>
                    <p className="text-base opacity-70">Start your journey with your partner 💕</p>
                </div>

                {/* Register Form */}
                <form onSubmit={handleSubmit} className="glass-card p-6 space-y-5">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label htmlFor="name" className="block text-sm font-medium opacity-80">
                            Your Name
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 opacity-50" />
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your beautiful name"
                                className="input-field pl-11 w-full"
                                required
                                autoComplete="name"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="email" className="block text-sm font-medium opacity-80">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 opacity-50" />
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="input-field pl-11 w-full"
                                required
                                autoComplete="email"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="password" className="block text-sm font-medium opacity-80">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 opacity-50" />
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="input-field pl-11 pr-11 w-full"
                                required
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition-opacity"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="confirmPassword" className="block text-sm font-medium opacity-80">
                            Confirm Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 opacity-50" />
                            <input
                                id="confirmPassword"
                                type={showPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                className="input-field pl-11 w-full"
                                required
                                autoComplete="new-password"
                            />
                        </div>
                    </div>

                    {/* Password Requirements */}
                    <div className="space-y-1">
                        {passwordRequirements.map((req, i) => (
                            <div key={i} className={`flex items-center gap-2 text-sm ${req.met ? 'text-green-400' : 'opacity-50'}`}>
                                <Check className={`w-4 h-4 ${req.met ? 'opacity-100' : 'opacity-30'}`} />
                                <span>{req.text}</span>
                            </div>
                        ))}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || password.length < 6 || password !== confirmPassword}
                        className="btn-primary w-full flex items-center justify-center gap-2 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                Create Account
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>

                {/* Login Link */}
                <div className="text-center mt-6">
                    <p className="opacity-70">
                        Already have an account?{' '}
                        <Link href="/login" className="text-pink-400 hover:text-pink-300 font-medium transition-colors">
                            Sign in
                        </Link>
                    </p>
                </div>

                {/* Features Preview */}
                <div className="mt-10 text-center opacity-60">
                    <div className="inline-flex items-center gap-2 text-sm">
                        <Sparkles className="w-4 h-4 text-yellow-400" />
                        <span>Your data is private and secure</span>
                        <Sparkles className="w-4 h-4 text-yellow-400" />
                    </div>
                </div>
            </div>
        </main>
    );
}
