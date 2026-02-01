import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { savePushSubscription, deletePushSubscription } from '@/lib/db';

export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { action, subscription } = await request.json();
        const userId = (session.user as any).id;

        if (action === 'subscribe') {
            await savePushSubscription(userId, subscription);
            return NextResponse.json({ success: true });
        } else if (action === 'unsubscribe') {
            await deletePushSubscription(userId, subscription.endpoint);
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error: any) {
        console.error('[PUSH_SUBSCRIBE_ERROR]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
