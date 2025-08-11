/**
 * 🎮 GAME SESSION MANAGER - Multiplayer session handling
 * Extracted from managers.js for better organization
 */

class GameSessionManager {
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
    // SESSION CREATION & MANAGEMENT
    // =====================================================

    /**
     * Create new game session
     */
    async createSession(gameId, hostUserId, settings = {}) {
        try {
            const query = `
                INSERT INTO game_sessions (game_id, host_user_id, settings, session_status)
                VALUES ($1, $2, $3, 'waiting')
                RETURNING id, session_name, max_players, created_at
            `;
            
            const result = await this.pool.query(query, [
                gameId, 
                hostUserId, 
                JSON.stringify(settings)
            ]);
            
            console.log(`🎮 Session created: ${result.rows[0].id} for game ${gameId}`);
            return result.rows[0];
        } catch (error) {
            console.error('❌ Error creating session:', error);
            throw new Error('Failed to create game session');
        }
    }

    /**
     * Join existing game session
     */
    async joinSession(sessionId, userId, socketId) {
        const client = await this.pool.connect();
        
        try {
            await client.query('BEGIN');
            
            // Check session availability
            const sessionCheck = await client.query(`
                SELECT current_players, max_players, session_status 
                FROM game_sessions 
                WHERE id = $1
            `, [sessionId]);
            
            if (!sessionCheck.rows[0]) {
                throw new Error('Session not found');
            }
            
            const { current_players, max_players, session_status } = sessionCheck.rows[0];
            
            if (session_status !== 'waiting' && session_status !== 'active') {
                throw new Error('Session is not available');
            }
            
            if (current_players >= max_players) {
                throw new Error('Session is full');
            }

            // Check if user already in session (reconnection)
            const existingPlayer = await client.query(`
                SELECT player_number FROM session_players 
                WHERE session_id = $1 AND user_id = $2 AND is_active = true
            `, [sessionId, userId]);

            if (existingPlayer.rows[0]) {
                // Update socket ID for reconnection
                await client.query(`
                    UPDATE session_players 
                    SET socket_id = $3, joined_at = CURRENT_TIMESTAMP 
                    WHERE session_id = $1 AND user_id = $2
                `, [sessionId, userId, socketId]);
                
                await client.query('COMMIT');
                console.log(`🔄 User ${userId} reconnected to session ${sessionId}`);
                return { 
                    playerNumber: existingPlayer.rows[0].player_number, 
                    reconnected: true 
                };
            }

            // Add new player
            const playerNumber = current_players + 1;
            await client.query(`
                INSERT INTO session_players (session_id, user_id, socket_id, player_number) 
                VALUES ($1, $2, $3, $4)
            `, [sessionId, userId, socketId, playerNumber]);

            // Update session player count
            await client.query(`
                UPDATE game_sessions 
                SET current_players = current_players + 1 
                WHERE id = $1
            `, [sessionId]);

            await client.query('COMMIT');
            console.log(`👤 User ${userId} joined session ${sessionId} as player ${playerNumber}`);
            return { playerNumber, reconnected: false };
            
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('❌ Error joining session:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    // =====================================================
    // GAME STATE MANAGEMENT
    // =====================================================

    /**
     * Update game state for session
     */
    async updateGameState(sessionId, gameState) {
        try {
            const query = `
                UPDATE game_sessions 
                SET game_state = $2, updated_at = CURRENT_TIMESTAMP 
                WHERE id = $1
            `;
            
            await this.pool.query(query, [sessionId, JSON.stringify(gameState)]);
            
            // Cache in Redis if available
            if (this.redis && this.redis.isOpen) {
                try {
                    await this.redis.setEx(
                        `session:${sessionId}:state`, 
                        1800, // 30 minutes
                        JSON.stringify(gameState)
                    );
                } catch (redisError) {
                    console.warn('⚠️ Redis cache update failed:', redisError.message);
                }
            }
            
            return true;
        } catch (error) {
            console.error('❌ Error updating game state:', error);
            return false;
        }
    }

    /**
     * Get game state from cache or database
     */
    async getGameState(sessionId) {
        try {
            // Try Redis cache first
            if (this.redis && this.redis.isOpen) {
                try {
                    const cachedState = await this.redis.get(`session:${sessionId}:state`);
                    if (cachedState) {
                        return JSON.parse(cachedState);
                    }
                } catch (redisError) {
                    console.warn('⚠️ Redis cache read failed:', redisError.message);
                }
            }
            
            // Fallback to database
            const query = `
                SELECT game_state 
                FROM game_sessions 
                WHERE id = $1
            `;
            
            const result = await this.pool.query(query, [sessionId]);
            return result.rows[0]?.game_state || null;
        } catch (error) {
            console.error('❌ Error fetching game state:', error);
            return null;
        }
    }

    // =====================================================
    // SESSION QUERIES
    // =====================================================

    /**
     * Get active sessions
     */
    async getActiveSessions(gameSlug = null) {
        try {
            let query;
            let params = [];
            
            if (gameSlug) {
                query = `
                    SELECT gs.id, gs.session_name, g.title as game_title, g.slug as game_slug,
                           u.display_name as host_name, gs.current_players, gs.max_players,
                           gs.session_status, gs.created_at
                    FROM game_sessions gs
                    JOIN games g ON gs.game_id = g.id AND g.is_active = true
                    JOIN users u ON gs.host_user_id = u.id AND u.is_active = true
                    WHERE gs.session_status IN ('waiting', 'active') AND g.slug = $1
                    ORDER BY gs.created_at DESC
                `;
                params = [gameSlug];
            } else {
                query = `
                    SELECT gs.id, gs.session_name, g.title as game_title, g.slug as game_slug,
                           u.display_name as host_name, gs.current_players, gs.max_players,
                           gs.session_status, gs.created_at
                    FROM game_sessions gs
                    JOIN games g ON gs.game_id = g.id AND g.is_active = true
                    JOIN users u ON gs.host_user_id = u.id AND u.is_active = true
                    WHERE gs.session_status IN ('waiting', 'active')
                    ORDER BY gs.created_at DESC
                `;
            }
            
            const result = await this.pool.query(query, params);
            return result.rows;
        } catch (error) {
            console.error('❌ Error fetching active sessions:', error);
            return [];
        }
    }

    /**
     * Get session details with players
     */
    async getSessionDetails(sessionId) {
        try {
            const query = `
                SELECT gs.*, g.title as game_title, g.slug as game_slug,
                       json_agg(
                           json_build_object(
                               'userId', sp.user_id,
                               'username', u.username,
                               'displayName', u.display_name,
                               'playerNumber', sp.player_number,
                               'isActive', sp.is_active,
                               'joinedAt', sp.joined_at
                           )
                       ) as players
                FROM game_sessions gs
                JOIN games g ON gs.game_id = g.id
                LEFT JOIN session_players sp ON gs.id = sp.session_id AND sp.is_active = true
                LEFT JOIN users u ON sp.user_id = u.id
                WHERE gs.id = $1
                GROUP BY gs.id, g.title, g.slug
            `;
            
            const result = await this.pool.query(query, [sessionId]);
            return result.rows[0] || null;
        } catch (error) {
            console.error('❌ Error fetching session details:', error);
            return null;
        }
    }

    // =====================================================
    // DISCONNECT & CLEANUP
    // =====================================================

    /**
     * Handle player disconnect
     */
    async handlePlayerDisconnect(sessionId, userId) {
        const client = await this.pool.connect();
        
        try {
            await client.query('BEGIN');
            
            // Mark player as left
            await client.query(`
                UPDATE session_players 
                SET left_at = CURRENT_TIMESTAMP, is_active = false 
                WHERE session_id = $1 AND user_id = $2 AND is_active = true
            `, [sessionId, userId]);

            // Update session player count
            await client.query(`
                UPDATE game_sessions 
                SET current_players = current_players - 1 
                WHERE id = $1 AND current_players > 0
            `, [sessionId]);

            // Check if session should be closed (no active players)
            const activePlayersResult = await client.query(`
                SELECT COUNT(*) as active_count 
                FROM session_players 
                WHERE session_id = $1 AND is_active = true
            `, [sessionId]);

            const activeCount = parseInt(activePlayersResult.rows[0].active_count);
            if (activeCount === 0) {
                await client.query(`
                    UPDATE game_sessions 
                    SET session_status = 'finished', ended_at = CURRENT_TIMESTAMP 
                    WHERE id = $1
                `, [sessionId]);
                
                console.log(`🏁 Session ${sessionId} finished - no active players`);
            }

            await client.query('COMMIT');
            console.log(`👋 User ${userId} left session ${sessionId}`);
            return true;
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('❌ Error handling player disconnect:', error);
            return false;
        } finally {
            client.release();
        }
    }

    /**
     * Close session manually
     */
    async closeSession(sessionId, reason = 'manual') {
        try {
            const query = `
                UPDATE game_sessions 
                SET session_status = 'finished', ended_at = CURRENT_TIMESTAMP
                WHERE id = $1 AND session_status IN ('waiting', 'active', 'paused')
            `;
            
            const result = await this.pool.query(query, [sessionId]);
            
            if (result.rowCount > 0) {
                console.log(`🏁 Session ${sessionId} closed (${reason})`);
                
                // Clear Redis cache
                if (this.redis && this.redis.isOpen) {
                    try {
                        await this.redis.del(`session:${sessionId}:state`);
                    } catch (redisError) {
                        console.warn('⚠️ Redis cache cleanup failed:', redisError.message);
                    }
                }
                
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('❌ Error closing session:', error);
            return false;
        }
    }
}

module.exports = GameSessionManager;