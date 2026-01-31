import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { sql, initDatabase } from '@/lib/db';

export async function GET() {
    const session = await auth();
    const user = session?.user as any;
    if (!user?.coupleId) return NextResponse.json({ activeCall: null });

    await initDatabase();

    if (!sql) return NextResponse.json({ error: 'Database not available' }, { status: 503 });

    // Check for active call in couple_data
    // structure: { callerId, type, status, timestamp }
    const result = await sql`
        SELECT call_info FROM couples WHERE id = ${user.coupleId}
    `;

    return NextResponse.json({ activeCall: result[0]?.call_info || null });
}

export async function POST(request: NextRequest) {
    const session = await auth();
    const user = session?.user as any;
    if (!user?.coupleId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { action, type } = await request.json(); // action: 'start' | 'end' | 'answer'

    await initDatabase();

    if (!sql) return NextResponse.json({ error: 'Database not available' }, { status: 503 });

    if (action === 'start') {
        const callInfo = {
            callerId: user.id,
            type, // 'audio' | 'video'
            status: 'ringing',
            timestamp: Date.now()
        };
        await sql`
            UPDATE couples 
            SET call_info = ${JSON.stringify(callInfo)}
            WHERE id = ${user.coupleId}
        `;
    } else if (action === 'end') {
        await sql`
            UPDATE couples 
            SET call_info = NULL 
            WHERE id = ${user.coupleId}
        `;
    } else if (action === 'answer') {
        // Retrieve current to preserve callerId
        const current = await sql`SELECT call_info FROM couples WHERE id = ${user.coupleId}`;
        const info = current[0]?.call_info;
        if (info) {
            info.status = 'connected';
            await sql`
                UPDATE couples 
                SET call_info = ${JSON.stringify(info)}
                WHERE id = ${user.coupleId}
            `;
        }
    } else if (action === 'signal') {
        const { offer, answer, candidate, role } = await request.json(); // role: 'caller' | 'callee'

        const current = await sql`SELECT call_info FROM couples WHERE id = ${user.coupleId}`;
        const info = current[0]?.call_info || {};

        if (offer) info.offer = offer;
        if (answer) info.answer = answer;
        if (candidate) {
            if (role === 'caller') {
                info.callerCandidates = [...(info.callerCandidates || []), candidate];
            } else {
                info.calleeCandidates = [...(info.calleeCandidates || []), candidate];
            }
        }

        await sql`
            UPDATE couples 
            SET call_info = ${JSON.stringify(info)}
            WHERE id = ${user.coupleId}
        `;
    }

    return NextResponse.json({ success: true });
}
