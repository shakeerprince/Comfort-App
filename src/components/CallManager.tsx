'use client';

import React, { useEffect, useState } from 'react';
import { useCouple } from '@/context/CoupleContext';
import { useAuth } from '@/context/AuthContext';
import CallInterface from './CallInterface';
import { Phone, PhoneOff, Video } from 'lucide-react';

export default function CallManager() {
    const {
        incomingCall,
        activeCallConfig,
        partnerName,
        endCall,
        answerCall,
        localStream,
        remoteStream
    } = useCouple();

    const { partner } = useAuth();
    const partnerImage = partner?.profilePic;

    // Determine partner image from context (accessed via useCouple -> AuthContext in real app,
    // but here we might need to export partner from useCouple or fetch it.
    // For now, CallInterface receives partnerName. Partner image can be passed if we expose it in useCouple)
    // Checking useCouple... yes, it exposes partnerId/Name but not image directly.
    // We can get it from useAuth inside implementation if needed or pass deeply.
    // For now, standard avatar is fine if image missing.

    // Retrieve partner image from local storage or context if possible. 
    // To keep it simple, we will trust the CallInterface to handle missing image or use a context enhancement later.
    // Actually, let's use useAuth here to get the image.

    // Check if we can import useAuth logic or just pass null for now. 
    // Ideally update CoupleContext to expose partner object. 

    // For MVP:
    // 1. Incoming Call Screen
    // 2. Verified Active Call Screen

    if (incomingCall) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
                <div className="bg-[#202c33] p-8 rounded-3xl w-full max-w-sm flex flex-col items-center gap-6 shadow-2xl border border-white/10">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-gray-600 flex items-center justify-center text-4xl animate-pulse">
                            👤
                        </div>
                        <div className="absolute inset-0 rounded-full border-2 border-[#00a884] animate-ping" />
                    </div>

                    <div className="text-center">
                        <h2 className="text-2xl font-semibold text-[#e9edef]">{partnerName}</h2>
                        <p className="text-[#aebac1]">Incoming {incomingCall.type} call...</p>
                    </div>

                    <div className="flex items-center gap-12 mt-4">
                        <button
                            onClick={endCall} // Rejecting uses endCall logic for now
                            className="bg-red-500 p-4 rounded-full text-white shadow-lg hover:scale-110 transition-transform"
                        >
                            <PhoneOff className="w-8 h-8" />
                        </button>
                        <button
                            onClick={answerCall}
                            className="bg-[#00a884] p-4 rounded-full text-white shadow-lg hover:scale-110 transition-transform animate-bounce"
                        >
                            <Phone className="w-8 h-8" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (activeCallConfig && activeCallConfig.isActive) {
        return (
            <CallInterface
                partnerName={partnerName}
                partnerImage={partnerImage}
                isVideo={activeCallConfig.type === 'video'}
                status={activeCallConfig.status} // Pass actual status
                localStream={localStream}
                remoteStream={remoteStream}
                onEndCall={endCall}
            />
        );
    }

    return null;
}
