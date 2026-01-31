import { neon, NeonQueryFunction } from '@neondatabase/serverless';

// Get database URL from environment
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    console.warn('DATABASE_URL not set - database features will not work');
}

// Create SQL query function
export const sql: NeonQueryFunction<false, false> | null = DATABASE_URL ? neon(DATABASE_URL) : null;

// Generate unique ID
export function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Generate invite code (6 characters, uppercase)
export function generateInviteCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Initialize database tables (run migrations)
export async function initDatabase() {
    if (!sql) return;

    // Users table
    await sql`
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            name TEXT NOT NULL,
            profile_pic TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    // Couples table
    await sql`
        CREATE TABLE IF NOT EXISTS couples (
            id TEXT PRIMARY KEY,
            partner1_id TEXT REFERENCES users(id) ON DELETE SET NULL,
            partner2_id TEXT REFERENCES users(id) ON DELETE SET NULL,
            invite_code TEXT UNIQUE,
            couple_name TEXT,
            anniversary_date DATE,
            call_info JSONB,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    // Custom love messages
    await sql`
        CREATE TABLE IF NOT EXISTS custom_love_messages (
            id TEXT PRIMARY KEY,
            couple_id TEXT REFERENCES couples(id) ON DELETE CASCADE,
            for_user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
            message TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    // Messages table with couple scoping
    await sql`
        CREATE TABLE IF NOT EXISTS messages (
            id TEXT PRIMARY KEY,
            couple_id TEXT,
            sender_id TEXT,
            sender TEXT,
            content TEXT NOT NULL,
            type TEXT NOT NULL DEFAULT 'text',
            timestamp BIGINT NOT NULL,
            read_at BIGINT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    // User status with proper user reference
    await sql`
        CREATE TABLE IF NOT EXISTS user_status (
            user_id TEXT PRIMARY KEY,
            couple_id TEXT,
            status TEXT NOT NULL DEFAULT 'happy',
            lat DOUBLE PRECISION,
            lng DOUBLE PRECISION,
            last_pulse BIGINT,
            last_seen BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    // Memories with couple scoping
    await sql`
        CREATE TABLE IF NOT EXISTS memories (
            id TEXT PRIMARY KEY,
            couple_id TEXT,
            image_url TEXT NOT NULL,
            caption TEXT,
            date TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    // Notifications with couple scoping
    await sql`
        CREATE TABLE IF NOT EXISTS notifications (
            id TEXT PRIMARY KEY,
            couple_id TEXT,
            from_user TEXT NOT NULL,
            from_user_id TEXT,
            to_user TEXT NOT NULL,
            to_user_id TEXT,
            type TEXT NOT NULL,
            message TEXT NOT NULL,
            timestamp BIGINT NOT NULL,
            read BOOLEAN DEFAULT false,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_messages_couple_id ON messages(couple_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_memories_couple_id ON memories(couple_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_notifications_couple_id ON notifications(couple_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_status_couple_id ON user_status(couple_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_couples_invite_code ON couples(invite_code)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`;
}

// ============================================
// User queries
// ============================================

export async function getUserByEmail(email: string) {
    if (!sql) return null;
    const result = await sql`
        SELECT id, email, password_hash, name, profile_pic, created_at
        FROM users
        WHERE email = ${email}
    `;
    return result[0] || null;
}

export async function getUserById(id: string) {
    if (!sql) return null;
    const result = await sql`
        SELECT id, email, name, profile_pic, created_at
        FROM users
        WHERE id = ${id}
    `;
    return result[0] || null;
}

export async function createUser(id: string, email: string, passwordHash: string, name: string) {
    if (!sql) return null;
    const result = await sql`
        INSERT INTO users (id, email, password_hash, name)
        VALUES (${id}, ${email}, ${passwordHash}, ${name})
        RETURNING id, email, name, profile_pic, created_at
    `;
    return result[0] || null;
}

// ============================================
// Couple queries
// ============================================

export async function getCoupleByUserId(userId: string) {
    if (!sql) return null;
    const result = await sql`
        SELECT c.*, 
               CASE 
                   WHEN c.partner1_id = ${userId} THEN c.partner2_id 
                   ELSE c.partner1_id 
               END as partner_id
        FROM couples c
        WHERE c.partner1_id = ${userId} OR c.partner2_id = ${userId}
    `;
    return result[0] || null;
}

export async function getCoupleByInviteCode(inviteCode: string) {
    if (!sql) return null;
    const result = await sql`
        SELECT * FROM couples
        WHERE invite_code = ${inviteCode}
    `;
    return result[0] || null;
}

export async function createCouple(id: string, partner1Id: string, inviteCode: string) {
    if (!sql) return null;
    const result = await sql`
        INSERT INTO couples (id, partner1_id, invite_code)
        VALUES (${id}, ${partner1Id}, ${inviteCode})
        RETURNING *
    `;
    return result[0] || null;
}

export async function joinCouple(coupleId: string, partner2Id: string) {
    if (!sql) return null;
    const result = await sql`
        UPDATE couples
        SET partner2_id = ${partner2Id}, invite_code = NULL, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${coupleId} AND partner2_id IS NULL
        RETURNING *
    `;
    return result[0] || null;
}

export async function getPartnerInfo(coupleId: string, myUserId: string) {
    if (!sql) return null;
    const result = await sql`
        SELECT u.id, u.email, u.name, u.profile_pic
        FROM users u
        JOIN couples c ON (u.id = c.partner1_id OR u.id = c.partner2_id)
        WHERE c.id = ${coupleId} AND u.id != ${myUserId}
    `;
    return result[0] || null;
}

// ============================================
// Custom love messages
// ============================================

export async function getCustomLoveMessages(coupleId: string, forUserId: string) {
    if (!sql) return [];
    const result = await sql`
        SELECT id, message
        FROM custom_love_messages
        WHERE couple_id = ${coupleId} AND for_user_id = ${forUserId}
        ORDER BY created_at DESC
    `;
    return result;
}

export async function addCustomLoveMessage(id: string, coupleId: string, forUserId: string, message: string) {
    if (!sql) return null;
    const result = await sql`
        INSERT INTO custom_love_messages (id, couple_id, for_user_id, message)
        VALUES (${id}, ${coupleId}, ${forUserId}, ${message})
        RETURNING *
    `;
    return result[0] || null;
}

export async function deleteCustomLoveMessage(id: string, coupleId: string) {
    if (!sql) return false;
    await sql`
        DELETE FROM custom_love_messages
        WHERE id = ${id} AND couple_id = ${coupleId}
    `;
    return true;
}
