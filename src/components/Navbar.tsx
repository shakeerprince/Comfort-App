'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Menu, X, Home, Flame, Cookie, MessageSquare, Calendar, MapPin, Music, Camera, Heart, Palette, Bell, User, LogOut, Settings } from 'lucide-react';
import { useTheme, themes, ThemeType } from '@/context/ThemeContext';
import { useNotifications } from '@/context/NotificationContext';
import { useAuth } from '@/context/AuthContext';

gsap.registerPlugin(useGSAP);

const navLinks = [
    { href: '/', label: 'Vibes', icon: Home },
    { href: '/comfort', label: 'Comfort', icon: Flame },
    { href: '/cravings', label: 'Cravings', icon: Cookie },
    { href: '/location', label: 'Location', icon: MapPin },
    { href: '/chat', label: 'Chat', icon: MessageSquare },
    { href: '/music', label: 'Music', icon: Music },
    { href: '/support', label: 'Support', icon: Heart },
    { href: '/memories', label: 'Memories', icon: Camera },
    { href: '/tracker', label: 'Tracker', icon: Calendar },
];

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [showThemes, setShowThemes] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const navRef = useRef<HTMLElement>(null);
    const logoRef = useRef<HTMLAnchorElement>(null);
    const { theme, setTheme, themeConfig } = useTheme();
    const { notifications, unreadCount, markAsRead, clearAll } = useNotifications();
    const { user, partner, isAuthenticated, isPaired, logout } = useAuth();

    useGSAP(() => {
        if (!logoRef.current) return;

        gsap.to(logoRef.current, {
            y: -3,
            duration: 2,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
        });
    }, { scope: navRef });

    const toggleMenu = () => setIsOpen(!isOpen);
    const closeMenu = () => setIsOpen(false);
    const notificationRef = useRef<HTMLDivElement>(null);
    const themeRef = useRef<HTMLDivElement>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
                setShowNotifications(false);
            }
            if (themeRef.current && !themeRef.current.contains(e.target as Node)) {
                setShowThemes(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const formatTime = (timestamp: number) => {
        const diff = Date.now() - timestamp;
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return new Date(timestamp).toLocaleDateString();
    };

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    // Hide nav on login/register pages
    if (['/login', '/register'].includes(pathname)) {
        return null;
    }

    return (
        <nav ref={navRef} className="fixed top-0 left-0 right-0 z-50">
            <div className="glass-card mx-4 mt-4 px-6 py-4 rounded-2xl">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link
                        ref={logoRef}
                        href="/"
                        className="flex items-center gap-2 text-xl font-bold"
                        onClick={closeMenu}
                    >
                        <span className="text-2xl">🌸</span>
                        <span className="text-gradient">Comfort App</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-4">
                        {isAuthenticated && isPaired && navLinks.slice(0, 6).map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`relative flex items-center gap-1.5 text-sm font-medium transition-all hover:text-primary ${isActive ? 'text-primary' : 'opacity-70'
                                        }`}
                                >
                                    <link.icon className={`w-4 h-4 ${isActive ? 'fill-current' : ''}`} />
                                    {link.label}
                                    {isActive && (
                                        <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-royal-gold to-royal-red rounded-full" />
                                    )}
                                </Link>
                            );
                        })}

                        {isAuthenticated && isPaired && (
                            <>
                                {/* Notification Bell */}
                                <div ref={notificationRef} className="relative">
                                    <button
                                        onClick={() => {
                                            setShowNotifications(!showNotifications);
                                            setShowThemes(false);
                                            setShowUserMenu(false);
                                        }}
                                        className="relative p-2 rounded-xl hover:bg-white/10 transition-colors"
                                    >
                                        <Bell className="w-5 h-5" />
                                        {unreadCount > 0 && (
                                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#9A2143] text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
                                                {unreadCount > 9 ? '9+' : unreadCount}
                                            </span>
                                        )}
                                    </button>

                                    {/* Notification Dropdown */}
                                    {showNotifications && (
                                        <div className="absolute top-full right-0 mt-2 w-80 max-h-96 overflow-y-auto glass-card rounded-xl shadow-2xl">
                                            <div className="p-3 border-b border-white/10 flex items-center justify-between">
                                                <h3 className="font-semibold">Notifications</h3>
                                                {notifications.length > 0 && (
                                                    <button
                                                        onClick={clearAll}
                                                        className="text-xs text-pink-400 hover:text-pink-300"
                                                    >
                                                        Clear all
                                                    </button>
                                                )}
                                            </div>

                                            {notifications.length === 0 ? (
                                                <div className="p-6 text-center opacity-60">
                                                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
                                                    <p className="text-sm">No notifications yet</p>
                                                    <p className="text-xs mt-1">Love reminders will appear here 💕</p>
                                                </div>
                                            ) : (
                                                <div className="divide-y divide-white/5">
                                                    {notifications.map((notif) => (
                                                        <div
                                                            key={notif.id}
                                                            onClick={() => markAsRead(notif.id)}
                                                            className={`p-3 hover:bg-white/5 cursor-pointer transition-colors ${!notif.read ? 'bg-pink-500/10' : ''}`}
                                                        >
                                                            <p className="text-sm">{notif.message}</p>
                                                            <p className="text-xs opacity-50 mt-1">
                                                                {formatTime(notif.timestamp)}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {/* Theme Switcher */}
                        <div ref={themeRef} className="relative">
                            <button
                                onClick={() => {
                                    setShowThemes(!showThemes);
                                    setShowNotifications(false);
                                    setShowUserMenu(false);
                                }}
                                className="p-2 rounded-xl hover:bg-white/10 transition-colors flex items-center gap-1"
                            >
                                <span>{themeConfig.emoji}</span>
                                <Palette className="w-4 h-4 opacity-70" />
                            </button>

                            {showThemes && (
                                <div className="absolute top-full right-0 mt-2 glass-card p-2 rounded-xl min-w-32">
                                    {(Object.entries(themes) as [ThemeType, typeof themeConfig][]).map(([key, t]) => (
                                        <button
                                            key={key}
                                            onClick={() => {
                                                setTheme(key);
                                                setShowThemes(false);
                                            }}
                                            className={`w-full flex items-center gap-2 p-2 rounded-lg text-sm transition-all ${theme === key ? 'bg-pink-400/20' : 'hover:bg-white/10'
                                                }`}
                                        >
                                            <span>{t.emoji}</span>
                                            <span>{t.name}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* User Menu */}
                        {isAuthenticated ? (
                            <div ref={userMenuRef} className="relative">
                                <button
                                    onClick={() => {
                                        setShowUserMenu(!showUserMenu);
                                        setShowThemes(false);
                                        setShowNotifications(false);
                                    }}
                                    className="flex items-center gap-2 p-2 rounded-xl hover:bg-white/10 transition-colors"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                </button>

                                {showUserMenu && (
                                    <div className="absolute top-full right-0 mt-2 glass-card p-2 rounded-xl min-w-48 shadow-2xl">
                                        <div className="px-3 py-2 border-b border-white/10 mb-1">
                                            <p className="font-medium">{user?.name}</p>
                                            <p className="text-xs opacity-60">{user?.email}</p>
                                            {isPaired && partner && (
                                                <p className="text-xs text-pink-400 mt-1">💕 with {partner.name}</p>
                                            )}
                                        </div>

                                        {!isPaired && (
                                            <Link
                                                href="/pair"
                                                onClick={() => setShowUserMenu(false)}
                                                className="w-full flex items-center gap-2 p-2 rounded-lg text-sm hover:bg-white/10 transition-all"
                                            >
                                                <Heart className="w-4 h-4" />
                                                Connect with Partner
                                            </Link>
                                        )}

                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-2 p-2 rounded-lg text-sm hover:bg-white/10 transition-all text-red-400"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link href="/login" className="btn-primary px-4 py-2 text-sm">
                                Sign In
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button & Notifications & Theme */}
                    <div className="lg:hidden flex items-center gap-1">
                        {isAuthenticated && isPaired && (
                            <div className="relative" onClick={(e) => e.stopPropagation()}>
                                <button
                                    onClick={() => {
                                        setShowNotifications(!showNotifications);
                                        setShowThemes(false);
                                        setIsOpen(false);
                                    }}
                                    className="relative p-2 rounded-xl hover:bg-white/10 transition-colors"
                                >
                                    <Bell className="w-5 h-5" />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </button>
                            </div>
                        )}

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowThemes(!showThemes);
                                setShowNotifications(false);
                            }}
                            className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                        >
                            <span>{themeConfig.emoji}</span>
                        </button>

                        <button
                            onClick={toggleMenu}
                            className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                            aria-label="Toggle menu"
                        >
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Notification Dropdown */}
                {showNotifications && (
                    <div className="lg:hidden pt-4 mt-4 border-t border-white/10 max-h-64 overflow-y-auto">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium">Notifications</p>
                            {notifications.length > 0 && (
                                <button onClick={clearAll} className="text-xs text-pink-400">
                                    Clear all
                                </button>
                            )}
                        </div>

                        {notifications.length === 0 ? (
                            <p className="text-sm opacity-50 text-center py-4">No notifications 💕</p>
                        ) : (
                            <div className="space-y-2">
                                {notifications.slice(0, 5).map((notif) => (
                                    <div
                                        key={notif.id}
                                        onClick={() => markAsRead(notif.id)}
                                        className={`p-2 rounded-lg text-sm ${!notif.read ? 'bg-pink-500/10' : 'bg-white/5'}`}
                                    >
                                        <p>{notif.message}</p>
                                        <p className="text-xs opacity-50">{formatTime(notif.timestamp)}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Mobile Theme Dropdown */}
                {showThemes && (
                    <div className="lg:hidden pt-4 mt-4 border-t border-white/10">
                        <p className="text-xs opacity-50 mb-2">Choose Theme</p>
                        <div className="grid grid-cols-4 gap-2">
                            {(Object.entries(themes) as [ThemeType, typeof themeConfig][]).map(([key, t]) => (
                                <button
                                    key={key}
                                    onClick={() => {
                                        setTheme(key);
                                        setShowThemes(false);
                                    }}
                                    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${theme === key ? 'bg-pink-400/20' : 'hover:bg-white/10'
                                        }`}
                                >
                                    <span className="text-xl">{t.emoji}</span>
                                    <span className="text-xs">{t.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Mobile Menu */}
                {isOpen && (
                    <div className="lg:hidden pt-4 mt-4 border-t border-white/10">
                        {isAuthenticated ? (
                            <>
                                {/* User Info */}
                                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/10">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white font-bold shadow-md">
                                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <div>
                                        <p className="font-medium">{user?.name}</p>
                                        {isPaired && partner && (
                                            <p className="text-xs text-pink-400">💕 with {partner.name}</p>
                                        )}
                                    </div>
                                </div>

                                {isPaired ? (
                                    <div className="grid grid-cols-3 gap-2">
                                        {navLinks.map((link) => {
                                            const isActive = pathname === link.href;
                                            return (
                                                <Link
                                                    key={link.href}
                                                    href={link.href}
                                                    onClick={closeMenu}
                                                    className={`flex flex-col items-center gap-1 px-3 py-3 rounded-xl transition-all ${isActive
                                                        ? 'bg-gradient-to-r from-rose-400/20 to-pink-400/20 text-cozy'
                                                        : 'hover:bg-white/5 opacity-80'
                                                        }`}
                                                >
                                                    <link.icon className="w-5 h-5" />
                                                    <span className="text-xs font-medium">{link.label}</span>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <Link
                                        href="/pair"
                                        onClick={closeMenu}
                                        className="btn-primary w-full py-3 flex items-center justify-center gap-2 mb-3"
                                    >
                                        <Heart className="w-5 h-5" />
                                        Connect with Partner
                                    </Link>
                                )}

                                <button
                                    onClick={() => {
                                        closeMenu();
                                        handleLogout();
                                    }}
                                    className="w-full mt-3 p-3 rounded-xl text-center text-red-400 hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <div className="flex flex-col gap-2">
                                <Link href="/login" onClick={closeMenu} className="btn-primary py-3 text-center">
                                    Sign In
                                </Link>
                                <Link href="/register" onClick={closeMenu} className="btn-secondary py-3 text-center">
                                    Create Account
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
}
