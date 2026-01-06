import { neon } from '@neondatabase/serverless';

// Get database URL from environment
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    console.warn('DATABASE_URL not set - database features will not work');
}

// Create SQL query function
export const sql = DATABASE_URL ? neon(DATABASE_URL) : null;

// Initialize database tables
export async function initDatabase() {
    if (!sql) return;

    await sql`
        CREATE TABLE IF NOT EXISTS messages (
            id TEXT PRIMARY KEY,
            sender TEXT NOT NULL,
            content TEXT NOT NULL,
            type TEXT NOT NULL DEFAULT 'text',
            timestamp BIGINT NOT NULL,
            read_at BIGINT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    await sql`
        CREATE TABLE IF NOT EXISTS user_status (
            user_role TEXT PRIMARY KEY,
            status TEXT NOT NULL DEFAULT 'happy',
            lat DOUBLE PRECISION,
            lng DOUBLE PRECISION,
            last_pulse BIGINT,
            last_seen BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    await sql`
        CREATE TABLE IF NOT EXISTS memories (
            id TEXT PRIMARY KEY,
            image_url TEXT NOT NULL,
            caption TEXT,
            date TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    await sql`
        CREATE TABLE IF NOT EXISTS notifications (
            id TEXT PRIMARY KEY,
            from_user TEXT NOT NULL,
            to_user TEXT NOT NULL,
            type TEXT NOT NULL,
            message TEXT NOT NULL,
            timestamp BIGINT NOT NULL,
            read BOOLEAN DEFAULT false,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    // Initialize users if not exist
    await sql`
        INSERT INTO user_status (user_role, status)
        VALUES ('shaker', 'happy'), ('keerthi', 'happy')
        ON CONFLICT (user_role) DO NOTHING
    `;
}
