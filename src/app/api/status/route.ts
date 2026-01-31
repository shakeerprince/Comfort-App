import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { sql, initDatabase, getCoupleByUserId, getPartnerInfo } from '@/lib/db';

export async function GET() {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!sql) {
        return NextResponse.json({ users: {} });
    }

    try {
        await initDatabase();

        const couple = await getCoupleByUserId(session.user.id);

        if (!couple) {
            return NextResponse.json({ users: {}, paired: false });
        }

        const statuses = await sql`
            SELECT us.user_id, us.status, us.lat, us.lng, us.last_pulse, us.last_seen,
                   u.name, u.profile_pic
            FROM user_status us
            JOIN users u ON us.user_id = u.id
            WHERE us.couple_id = ${couple.id}
        `;

        const usersMap: Record<string, any> = {};
        for (const s of statuses) {
            usersMap[s.user_id as string] = {
                name: s.name,
                profilePic: s.profile_pic,
                status: s.status,
                lat: s.lat,
                lng: s.lng,
                lastPulse: s.last_pulse ? Number(s.last_pulse) : null,
                lastSeen: s.last_seen ? Number(s.last_seen) : null
            };
        }

        return NextResponse.json({ users: usersMap, coupleId: couple.id });
    } catch (error) {
        console.error('Error fetching status:', error);
        return NextResponse.json({ error: 'Failed to fetch status' }, { status: 500 });
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
            return NextResponse.json({ error: 'No couple found' }, { status: 404 });
        }

        const { status, lat, lng, lastPulse } = await request.json();
        const lastSeen = Date.now();

        await sql`
            INSERT INTO user_status (user_id, couple_id, status, lat, lng, last_pulse, last_seen)
            VALUES (${session.user.id}, ${couple.id}, ${status || 'happy'}, ${lat}, ${lng}, ${lastPulse}, ${lastSeen})
            ON CONFLICT (user_id) DO UPDATE SET
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
