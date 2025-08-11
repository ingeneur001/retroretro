/**
 * 👤 USER MANAGER - User CRUD operations, Authentication, Scores
 * Extracted from managers.js for better organization
 */

require('dotenv').config();
const bcrypt = require('bcrypt');

class UserManager {
    constructor() {
        // Import connection from parent directory
        const connection = require('../connection');
        this.pool = connection.pgPool || connection.pool;
        this.redis = connection.redisClient;
        
        if (!this.pool) {
            throw new Error('PostgreSQL connection pool not available');
        }
    }

    // =====================================================
    // GAME-RELATED OPERATIONS
    // =====================================================

    /**
     * Get all active games from database
     */
    async getGames() {
        try {
            const query = `
                SELECT id, slug, title, description, category, difficulty_level,
                       max_players, is_multiplayer, required_membership, thumbnail_url
                FROM games 
                WHERE is_active = true 
                ORDER BY category, title
            `;
            
            const result = await this.pool.query(query);
            return result.rows;
        } catch (error) {
            console.error('❌ Error fetching games:', error);
            return []; // Return empty array instead of throwing
        }
    }

    /**
     * Get game by slug
     */
    async getGameBySlug(slug) {
        try {
            const query = `
                SELECT id, slug, title, description, category, max_players, is_multiplayer
                FROM games 
                WHERE slug = $1 AND is_active = true
            `;
            
            const result = await this.pool.query(query, [slug]);
            return result.rows[0] || null;
        } catch (error) {
            console.error('❌ Error fetching game by slug:', error);
            return null;
        }
    }

    // =====================================================
    // USER MANAGEMENT
    // =====================================================

    /**
     * Create new user with secure password hashing
     */
    async createUser({ username, email, password, displayName }) {
        try {
            // Hash password securely
            const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
            const passwordHash = await bcrypt.hash(password, saltRounds);
            
            const query = `
                INSERT INTO users (username, email, password_hash, display_name)
                VALUES ($1, $2, $3, $4)
                RETURNING id, username, email, display_name, membership_tier, created_at
            `;
            
            const result = await this.pool.query(query, [
                username, 
                email, 
                passwordHash, 
                displayName || username
            ]);
            
            return result.rows[0];
        } catch (error) {
            if (error.code === '23505') { // PostgreSQL unique violation
                throw new Error('Username or email already exists');
            }
            console.error('❌ Error creating user:', error);
            throw new Error('Failed to create user account');
        }
    }

    /**
     * Authenticate user with password verification
     */
    async authenticateUser(username, password) {
        try {
            const query = `
                SELECT id, username, email, password_hash, display_name, membership_tier
                FROM users 
                WHERE (username = $1 OR email = $1) AND is_active = true
            `;
            
            const result = await this.pool.query(query, [username]);
            const user = result.rows[0];
            
            if (!user) {
                return null; // User not found
            }

            // Verify password
            const isValidPassword = await bcrypt.compare(password, user.password_hash);
            if (!isValidPassword) {
                return null; // Invalid password
            }

            // Return user data without password hash
            const { password_hash, ...userWithoutPassword } = user;
            return userWithoutPassword;
        } catch (error) {
            console.error('❌ Authentication error:', error);
            return null;
        }
    }

    /**
     * Get user by username or email
     */
    async getUser(identifier) {
        try {
            const query = `
                SELECT id, username, email, display_name, membership_tier, 
                       last_active, created_at, email_verified
                FROM users 
                WHERE (username = $1 OR email = $1) AND is_active = true
            `;
            
            const result = await this.pool.query(query, [identifier]);
            return result.rows[0] || null;
        } catch (error) {
            console.error('❌ Error fetching user:', error);
            return null;
        }
    }

    /**
     * Update user last active timestamp
     */
    async updateLastActive(userId) {
        try {
            const query = 'UPDATE users SET last_active = CURRENT_TIMESTAMP WHERE id = $1';
            await this.pool.query(query, [userId]);
            return true;
        } catch (error) {
            console.error('❌ Error updating last active:', error);
            return false; // Don't throw - this is not critical
        }
    }

    // =====================================================
    // SCORE & LEADERBOARD OPERATIONS
    // =====================================================

