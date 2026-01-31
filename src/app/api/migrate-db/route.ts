import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
    if (!sql) return NextResponse.json({ error: 'DB not connected' });

    try {
        // Add call_info column if it doesn't exist
        await sql`
            ALTER TABLE couples 
            ADD COLUMN IF NOT EXISTS call_info JSONB
        `;

        return NextResponse.json({ success: true, message: 'Schema updated: Added call_info' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message });
    }
}
