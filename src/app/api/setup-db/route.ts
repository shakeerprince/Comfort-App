
import { NextResponse } from 'next/server';
import { initDatabase } from '@/lib/db';

export async function GET() {
    try {
        if (!process.env.DATABASE_URL) {
            return NextResponse.json({ success: false, error: 'DATABASE_URL is missing on server' }, { status: 500 });
        }
        await initDatabase();
        return NextResponse.json({ success: true, message: 'Database initialized successfully' });
    } catch (error: any) {
        console.error('Database initialization failed:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to initialize database',
                details: error?.message || String(error),
                stack: error?.stack
            },
            { status: 500 }
        );
    }
}
