import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { sql, initDatabase, generateId, getUserByEmail, createUser } from '@/lib/db';

export async function POST(request: NextRequest) {
    if (!sql) {
        console.error('Registration error: DATABASE_URL not configured');
        return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    try {
        console.log('Starting registration...');
        await initDatabase();
        console.log('Database initialized');

        const { email, password, name } = await request.json();
        console.log('Received registration for:', email);

        // Validate input
        if (!email || !password || !name) {
            return NextResponse.json({ error: 'Email, password, and name are required' }, { status: 400 });
        }

        if (password.length < 6) {
            return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
        }

        // Check if user already exists
        console.log('Checking if user exists...');
        const existingUser = await getUserByEmail(email.toLowerCase());
        if (existingUser) {
            console.log('User already exists');
            return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
        }

        // Hash password
        console.log('Hashing password...');
        const passwordHash = await bcrypt.hash(password, 12);

        // Create user
        console.log('Creating user...');
        const userId = generateId();
        const user = await createUser(userId, email.toLowerCase(), passwordHash, name);
        console.log('User created:', user);

        if (!user) {
            console.error('createUser returned null');
            return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
            message: 'Account created successfully! Please log in.'
        });
    } catch (error: any) {
        console.error('Registration error:', error);
        console.error('Error message:', error?.message);
        console.error('Error stack:', error?.stack);
        return NextResponse.json({ error: 'Failed to create account: ' + (error?.message || 'Unknown error') }, { status: 500 });
    }
}

