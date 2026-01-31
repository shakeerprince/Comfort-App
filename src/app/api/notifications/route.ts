import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { sql, initDatabase, generateId, getCoupleByUserId, getPartnerInfo, getCustomLoveMessages } from '@/lib/db';

// Default love message templates (use {partnerName} and {myName} as placeholders)
const defaultLoveMessageTemplates = [
    "{partnerName} is thinking about you right now... their heart aches to hold you 💕",
    "Your {partnerName} loves you more than you'll ever know. You're their everything 🥰",
    "Hey beautiful... {partnerName} just wanted you to know - you're the reason their heart beats 💓",
    "{myName}, {partnerName} is counting every second until they can see you again 💘",
    "You know what? {partnerName} would cross oceans for you. They'd do anything to see you happy 🌊💕",
    "{partnerName} falls in love with you a little more every single day. You're their miracle 💝",
    "When {partnerName} imagines their future, you're in every single frame 🎬💕",
    "The way {partnerName} looks at you when you're not watching? That's pure, infinite love 👀💕",
    "You are irreplaceable. To {partnerName}, you're the only one who matters 🌹",
    "{partnerName}'s heart whispers your name with every beat. {myName}. {myName}. {myName}. 💓",
    "Right now, somewhere, {partnerName} is smiling thinking about you 🤗",
    "{myName}, you're {partnerName}'s safe place, their home, their everything 💖",
    "{partnerName} chose you. Every day, they'd choose you again 💑",
    "When {partnerName} is scared, they think of you. You're their strength 🌸",
];

function replacePlaceholders(message: string, myName: string, partnerName: string): string {
    return message
        .replace(/{myName}/g, myName)
        .replace(/{partnerName}/g, partnerName);
}

export async function GET(request: NextRequest) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!sql) {
        return NextResponse.json({ notifications: [] });
    }

    try {
        await initDatabase();

        const couple = await getCoupleByUserId(session.user.id);

        if (!couple) {
            return NextResponse.json({ notifications: [], paired: false });
        }

        // Get unread notifications for this user
        const notifications = await sql`
            SELECT n.id, n.from_user_id, n.type, n.message, n.timestamp, n.read,
                   u.name as from_user_name
            FROM notifications n
            LEFT JOIN users u ON n.from_user_id = u.id
            WHERE n.couple_id = ${couple.id} AND n.to_user_id = ${session.user.id} AND n.read = false
            ORDER BY n.timestamp ASC
            LIMIT 20
        `;

        return NextResponse.json({
            notifications: notifications.map(n => ({
                id: n.id,
                fromUserId: n.from_user_id,
                fromUserName: n.from_user_name,
                type: n.type,
                message: n.message,
                timestamp: Number(n.timestamp),
                read: n.read
            }))
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return NextResponse.json({ notifications: [] });
    }
}

export async function POST(request: NextRequest) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!sql) {
        return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    try {
        await initDatabase();

        const couple = await getCoupleByUserId(session.user.id);

        if (!couple || !couple.partner2_id) {
            return NextResponse.json({ error: 'You need to be paired to send notifications' }, { status: 400 });
        }

        const { type } = await request.json();

        const partner = await getPartnerInfo(couple.id, session.user.id);
        if (!partner) {
            return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
        }

        const myName = session.user.name || 'Your partner';
        const partnerName = partner.name || 'Your love';

        // Generate message based on type
        let message = '';
        switch (type) {
            case 'hug':
                message = `${myName} just sent you the warmest hug! 🤗💕 They love you so much!`;
                break;
            case 'pain':
                message = `${myName} knows you're not feeling well 💝 They're here for you always!`;
                break;
            case 'craving':
                message = `${myName} saw you're craving something! They'll make it happen 🍫💕`;
                break;
            case 'love':
                // Get custom messages first, fall back to templates
                const customMessages = await getCustomLoveMessages(couple.id, partner.id);
                if (customMessages.length > 0) {
                    // 50% chance to use custom message if available
                    if (Math.random() > 0.5) {
                        message = customMessages[Math.floor(Math.random() * customMessages.length)].message;
                    } else {
                        const template = defaultLoveMessageTemplates[Math.floor(Math.random() * defaultLoveMessageTemplates.length)];
                        message = replacePlaceholders(template, partnerName, myName);
                    }
                } else {
                    const template = defaultLoveMessageTemplates[Math.floor(Math.random() * defaultLoveMessageTemplates.length)];
                    message = replacePlaceholders(template, partnerName, myName);
                }
                break;
            default:
                message = `${myName} has something for you 💕`;
        }

        const id = generateId();
        const timestamp = Date.now();

        await sql`
            INSERT INTO notifications (id, couple_id, from_user_id, from_user, to_user_id, to_user, type, message, timestamp, read)
            VALUES (${id}, ${couple.id}, ${session.user.id}, ${myName}, ${partner.id}, ${partner.name}, ${type}, ${message}, ${timestamp}, false)
        `;

        return NextResponse.json({ success: true, message });
    } catch (error) {
        console.error('Error creating notification:', error);
        return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!sql) {
        return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    try {
        const couple = await getCoupleByUserId(session.user.id);
        if (!couple) {
            return NextResponse.json({ error: 'No couple found' }, { status: 404 });
        }

        const { notificationId } = await request.json();

        await sql`
            UPDATE notifications
            SET read = true
            WHERE id = ${notificationId} AND couple_id = ${couple.id} AND to_user_id = ${session.user.id}
        `;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error marking notification read:', error);
        return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
    }
}
