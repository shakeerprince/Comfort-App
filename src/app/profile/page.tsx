
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { User, Camera, Save, ArrowLeft, LogOut } from 'lucide-react';
import Link from 'next/link';
import ThemeSelector from '@/components/ThemeSelector';

export default function ProfilePage() {
    const { user, logout, isLoading, updateUser } = useAuth();
    const router = useRouter();
    const [name, setName] = useState('');
    const [profilePic, setProfilePic] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (user) {
            setName(user.name);
            setProfilePic(user.image || '');
        }
    }, [user]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage('');

        try {
            const res = await fetch('/api/user', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, profilePic }),
            });

            if (res.ok) {
                // Update session
                await updateUser({ name, image: profilePic });

                setMessage('Profile updated successfully! (Refresh to see changes)');
                router.refresh(); // To update server components if any
            } else {
                setMessage('Failed to update profile');
            }
        } catch (error) {
            setMessage('An error occurred');
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    return (
        <main className="min-h-screen p-4 bg-gradient-to-b from-[#FBF8F2] to-white dark:from-[#1E2742] dark:to-black">
            <div className="max-w-md mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/" className="p-2 hover:bg-black/5 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="text-2xl font-bold">Edit Profile</h1>
                </div>

                <div className="glass-card p-6 space-y-6">
                    {/* Avatar */}
                    <div className="flex flex-col items-center">
                        <div className="relative w-24 h-24 rounded-full bg-gray-200 overflow-hidden mb-4 ring-4 ring-white shadow-lg">
                            {profilePic ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-[#BFA054]/10 text-[#BFA054]">
                                    <User className="w-10 h-10" />
                                </div>
                            )}
                        </div>
                        <p className="text-xs opacity-50 text-center max-w-[200px]">
                            Tap an avatar below or paste a URL to update your look across the app 📸
                        </p>
                    </div>

                    <form onSubmit={handleSave} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium opacity-70">Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="input-field w-full"
                                placeholder="Your Name"
                            />
                        </div>

                        {/* Avatar Selection */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium opacity-70">Choose an Avatar or Upload</label>

                            {/* File Upload Button */}
                            <div className="w-full">
                                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-[#BFA054]/30 rounded-xl cursor-pointer hover:bg-[#BFA054]/5 transition-colors">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Camera className="w-8 h-8 text-[#BFA054] mb-2" />
                                        <p className="text-xs text-gray-500">Tap to Upload Photo</p>
                                    </div>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;

                                            const formData = new FormData();
                                            formData.append('file', file);

                                            try {
                                                setMessage('Uploading...');
                                                const res = await fetch('/api/upload', {
                                                    method: 'POST',
                                                    body: formData,
                                                });

                                                if (!res.ok) throw new Error('Upload failed');

                                                const data = await res.json();
                                                setProfilePic(data.url);
                                                setMessage('');
                                            } catch (err) {
                                                console.error(err);
                                                setMessage('Failed to upload image');
                                            }
                                        }}
                                    />
                                </label>
                            </div>

                            <div className="flex items-center gap-2 overflow-x-auto pb-2">
                                {/* Cute Presets (DiceBear) */}
                                {['bear', 'cat', 'bunny', 'panda', 'fox', 'dog', 'lion', 'koala'].map((animal) => {
                                    const src = `https://api.dicebear.com/7.x/notionists/svg?seed=${animal}&backgroundColor=transparent`;
                                    return (
                                        <button
                                            key={animal}
                                            type="button"
                                            onClick={() => setProfilePic(src)}
                                            className={`relative shrink-0 w-16 h-16 rounded-full overflow-hidden border-2 transition-all bg-[#FBF8F2] dark:bg-[#1E2742] ${profilePic === src
                                                ? 'border-[#BFA054] scale-110 ring-2 ring-[#BFA054]/30'
                                                : 'border-transparent hover:scale-105'
                                                }`}
                                        >
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={src} alt={animal} className="w-full h-full object-cover" />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="pt-2">
                            <details className="group">
                                <summary className="flex items-center gap-2 text-xs font-medium opacity-50 cursor-pointer hover:opacity-100 transition-opacity select-none mb-2">
                                    <span>Advanced: Use Custom Image URL</span>
                                </summary>
                                <input
                                    type="url"
                                    value={profilePic}
                                    onChange={(e) => setProfilePic(e.target.value)}
                                    className="input-field w-full text-xs"
                                    placeholder="https://example.com/image.jpg"
                                />
                            </details>
                        </div>

                        {message && (
                            <p className={`text-sm text-center ${message.includes('success') ? 'text-green-500' : 'text-red-500'}`}>
                                {message}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={isSaving}
                            className="btn-primary w-full flex items-center justify-center gap-2 py-3"
                        >
                            {isSaving ? 'Saving...' : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </form>

                    <div className="pt-2">
                        <ThemeSelector />
                    </div>

                    <div className="pt-6 border-t border-black/10">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}
