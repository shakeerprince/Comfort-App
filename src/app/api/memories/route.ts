import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { sql, initDatabase, generateId, getCoupleByUserId } from '@/lib/db';

export async function GET() {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!sql) {
        return NextResponse.json({ memories: [] });
    }

    try {
        await initDatabase();

        const couple = await getCoupleByUserId(session.user.id);

        if (!couple) {
            return NextResponse.json({ memories: [], paired: false });
        }

        const memories = await sql`
            SELECT id, image_url as "imageData", caption, date, created_at
            FROM memories
            WHERE couple_id = ${couple.id}
            ORDER BY created_at DESC
        `;

        return NextResponse.json({ memories });
    } catch (error) {
        console.error('Error fetching memories:', error);
        return NextResponse.json({ error: 'Failed to fetch memories' }, { status: 500 });
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

        if (!couple) {
            return NextResponse.json({ error: 'You need to be in a couple to add memories' }, { status: 400 });
        }

        const { imageData, caption, date } = await request.json();

        if (!imageData || !date) {
            return NextResponse.json({ error: 'Image and date are required' }, { status: 400 });
        }

        const id = generateId();

        await sql`
            INSERT INTO memories (id, couple_id, image_url, caption, date)
            VALUES (${id}, ${couple.id}, ${imageData}, ${caption || null}, ${date})
        `;

        return NextResponse.json({ success: true, id });
    } catch (error) {
        console.error('Error saving memory:', error);
        return NextResponse.json({ error: 'Failed to save memory' }, { status: 500 });
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

        const { memoryId } = await request.json();

        await sql`
            DELETE FROM memories
            WHERE id = ${memoryId} AND couple_id = ${couple.id}
        `;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting memory:', error);
        return NextResponse.json({ error: 'Failed to delete memory' }, { status: 500 });
    }
}
