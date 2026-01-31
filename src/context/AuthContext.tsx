'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';

interface User {
    id: string;
    email: string;
    name: string;
    image?: string | null;
}

interface Partner {
    id: string;
    name: string;
    profilePic?: string | null;
}

interface AuthContextType {
    user: User | null;
    partner: Partner | null;
    coupleId: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    isPaired: boolean;
    inviteCode: string | null;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
    createInviteCode: () => Promise<{ success: boolean; inviteCode?: string; error?: string }>;
    joinWithInviteCode: (code: string) => Promise<{ success: boolean; error?: string }>;
    refreshCoupleInfo: () => Promise<void>;
    updateUser: (data: { name?: string; image?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const { data: session, status, update } = useSession();
    const [partner, setPartner] = useState<Partner | null>(null);
    const [inviteCode, setInviteCode] = useState<string | null>(null);
    const [isLoadingCouple, setIsLoadingCouple] = useState(false);

    const isLoading = status === 'loading' || isLoadingCouple;
    const isAuthenticated = !!session?.user;
    const user = session?.user ? {
        id: (session.user as any).id,
        email: session.user.email || '',
        name: session.user.name || '',
        image: session.user.image,
    } : null;
    const coupleId = (session?.user as any)?.coupleId || null;
    const isPaired = !!partner;

    // Fetch couple info on mount if authenticated
    const refreshCoupleInfo = useCallback(async () => {
        if (!isAuthenticated) return;

        setIsLoadingCouple(true);
        try {
            const res = await fetch('/api/couples');
            if (res.ok) {
                const data = await res.json();
                if (data.partner) {
                    setPartner({
                        id: data.partner.id,
                        name: data.partner.name,
                        profilePic: data.partner.profilePic,
                    });
                }
                if (data.couple?.inviteCode) {
                    setInviteCode(data.couple.inviteCode);
                }
                // Update session with couple info
                if (data.couple && (!coupleId || coupleId !== data.couple.id)) {
                    await update({
                        coupleId: data.couple.id,
                        partnerId: data.partner?.id,
                        partnerName: data.partner?.name,
                    });
                }
            }
        } catch (error) {
            console.error('Failed to fetch couple info:', error);
        } finally {
            setIsLoadingCouple(false);
        }
    }, [isAuthenticated, coupleId, update]);

    useEffect(() => {
        if (isAuthenticated && status !== 'loading') {
            refreshCoupleInfo();
        }
    }, [isAuthenticated, status]); // Don't include refreshCoupleInfo to avoid loop

    const login = useCallback(async (email: string, password: string) => {
        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                return { success: false, error: 'Invalid email or password' };
            }

            return { success: true };
        } catch (error) {
            return { success: false, error: 'An error occurred during login' };
        }
    }, []);

    const logout = useCallback(async () => {
        setPartner(null);
        setInviteCode(null);
        await signOut({ callbackUrl: '/login' });
    }, []);

    const register = useCallback(async (email: string, password: string, name: string) => {
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, name }),
            });

            const data = await res.json();

            if (!res.ok) {
                return { success: false, error: data.error || 'Registration failed' };
            }

            return { success: true };
        } catch (error) {
            return { success: false, error: 'An error occurred during registration' };
        }
    }, []);

    const createInviteCode = useCallback(async () => {
        try {
            const res = await fetch('/api/couples', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'create' }),
            });

            const data = await res.json();

            if (!res.ok) {
                return { success: false, error: data.error || 'Failed to create invite code' };
            }

            setInviteCode(data.inviteCode);
            await refreshCoupleInfo();
            return { success: true, inviteCode: data.inviteCode };
        } catch (error) {
            return { success: false, error: 'An error occurred' };
        }
    }, [refreshCoupleInfo]);

    const joinWithInviteCode = useCallback(async (code: string) => {
        try {
            const res = await fetch('/api/couples', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'join', inviteCode: code }),
            });

            const data = await res.json();

            if (!res.ok) {
                return { success: false, error: data.error || 'Failed to join couple' };
            }

            if (data.partner) {
                setPartner({
                    id: data.partner.id,
                    name: data.partner.name,
                    profilePic: data.partner.profilePic,
                });
            }
            setInviteCode(null);
            await refreshCoupleInfo();
            return { success: true };
        } catch (error) {
            return { success: false, error: 'An error occurred' };
        }
    }, [refreshCoupleInfo]);

    return (
        <AuthContext.Provider value={{
            user,
            partner,
            coupleId,
            isLoading,
            isAuthenticated,
            isPaired,
            inviteCode,
            login,
            logout,
            register,
            createInviteCode,
            joinWithInviteCode,
            refreshCoupleInfo,
            updateUser: async (data: { name?: string; image?: string }) => {
                await update(data);
            },
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
