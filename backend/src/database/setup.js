// 🛠️ DATABASE SETUP
// backend/src/database/setup.js
// Auto-creates tables, indexes, and sample data

// Import deine bestehende connection
let pool;
try {
  const connection = require('./connection');
  pool = connection.pool || connection.getPool?.() || null;
} catch (err) {
  console.warn('⚠️  Using fallback connection method');
}

// Fallback connection if needed
if (!pool) {
  const { Pool } = require('pg');
  pool = new Pool({
    user: process.env.DB_USER || 'retro_user',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'retro_gaming',
    password: process.env.DB_PASSWORD || 'retro_password',
    port: process.env.DB_PORT || 5432,
  });
}

// ================================
// DATABASE SETUP CLASS
// ================================

class DatabaseSetup {
    constructor() {
        this.pool = pool;
    }

    // Check if required tables exist
    async checkTablesExist() {
        try {
            const query = `
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' AND table_name IN (
                    'users', 'games', 'game_sessions', 'session_players', 
                    'user_scores', 'user_personal_bests'
                )
            `;
            
            const result = await this.pool.query(query);
            const existingTables = result.rows.map(row => row.table_name);
            
            const requiredTables = [
                'users', 'games', 'game_sessions', 'session_players',
                'user_scores', 'user_personal_bests'
            ];
            
            const missingTables = requiredTables.filter(table => !existingTables.includes(table));
            
            return {
                exists: missingTables.length === 0,
                existing: existingTables,
                missing: missingTables,
                total: requiredTables.length
            };
        } catch (error) {
            console.error('❌ Error checking tables:', error);
            return { exists: false, existing: [], missing: [], total: 0 };
        }
    }

