import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { sql, initDatabase, generateId, getCoupleByUserId } from '@/lib/db';

export async function GET() {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!sql) {
        return NextResponse.json({ messages: [] });
    }

    try {
        await initDatabase();

        const couple = await getCoupleByUserId(session.user.id);

        if (!couple) {
            return NextResponse.json({ messages: [], paired: false });
        }

        const messages = await sql`
            SELECT m.id, m.sender_id, m.content, m.type, m.timestamp, m.read_at,
                   u.name as sender_name
            FROM messages m
            LEFT JOIN users u ON m.sender_id = u.id
            WHERE m.couple_id = ${couple.id}
            ORDER BY m.timestamp ASC
            LIMIT 100
        `;

        return NextResponse.json({
            messages: messages.map(m => ({
                id: m.id,
                senderId: m.sender_id,
                senderName: m.sender_name,
                content: m.content,
                type: m.type,
                timestamp: Number(m.timestamp),
                readAt: m.read_at ? Number(m.read_at) : null
            }))
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
        return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
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
            return NextResponse.json({ error: 'You need to be paired with someone to send messages' }, { status: 400 });
        }

        const { content, type = 'text' } = await request.json();

        if (!content?.trim()) {
            return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
        }

        const id = generateId();
        const timestamp = Date.now();

        await sql`
            INSERT INTO messages (id, couple_id, sender_id, content, type, timestamp)
            VALUES (${id}, ${couple.id}, ${session.user.id}, ${content}, ${type}, ${timestamp})
        `;

        return NextResponse.json({
            success: true,
            message: {
                id,
                senderId: session.user.id,
                senderName: session.user.name,
                content,
                type,
                timestamp,
                readAt: null
            }
        });
    } catch (error) {
        console.error('Error sending message:', error);
        return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
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

        const { messageId, readAt } = await request.json();

        await sql`
            UPDATE messages
            SET read_at = ${readAt}
            WHERE id = ${messageId} AND couple_id = ${couple.id} AND read_at IS NULL
        `;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error marking message as read:', error);
        return NextResponse.json({ error: 'Failed to update message' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
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

        const { messageId } = await request.json();

        // Only allow deleting own messages
        await sql`
            DELETE FROM messages
            WHERE id = ${messageId} AND couple_id = ${couple.id} AND sender_id = ${session.user.id}
        `;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting message:', error);
        return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 });
    }
}
