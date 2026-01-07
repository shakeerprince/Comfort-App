import { NextRequest, NextResponse } from 'next/server';
import { sql, initDatabase } from '@/lib/db';

export async function GET(request: NextRequest) {
    if (!sql) {
        return NextResponse.json({ users: {} });
    }

    try {
        await initDatabase();
        const users = await sql`
            SELECT user_role, status, lat, lng, last_pulse, last_seen
            FROM user_status
        `;

        interface UserRow {
            user_role: string;
            status: string;
            lat: number | null;
            lng: number | null;
            last_pulse: number | null;
            last_seen: number;
        }

        const usersMap: Record<string, { status: string; lat: number | null; lng: number | null; lastPulse: number | null; lastSeen: number }> = {};
        (users as UserRow[]).forEach((u) => {
            usersMap[u.user_role] = {
                status: u.status,
                lat: u.lat,
                lng: u.lng,
                lastPulse: u.last_pulse,
                lastSeen: u.last_seen
            };
        });

        return NextResponse.json({ users: usersMap });
    } catch (error) {
        console.error('Error fetching status:', error);
        return NextResponse.json({ error: 'Failed to fetch status' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    if (!sql) {
        return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    try {
        await initDatabase();
        const { userRole, status, lat, lng, lastPulse } = await request.json();
        const lastSeen = Date.now();

        await sql`
            INSERT INTO user_status (user_role, status, lat, lng, last_pulse, last_seen)
            VALUES (${userRole}, ${status || 'happy'}, ${lat}, ${lng}, ${lastPulse}, ${lastSeen})
            ON CONFLICT (user_role) DO UPDATE SET
                status = COALESCE(${status}, user_status.status),
                lat = COALESCE(${lat}, user_status.lat),
                lng = COALESCE(${lng}, user_status.lng),
                last_pulse = COALESCE(${lastPulse}, user_status.last_pulse),
                last_seen = ${lastSeen},
                updated_at = CURRENT_TIMESTAMP
        `;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating status:', error);
        return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
    }
}
