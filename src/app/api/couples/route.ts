import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { sql, initDatabase, generateId, generateInviteCode, getCoupleByUserId, getCoupleByInviteCode, createCouple, joinCouple, getPartnerInfo } from '@/lib/db';

// GET - Get couple info for current user
export async function GET() {
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
            return NextResponse.json({ couple: null, paired: false });
        }

        const partner = await getPartnerInfo(couple.id, session.user.id);

        return NextResponse.json({
            couple: {
                id: couple.id,
                inviteCode: couple.invite_code,
                coupleName: couple.couple_name,
                anniversaryDate: couple.anniversary_date,
                createdAt: couple.created_at,
            },
            partner: partner ? {
                id: partner.id,
                name: partner.name,
                profilePic: partner.profile_pic,
            } : null,
            paired: !!couple.partner2_id
        });
    } catch (error) {
        console.error('Error fetching couple:', error);
        return NextResponse.json({ error: 'Failed to fetch couple info' }, { status: 500 });
    }
}

// POST - Create a new couple (generate invite code) or join existing couple
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

        const { action, inviteCode: inputInviteCode } = await request.json();

        // Check if user is already in a couple
        const existingCouple = await getCoupleByUserId(session.user.id);

        if (action === 'create') {
            // Create new couple with invite code
            if (existingCouple) {
                return NextResponse.json({
                    inviteCode: existingCouple.invite_code,
                    message: 'You already have a pending invite code'
                });
            }

            const coupleId = generateId();
            const inviteCode = generateInviteCode();

            const couple = await createCouple(coupleId, session.user.id, inviteCode);

            if (!couple) {
                return NextResponse.json({ error: 'Failed to create couple' }, { status: 500 });
            }

            return NextResponse.json({
                success: true,
                inviteCode: couple.invite_code,
                coupleId: couple.id,
                message: 'Share this code with your partner!'
            });
        }

        if (action === 'join') {
            // Join existing couple using invite code
            if (!inputInviteCode) {
                return NextResponse.json({ error: 'Invite code is required' }, { status: 400 });
            }

            if (existingCouple?.partner2_id) {
                return NextResponse.json({ error: 'You are already paired with someone' }, { status: 400 });
            }

            const coupleToJoin = await getCoupleByInviteCode(inputInviteCode.toUpperCase());

            if (!coupleToJoin) {
                return NextResponse.json({ error: 'Invalid invite code' }, { status: 404 });
            }

            if (coupleToJoin.partner1_id === session.user.id) {
                return NextResponse.json({ error: 'You cannot join your own couple' }, { status: 400 });
            }

            if (coupleToJoin.partner2_id) {
                return NextResponse.json({ error: 'This couple already has two partners' }, { status: 400 });
            }

            // If user had a pending couple (unpaired), we can let them join another
            // Delete their old unpaired couple first
            if (existingCouple && !existingCouple.partner2_id) {
                await sql`DELETE FROM couples WHERE id = ${existingCouple.id}`;
            }

            const updatedCouple = await joinCouple(coupleToJoin.id, session.user.id);

            if (!updatedCouple) {
                return NextResponse.json({ error: 'Failed to join couple' }, { status: 500 });
            }

            const partner = await getPartnerInfo(updatedCouple.id, session.user.id);

            return NextResponse.json({
                success: true,
                coupleId: updatedCouple.id,
                partner: partner ? {
                    id: partner.id,
                    name: partner.name,
                    profilePic: partner.profile_pic,
                } : null,
                message: 'Successfully paired! 💕'
            });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Couple operation error:', error);
        return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
    }
}

// PATCH - Update couple settings (name, anniversary)
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

        const { coupleName, anniversaryDate } = await request.json();

        await sql`
            UPDATE couples
            SET couple_name = COALESCE(${coupleName}, couple_name),
                anniversary_date = COALESCE(${anniversaryDate}, anniversary_date),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ${couple.id}
        `;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating couple:', error);
        return NextResponse.json({ error: 'Failed to update couple' }, { status: 500 });
    }
}
