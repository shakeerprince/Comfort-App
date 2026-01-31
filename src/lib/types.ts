// Type definitions for Multi-User Comfort App

export interface User {
    id: string;
    email: string;
    name: string;
    profilePic?: string | null;
    createdAt?: Date;
}

export interface Couple {
    id: string;
    partner1Id: string;
    partner2Id: string | null;
    inviteCode: string | null;
    coupleName?: string | null;
    anniversaryDate?: string | null;
    createdAt?: Date;
}

export interface CoupleWithPartner extends Couple {
    partner: User | null;
}

export type VibeStatus = 'focused' | 'miss-you' | 'sleepy' | 'happy' | 'sad' | 'cuddly';

export interface UserStatus {
    userId: string;
    coupleId: string;
    status: VibeStatus;
    lat?: number | null;
    lng?: number | null;
    lastPulse?: number | null;
    lastSeen: number;
}

export interface Message {
    id: string;
    coupleId: string;
    senderId: string;
    senderName?: string;
    content: string;
    type: 'text' | 'vanish';
    timestamp: number;
    readAt?: number | null;
}

export interface Memory {
    id: string;
    coupleId: string;
    imageUrl: string;
    caption?: string | null;
    date: string;
    createdAt?: Date;
}

export interface Notification {
    id: string;
    coupleId: string;
    fromUserId: string;
    fromUserName?: string;
    toUserId: string;
    type: 'hug' | 'pain' | 'craving' | 'love' | 'custom';
    message: string;
    timestamp: number;
    read: boolean;
}

export interface CustomLoveMessage {
    id: string;
    coupleId: string;
    forUserId: string;
    message: string;
    createdAt?: Date;
}

// Session types for NextAuth
export interface SessionUser {
    id: string;
    email: string;
    name: string;
    image?: string | null;
    coupleId?: string | null;
    partnerId?: string | null;
    partnerName?: string | null;
}
