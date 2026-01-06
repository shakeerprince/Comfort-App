'use client';

import { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Camera, Heart, Plus, Trash2, X, ImageIcon } from 'lucide-react';

gsap.registerPlugin(useGSAP);

interface Memory {
    id: string;
    imageData: string;
    caption: string;
    date: string;
}

export default function MemoriesPage() {
    const [memories, setMemories] = useState<Memory[]>([]);
    const [showUpload, setShowUpload] = useState(false);
    const [newCaption, setNewCaption] = useState('');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [viewMemory, setViewMemory] = useState<Memory | null>(null);
    const mainRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Load memories from API first, fallback to localStorage
        const loadMemories = async () => {
            try {
                const res = await fetch('/api/memories');
                if (res.ok) {
                    const data = await res.json();
                    if (data.memories && data.memories.length > 0) {
                        setMemories(data.memories);
                        return;
                    }
                }
            } catch (e) {
                console.error('Failed to fetch from API');
            }

            // Fallback to localStorage
            const saved = localStorage.getItem('cozycycle-memories');
            if (saved) {
                try {
                    setMemories(JSON.parse(saved));
                } catch (e) {
                    console.error('Failed to load memories');
                }
            }
        };
        loadMemories();
    }, []);

    useEffect(() => {
        // Save memories to localStorage as backup
        localStorage.setItem('cozycycle-memories', JSON.stringify(memories));
    }, [memories]);

    useGSAP(() => {
        if (!mainRef.current) return;

        const sections = mainRef.current.querySelectorAll('.section');
        gsap.fromTo(sections,
            { opacity: 0, y: 20 },
            {
                opacity: 1,
                y: 0,
                duration: 0.5,
                stagger: 0.15,
                ease: 'power2.out',
            }
        );
    }, { scope: mainRef });

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            setSelectedImage(event.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const addMemory = async () => {
        if (!selectedImage) return;

        const newMemory: Memory = {
            id: Date.now().toString(),
            imageData: selectedImage,
            caption: newCaption || 'A beautiful memory 💕',
            date: new Date().toISOString(),
        };

        // Optimistic update
        setMemories(prev => [newMemory, ...prev]);
        setSelectedImage(null);
        setNewCaption('');
        setShowUpload(false);

        // Sync to API
        try {
            await fetch('/api/memories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newMemory)
            });
        } catch (e) {
            console.error('Failed to sync memory to server');
        }
    };

    const deleteMemory = async (id: string) => {
        // Optimistic update
        setMemories(prev => prev.filter(m => m.id !== id));
        setViewMemory(null);

        // Sync to API
        try {
            await fetch('/api/memories', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ memoryId: id })
            });
        } catch (e) {
            console.error('Failed to delete from server');
        }
    };

    return (
        <main ref={mainRef} className="flex-1 px-6 py-8">
            {/* Header */}
            <section className="section text-center mb-6">
                <div className="flex items-center justify-center gap-3 mb-3">
                    <Camera className="w-8 h-8 text-pink-400" />
                    <h1 className="text-3xl font-bold text-gradient">Our Memories</h1>
                    <Camera className="w-8 h-8 text-pink-400" />
                </div>
                <p className="text-lg opacity-70">
                    Moments we cherish together 💕
                </p>
            </section>

            {/* Add Memory Button */}
            <section className="section max-w-md mx-auto mb-6">
                <button
                    onClick={() => setShowUpload(!showUpload)}
                    className="w-full glass-card p-4 flex items-center justify-center gap-2 hover:scale-102 transition-transform"
                >
                    <Plus className="w-5 h-5" />
                    <span>Add New Memory</span>
                </button>
            </section>

            {/* Upload Form */}
            {showUpload && (
                <section className="section glass-card p-6 mb-6 max-w-md mx-auto">
                    <h3 className="font-semibold text-center mb-4">Add a Memory</h3>

                    {selectedImage ? (
                        <div className="relative mb-4">
                            <img
                                src={selectedImage}
                                alt="Preview"
                                className="w-full h-48 object-cover rounded-xl"
                            />
                            <button
                                onClick={() => setSelectedImage(null)}
                                className="absolute top-2 right-2 p-2 bg-black/50 rounded-full text-white"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full h-48 border-2 border-dashed border-pink-300 rounded-xl flex flex-col items-center justify-center gap-2 mb-4 hover:bg-pink-50/20 transition-colors"
                        >
                            <ImageIcon className="w-10 h-10 opacity-40" />
                            <span className="opacity-60">Tap to select photo</span>
                        </button>
                    )}

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                    />

                    <input
                        type="text"
                        placeholder="Add a caption... 💕"
                        value={newCaption}
                        onChange={(e) => setNewCaption(e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm mb-4"
                    />

                    <button
                        onClick={addMemory}
                        disabled={!selectedImage}
                        className="w-full btn-cozy disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Heart className="w-4 h-4 inline mr-2" />
                        Save Memory
                    </button>
                </section>
            )}

            {/* Memories Grid */}
            <section className="section max-w-md mx-auto">
                {memories.length === 0 ? (
                    <div className="text-center py-12 opacity-50">
                        <Camera className="w-12 h-12 mx-auto mb-4 opacity-40" />
                        <p>No memories yet</p>
                        <p className="text-sm">Start adding your special moments!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        {memories.map((memory) => (
                            <div
                                key={memory.id}
                                className="relative aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-transform"
                                onClick={() => setViewMemory(memory)}
                            >
                                <img
                                    src={memory.imageData}
                                    alt={memory.caption}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <div className="absolute bottom-2 left-2 right-2">
                                    <p className="text-white text-xs truncate">{memory.caption}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* View Memory Modal */}
            {viewMemory && (
                <div
                    className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
                    onClick={() => setViewMemory(null)}
                >
                    <div
                        className="max-w-lg w-full bg-white dark:bg-gray-900 rounded-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={viewMemory.imageData}
                            alt={viewMemory.caption}
                            className="w-full max-h-[60vh] object-contain"
                        />
                        <div className="p-4">
                            <p className="font-medium mb-2">{viewMemory.caption}</p>
                            <p className="text-xs opacity-50">
                                {new Date(viewMemory.date).toLocaleDateString()}
                            </p>
                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={() => setViewMemory(null)}
                                    className="flex-1 glass-card p-2 text-center"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => deleteMemory(viewMemory.id)}
                                    className="p-2 bg-red-500 text-white rounded-xl"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer note */}
            <section className="section text-center mt-8">
                <div className="empathy-box max-w-md mx-auto">
                    <p className="text-sm">
                        <Heart className="w-4 h-4 inline mr-2" fill="#f472b6" />
                        Every moment with you is a memory I treasure forever 💕
                    </p>
                    <p className="text-xs opacity-50 mt-2">- Shaker</p>
                </div>
            </section>
        </main>
    );
}
