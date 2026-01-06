import { NextRequest, NextResponse } from 'next/server';
import { sql, initDatabase } from '@/lib/db';

export async function GET() {
    if (!sql) {
        // Fallback: return empty - client will use localStorage
        return NextResponse.json({ memories: [] });
    }

    try {
        await initDatabase();
        const memories = await sql`
            SELECT id, image_url as "imageData", caption, date
            FROM memories
            ORDER BY created_at DESC
        `;
        return NextResponse.json({ memories });
    } catch (error) {
        console.error('Error fetching memories:', error);
        return NextResponse.json({ error: 'Failed to fetch memories' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    if (!sql) {
        return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    try {
        await initDatabase();
        const { id, imageData, caption, date } = await request.json();

        await sql`
            INSERT INTO memories (id, image_url, caption, date)
            VALUES (${id}, ${imageData}, ${caption}, ${date})
        `;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error saving memory:', error);
        return NextResponse.json({ error: 'Failed to save memory' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    if (!sql) {
        return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    try {
        const { memoryId } = await request.json();

        await sql`
            DELETE FROM memories
            WHERE id = ${memoryId}
        `;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting memory:', error);
        return NextResponse.json({ error: 'Failed to delete memory' }, { status: 500 });
    }
}
