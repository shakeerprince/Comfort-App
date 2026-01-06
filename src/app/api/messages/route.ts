import { NextRequest, NextResponse } from 'next/server';
import { sql, initDatabase } from '@/lib/db';

export async function GET() {
    console.log('[API] GET /api/messages - Fetching messages');

    if (!sql) {
        console.log('[API] No SQL connection - returning empty array');
        return NextResponse.json({ messages: [] });
    }

    try {
        await initDatabase();
        const messages = await sql`
            SELECT id, sender, content, type, timestamp, read_at
            FROM messages
            ORDER BY timestamp ASC
            LIMIT 100
        `;
        console.log('[API] Found messages:', messages.length);
        return NextResponse.json({ messages });
    } catch (error) {
        console.error('[API] Error fetching messages:', error);
        return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    console.log('[API] POST /api/messages - Creating message');

    if (!sql) {
        console.log('[API] No SQL connection - cannot save');
        return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    try {
        await initDatabase();
        const body = await request.json();
        console.log('[API] Message body:', body);

        const { id, sender, content, type, timestamp } = body;

        const result = await sql`
            INSERT INTO messages (id, sender, content, type, timestamp)
            VALUES (${id}, ${sender}, ${content}, ${type}, ${timestamp})
            RETURNING id
        `;

        console.log('[API] Insert result:', result);
        return NextResponse.json({ success: true, id: result[0]?.id });
    } catch (error) {
        console.error('[API] Error sending message:', error);
        return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    if (!sql) {
        return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    try {
        const { messageId, readAt } = await request.json();

        await sql`
            UPDATE messages
            SET read_at = ${readAt}
            WHERE id = ${messageId} AND read_at IS NULL
        `;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error marking message as read:', error);
        return NextResponse.json({ error: 'Failed to update message' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    if (!sql) {
        return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    try {
        const { messageId } = await request.json();

        await sql`
            DELETE FROM messages
            WHERE id = ${messageId}
        `;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting message:', error);
        return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 });
    }
}
