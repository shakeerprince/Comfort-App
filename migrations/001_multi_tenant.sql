-- Multi-Tenant Database Schema for Comfort App
-- This migration transforms the single-couple app to support multiple couples

-- ============================================
-- STEP 1: Create new tables
-- ============================================

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    profile_pic TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Couples table with invite system
CREATE TABLE IF NOT EXISTS couples (
    id TEXT PRIMARY KEY,
    partner1_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    partner2_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    invite_code TEXT UNIQUE,
    couple_name TEXT,
    anniversary_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Custom love messages per couple
CREATE TABLE IF NOT EXISTS custom_love_messages (
    id TEXT PRIMARY KEY,
    couple_id TEXT REFERENCES couples(id) ON DELETE CASCADE,
    for_user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- STEP 2: Add couple_id to existing tables
-- ============================================

-- Update messages table
ALTER TABLE messages 
    ADD COLUMN IF NOT EXISTS couple_id TEXT,
    ADD COLUMN IF NOT EXISTS sender_id TEXT;

-- Update memories table  
ALTER TABLE memories 
    ADD COLUMN IF NOT EXISTS couple_id TEXT;

-- Update notifications table
ALTER TABLE notifications
    ADD COLUMN IF NOT EXISTS couple_id TEXT;

-- Update user_status table
ALTER TABLE user_status
    ADD COLUMN IF NOT EXISTS user_id TEXT,
    ADD COLUMN IF NOT EXISTS couple_id TEXT;

-- ============================================
-- STEP 3: Create indexes for performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_messages_couple_id ON messages(couple_id);
CREATE INDEX IF NOT EXISTS idx_memories_couple_id ON memories(couple_id);
CREATE INDEX IF NOT EXISTS idx_notifications_couple_id ON notifications(couple_id);
CREATE INDEX IF NOT EXISTS idx_notifications_to_user ON notifications(to_user);
CREATE INDEX IF NOT EXISTS idx_user_status_user_id ON user_status(user_id);
CREATE INDEX IF NOT EXISTS idx_couples_invite_code ON couples(invite_code);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