    // Create all required tables
    async createTables() {
        const client = await this.pool.connect();
        
        try {
            await client.query('BEGIN');
            
            console.log('🗄️ Creating database tables...');
            
            // 1. Enable UUID extension if not exists
            await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
            
            // 2. Users table
            await client.query(`
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    username VARCHAR(50) UNIQUE NOT NULL,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    password_hash VARCHAR(255) NOT NULL,
                    display_name VARCHAR(100),
                    avatar_url VARCHAR(500),
                    membership_tier VARCHAR(20) DEFAULT 'free' CHECK (membership_tier IN ('free', 'premium', 'vip')),
                    language_preference VARCHAR(5) DEFAULT 'en' CHECK (language_preference IN ('en', 'de', 'fr', 'es', 'it')),
                    total_playtime INTEGER DEFAULT 0,
                    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    is_active BOOLEAN DEFAULT true,
                    email_verified BOOLEAN DEFAULT false
                )
            `);

            // 3. Games table
            await client.query(`
                CREATE TABLE IF NOT EXISTS games (
                    id SERIAL PRIMARY KEY,
                    slug VARCHAR(100) UNIQUE NOT NULL,
                    title VARCHAR(200) NOT NULL,
                    description TEXT,
                    category VARCHAR(50),
                    difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),
                    max_players INTEGER DEFAULT 1,
                    min_players INTEGER DEFAULT 1,
                    estimated_duration INTEGER,
                    thumbnail_url VARCHAR(500),
                    game_data JSONB,
                    required_membership VARCHAR(20) DEFAULT 'free' CHECK (required_membership IN ('free', 'premium', 'vip')),
                    is_multiplayer BOOLEAN DEFAULT false,
                    is_active BOOLEAN DEFAULT true,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // 4. Game sessions table
            await client.query(`
                CREATE TABLE IF NOT EXISTS game_sessions (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    game_id INTEGER REFERENCES games(id),
                    session_name VARCHAR(100),
                    host_user_id INTEGER REFERENCES users(id),
                    max_players INTEGER DEFAULT 4,
                    current_players INTEGER DEFAULT 0,
                    session_status VARCHAR(20) DEFAULT 'waiting' CHECK (session_status IN ('waiting', 'active', 'paused', 'finished')),
                    game_state JSONB,
                    settings JSONB,
                    started_at TIMESTAMP,
                    ended_at TIMESTAMP,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // 5. Session players table
            await client.query(`
                CREATE TABLE IF NOT EXISTS session_players (
                    id SERIAL PRIMARY KEY,
                    session_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
                    user_id INTEGER REFERENCES users(id),
                    player_number INTEGER,
                    socket_id VARCHAR(100),
                    player_state JSONB,
                    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    left_at TIMESTAMP,
                    is_active BOOLEAN DEFAULT true,
                    UNIQUE(session_id, user_id)
                )
            `);

            // 6. User scores table
            await client.query(`
                CREATE TABLE IF NOT EXISTS user_scores (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                    game_id INTEGER REFERENCES games(id),
                    session_id UUID REFERENCES game_sessions(id),
                    score INTEGER DEFAULT 0,
                    level_reached INTEGER DEFAULT 1,
                    time_played INTEGER,
                    completed BOOLEAN DEFAULT false,
                    score_data JSONB,
                    achieved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(user_id, session_id)
                )
            `);

            // 7. Personal bests table
            await client.query(`
                CREATE TABLE IF NOT EXISTS user_personal_bests (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                    game_id INTEGER REFERENCES games(id),
                    best_score INTEGER DEFAULT 0,
                    best_level INTEGER DEFAULT 1,
                    fastest_completion INTEGER,
                    total_games_played INTEGER DEFAULT 0,
                    last_played TIMESTAMP,
                    first_achieved TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(user_id, game_id)
                )
            `);

            // 8. Achievements table (optional)
            await client.query(`
                CREATE TABLE IF NOT EXISTS achievements (
                    id SERIAL PRIMARY KEY,
                    slug VARCHAR(100) UNIQUE NOT NULL,
                    title VARCHAR(200) NOT NULL,
                    description TEXT,
                    icon_url VARCHAR(500),
                    points INTEGER DEFAULT 10,
                    category VARCHAR(50),
                    requirements JSONB,
                    is_active BOOLEAN DEFAULT true,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // 9. User achievements table (optional)
            await client.query(`
                CREATE TABLE IF NOT EXISTS user_achievements (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                    achievement_id INTEGER REFERENCES achievements(id),
                    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    progress_data JSONB,
                    UNIQUE(user_id, achievement_id)
                )
            `);

            await client.query('COMMIT');
            console.log('✅ All database tables created successfully');
            return true;
            
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('❌ Error creating tables:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    // Create performance indexes
    async createIndexes() {
        try {
            console.log('🔍 Creating database indexes...');
            
            const indexes = [
                // User indexes
                'CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)',
                'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
                'CREATE INDEX IF NOT EXISTS idx_users_last_active ON users(last_active)',
                
                // Game indexes
                'CREATE INDEX IF NOT EXISTS idx_games_slug ON games(slug)',
                'CREATE INDEX IF NOT EXISTS idx_games_category ON games(category)',
                
                // Session indexes
                'CREATE INDEX IF NOT EXISTS idx_game_sessions_status ON game_sessions(session_status)',
                'CREATE INDEX IF NOT EXISTS idx_game_sessions_game_id ON game_sessions(game_id)',
                'CREATE INDEX IF NOT EXISTS idx_session_players_user_id ON session_players(user_id)',
                'CREATE INDEX IF NOT EXISTS idx_session_players_socket_id ON session_players(socket_id)',
                
                // Score indexes
                'CREATE INDEX IF NOT EXISTS idx_user_scores_user_game ON user_scores(user_id, game_id)',
                'CREATE INDEX IF NOT EXISTS idx_user_scores_game_score ON user_scores(game_id, score DESC)',
                'CREATE INDEX IF NOT EXISTS idx_user_personal_bests_game ON user_personal_bests(game_id, best_score DESC)',
                
                // Achievement indexes
                'CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id)',
                'CREATE INDEX IF NOT EXISTS idx_achievements_slug ON achievements(slug)'
            ];

            for (const indexQuery of indexes) {
                await this.pool.query(indexQuery);
            }
            
            console.log('✅ All database indexes created successfully');
            return true;
        } catch (error) {
            console.error('❌ Error creating indexes:', error);
            // Don't throw - indexes are not critical for basic functionality
            return false;
        }
    }

    // Insert sample data
    async insertSampleData() {
        const client = await this.pool.connect();
        
        try {
            await client.query('BEGIN');
            
            console.log('📝 Inserting sample data...');
            
            // Check if games already exist
            const existingGames = await client.query('SELECT COUNT(*) as count FROM games');
            
            if (existingGames.rows[0].count == 0) {
                // Insert sample games matching your frontend games
                await client.query(`
                    INSERT INTO games (slug, title, description, category, difficulty_level, max_players, is_multiplayer, required_membership) VALUES
                    ('snake', 'Snake Game', 'Classic Snake game built in React', 'arcade', 2, 4, true, 'free'),
                    ('memory', 'Memory Game', 'Test your memory with cards', 'puzzle', 2, 1, false, 'free'),
                    ('pong', 'Pong Demo', 'Simple Pong game simulation', 'arcade', 1, 2, true, 'free'),
                    ('tetris', 'Tetris Demo', 'Tetris-style block game', 'puzzle', 3, 2, true, 'free')
                `);
                
                console.log('✅ Sample games inserted');
            }

            // Check if achievements exist
            const existingAchievements = await client.query('SELECT COUNT(*) as count FROM achievements');
            
            if (existingAchievements.rows[0].count == 0) {
                // Insert sample achievements
                await client.query(`
                    INSERT INTO achievements (slug, title, description, category, points) VALUES
                    ('first_game', 'First Steps', 'Play your first game', 'milestone', 10),
                    ('snake_master', 'Snake Master', 'Reach level 10 in Snake', 'gameplay', 25),
                    ('memory_champion', 'Memory Champion', 'Complete Memory game in under 30 seconds', 'gameplay', 30),
                    ('pong_winner', 'Pong Champion', 'Win 5 Pong matches', 'competitive', 40),
                    ('tetris_expert', 'Tetris Expert', 'Clear 100 lines in Tetris', 'gameplay', 50),
                    ('multiplayer_social', 'Social Gamer', 'Play 10 multiplayer matches', 'social', 35),
                    ('daily_player', 'Daily Dedication', 'Play games 7 days in a row', 'milestone', 100)
                `);
                
                console.log('✅ Sample achievements inserted');
            }

            await client.query('COMMIT');
            console.log('✅ Sample data inserted successfully');
            
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('❌ Error inserting sample data:', error);
            // Don't throw - sample data is not critical
            return false;
        } finally {
            client.release();
        }
        
        return true;
    }

    // Main setup function
    async setupDatabase() {
        try {
            console.log('🚀 Starting database setup...');
            
            // Check current state
            const tableCheck = await this.checkTablesExist();
            console.log(`📊 Tables status: ${tableCheck.existing.length}/${tableCheck.total} exist`);
            
            if (!tableCheck.exists) {
                console.log(`📋 Missing tables: ${tableCheck.missing.join(', ')}`);
                
                // Create missing tables
                await this.createTables();
                
                // Create performance indexes
                await this.createIndexes();
                
                // Insert sample data
                await this.insertSampleData();
                
                console.log('🎉 Database setup completed successfully!');
            } else {
                console.log('✅ Database schema already exists');
                
                // Still try to create indexes (safe operation)
                await this.createIndexes();
                
                // Check if sample data needs to be added
                const gameCount = await this.pool.query('SELECT COUNT(*) as count FROM games');
                if (gameCount.rows[0].count === 0) {
                    await this.insertSampleData();
                }
            }
            
            return true;
            
        } catch (error) {
            console.error('❌ Database setup failed:', error);
            console.log('⚠️  Server will continue in basic mode');
            return false;
        }
    }

    // Database health check
    async healthCheck() {
        try {
            // Test basic connection
            const connectionTest = await this.pool.query('SELECT NOW() as timestamp, version() as version');
            
            // Check table status
            const tableCheck = await this.checkTablesExist();
            
            // Count records
            const counts = {};
            for (const table of tableCheck.existing) {
                try {
                    const result = await this.pool.query(`SELECT COUNT(*) as count FROM ${table}`);
                    counts[table] = parseInt(result.rows[0].count);
                } catch (err) {
                    counts[table] = 'error';
                }
            }
            
            return {
                connected: true,
                timestamp: connectionTest.rows[0].timestamp,
                version: connectionTest.rows[0].version,
                tables: tableCheck,
                recordCounts: counts,
                ready: tableCheck.exists
            };
        } catch (error) {
            return {
                connected: false,
                error: error.message,
                ready: false
            };
        }
    }

    // Utility: Reset database (DANGER - only for development)
    async resetDatabase() {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('Database reset not allowed in production');
        }
        
        const client = await this.pool.connect();
        
        try {
            await client.query('BEGIN');
            
            console.log('⚠️  RESETTING DATABASE - ALL DATA WILL BE LOST!');
            
            // Drop tables in reverse order (handle foreign keys)
            const tables = [
                'user_achievements',
                'achievements', 
                'user_personal_bests',
                'user_scores',
                'session_players',
                'game_sessions',
                'games',
                'users'
            ];
            
            for (const table of tables) {
                await client.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
                console.log(`🗑️  Dropped table: ${table}`);
            }
            
            await client.query('COMMIT');
            console.log('💥 Database reset complete');
            
            // Recreate everything
            await this.setupDatabase();
            
            return true;
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('❌ Database reset failed:', error);
            throw error;
        } finally {
            client.release();
        }
    }
}

// Export setup functions
const setupInstance = new DatabaseSetup();

module.exports = {
    DatabaseSetup,
    setupDatabase: () => setupInstance.setupDatabase(),
    checkTablesExist: () => setupInstance.checkTablesExist(),
    healthCheck: () => setupInstance.healthCheck(),
    resetDatabase: () => setupInstance.resetDatabase() // Only for development
};