    /**
     * Get leaderboard data
     */
    async getLeaderboard(gameSlug = null, limit = 10) {
        try {
            let query;
            let params = [limit];
            
            if (gameSlug) {
                query = `
                    SELECT pb.best_score, pb.best_level, pb.total_games_played, pb.last_played,
                           u.display_name, u.username, g.title as game_title,
                           RANK() OVER (ORDER BY pb.best_score DESC) as rank
                    FROM user_personal_bests pb
                    JOIN users u ON pb.user_id = u.id AND u.is_active = true
                    JOIN games g ON pb.game_id = g.id AND g.is_active = true
                    WHERE g.slug = $2
                    ORDER BY pb.best_score DESC
                    LIMIT $1
                `;
                params = [limit, gameSlug];
            } else {
                query = `
                    SELECT pb.best_score, pb.best_level, pb.total_games_played, pb.last_played,
                           u.display_name, u.username, g.title as game_title, g.slug as game_slug,
                           RANK() OVER (PARTITION BY g.id ORDER BY pb.best_score DESC) as rank
                    FROM user_personal_bests pb
                    JOIN users u ON pb.user_id = u.id AND u.is_active = true
                    JOIN games g ON pb.game_id = g.id AND g.is_active = true
                    ORDER BY g.title, pb.best_score DESC
                    LIMIT $1
                `;
            }
            
            const result = await this.pool.query(query, params);
            return result.rows;
        } catch (error) {
            console.error('❌ Error fetching leaderboard:', error);
            return [];
        }
    }

    /**
     * Save user score with transaction safety
     */
    async saveScore({ userId, sessionId, score, levelReached, timePlayedSeconds, completed }) {
        const client = await this.pool.connect();
        
        try {
            await client.query('BEGIN');
            
            // Insert or update user score
            await client.query(`
                INSERT INTO user_scores (user_id, session_id, score, level_reached, time_played, completed)
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (user_id, session_id) 
                DO UPDATE SET 
                    score = GREATEST(user_scores.score, EXCLUDED.score),
                    level_reached = GREATEST(user_scores.level_reached, EXCLUDED.level_reached),
                    time_played = user_scores.time_played + EXCLUDED.time_played,
                    completed = user_scores.completed OR EXCLUDED.completed,
                    achieved_at = CURRENT_TIMESTAMP
            `, [userId, sessionId, score, levelReached || 1, timePlayedSeconds || 0, completed || false]);

            // Update personal best record
            const gameResult = await client.query(`
                SELECT g.id FROM games g 
                JOIN game_sessions gs ON g.id = gs.game_id 
                WHERE gs.id = $1
            `, [sessionId]);

            if (gameResult.rows[0]) {
                const gameId = gameResult.rows[0].id;
                
                await client.query(`
                    INSERT INTO user_personal_bests (user_id, game_id, best_score, best_level, total_games_played, last_played)
                    VALUES ($1, $2, $3, $4, 1, CURRENT_TIMESTAMP)
                    ON CONFLICT (user_id, game_id)
                    DO UPDATE SET
                        best_score = GREATEST(user_personal_bests.best_score, EXCLUDED.best_score),
                        best_level = GREATEST(user_personal_bests.best_level, EXCLUDED.best_level),
                        total_games_played = user_personal_bests.total_games_played + 1,
                        last_played = CURRENT_TIMESTAMP
                `, [userId, gameId, score, levelReached || 1]);
            }

            await client.query('COMMIT');
            return true;
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('❌ Error saving score:', error);
            throw new Error('Failed to save score');
        } finally {
            client.release();
        }
    }

    /**
     * Get user statistics
     */
    async getUserStats(userId) {
        try {
            const query = `
                SELECT 
                    u.username, u.display_name, u.membership_tier, u.created_at,
                    COUNT(DISTINCT us.game_id) as games_played,
                    COUNT(us.id) as total_sessions,
                    COALESCE(SUM(us.time_played), 0) as total_time_seconds,
                    COALESCE(AVG(us.score), 0) as avg_score,
                    COALESCE(MAX(us.score), 0) as best_score,
                    COUNT(ua.id) as achievements_unlocked
                FROM users u
                LEFT JOIN user_scores us ON u.id = us.user_id
                LEFT JOIN user_achievements ua ON u.id = ua.user_id
                WHERE u.id = $1 AND u.is_active = true
                GROUP BY u.id, u.username, u.display_name, u.membership_tier, u.created_at
            `;
            
            const result = await this.pool.query(query, [userId]);
            return result.rows[0] || null;
        } catch (error) {
            console.error('❌ Error fetching user stats:', error);
            return null;
        }
    }
}

module.exports = UserManager;