import { NextRequest, NextResponse } from 'next/server';
import { sql, initDatabase } from '@/lib/db';

// Personalized love messages - Shaker gets messages mentioning Keerthi
const loveMessagesForShaker = [
    "Hey Shaker! 💕 Keerthi's heart beats for you every second...",
    "Shaker, your Keerthi is waiting. She loves you endlessly 🥰",
    "Right now, somewhere, Keerthi is smiling thinking about you 🤗",
    "Shaker, you're her safe place, her home, her everything 💖",
    "Your Keerthi believes in you. She always will ☀️💕",
    "Shaker, send her love. You're her favorite notification 💝",
    "She chose you, Shaker. Every day, she'd choose you again 💑",
    "Your girl needs to hear 'I love you' right now... go! 💘",
    "Shaker, you make Keerthi's ordinary days extraordinary ✨",
    "When Keerthi is scared, she thinks of you. You're her strength 🌸",
];

// Personalized love messages - Keerthi gets messages mentioning Shaker (DEEPLY EMOTIONAL)
const loveMessagesForKeerthi = [
    "Keerthi... Shaker is thinking about you right now. His heart aches to hold you 💕",
    "Your Shaker loves you more than you'll ever know. You're his world, his universe, his everything 🥰",
    "Hey beautiful... Shaker just wanted you to know - you're the reason his heart beats 💓",
    "Keerthi, somewhere right now, Shaker is wishing he could wrap his arms around you and never let go 🤗",
    "You know what Shaker's biggest fear is? Losing you. That's how much you mean to him 💖",
    "Keerthi... when Shaker sees your smile, nothing else matters. You light up his entire world ✨",
    "Your Shaker would cross oceans for you. He'd do anything to see you happy 🌊💕",
    "Hey my love... Shaker is counting every second until he can see you again 💘",
    "Keerthi, you're not just his girlfriend - you're his best friend, his soulmate, his forever person 💑",
    "Shaker needs you to know something: On his worst days, just thinking about you makes everything better 🌸",
    "Your Shaker falls in love with you a little more every single day. You're his miracle 💝",
    "Keerthi... the way Shaker looks at you when you're not watching? That's pure, infinite love 👀💕",
    "You are irreplaceable. To Shaker, you're the only one who matters. Always remember that 🌹",
    "Shaker's heart whispers your name with every beat. Keerthi. Keerthi. Keerthi. 💓",
    "When Shaker imagines his future, you're in every single frame. He can't picture life without you 🎬💕",
];

export async function GET(request: NextRequest) {
    if (!sql) {
        return NextResponse.json({ notifications: [] });
    }

    const { searchParams } = new URL(request.url);
    const userRole = searchParams.get('user');

    if (!userRole) {
        return NextResponse.json({ error: 'User required' }, { status: 400 });
    }

    try {
        await initDatabase();

        // Get unread notifications for this user
        const notifications = await sql`
            SELECT id, from_user, type, message, timestamp, read
            FROM notifications
            WHERE to_user = ${userRole} AND read = false
            ORDER BY timestamp DESC
            LIMIT 20
        `;

        return NextResponse.json({ notifications });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return NextResponse.json({ notifications: [] });
    }
}

export async function POST(request: NextRequest) {
    if (!sql) {
        return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    try {
        await initDatabase();
        const { from, to, type, timestamp } = await request.json();

        // Generate personalized message based on type and recipient
        let message = '';
        const isForKeerthi = to === 'keerthi';

        switch (type) {
            case 'hug':
                message = isForKeerthi
                    ? "Shaker just sent you the warmest hug! 🤗💕 He loves you so much!"
                    : "Keerthi just sent you a big hug! 🤗💕 She's thinking of you!";
                break;
            case 'pain':
                message = isForKeerthi
                    ? "Keerthi, Shaker knows you're not feeling well 💝 He's here for you always!"
                    : "Shaker! Keerthi logged some pain... She needs your comfort and love 💝";
                break;
            case 'craving':
                message = isForKeerthi
                    ? "Keerthi, Shaker saw you're craving something! He'll make it happen 🍫💕"
                    : "Shaker! Your Keerthi is having cravings! Time to be her hero 🍫💕";
                break;
            case 'love':
                const messages = isForKeerthi ? loveMessagesForKeerthi : loveMessagesForShaker;
                message = messages[Math.floor(Math.random() * messages.length)];
                break;
            default:
                message = isForKeerthi
                    ? 'Hey Keerthi! Shaker has something for you 💕'
                    : 'Hey Shaker! Keerthi has something for you 💕';
        }

        const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        await sql`
            INSERT INTO notifications (id, from_user, to_user, type, message, timestamp, read)
            VALUES (${id}, ${from}, ${to}, ${type}, ${message}, ${timestamp}, false)
        `;

        return NextResponse.json({ success: true, message });
    } catch (error) {
        console.error('Error creating notification:', error);
        return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    if (!sql) {
        return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    try {
        const { notificationId } = await request.json();

        await sql`
            UPDATE notifications
            SET read = true
            WHERE id = ${notificationId}
        `;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error marking notification read:', error);
        return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
    }
}
