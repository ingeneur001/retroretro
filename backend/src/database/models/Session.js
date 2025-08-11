/**
 * 🎮 SESSION MODEL - Game session data structures and validation
 * Handles session state, player management, and game flow
 */

class Session {
    constructor(sessionData = {}) {
        this.id = sessionData.id || null;
        this.gameId = sessionData.game_id || sessionData.gameId || null;
        this.sessionName = sessionData.session_name || sessionData.sessionName || '';
        this.hostUserId = sessionData.host_user_id || sessionData.hostUserId || null;
        this.maxPlayers = sessionData.max_players || sessionData.maxPlayers || 4;
        this.currentPlayers = sessionData.current_players || sessionData.currentPlayers || 0;
        this.sessionStatus = sessionData.session_status || sessionData.sessionStatus || 'waiting';
        this.gameState = sessionData.game_state || sessionData.gameState || {};
        this.settings = sessionData.settings || {};
        this.startedAt = sessionData.started_at || sessionData.startedAt || null;
        this.endedAt = sessionData.ended_at || sessionData.endedAt || null;
        this.createdAt = sessionData.created_at || sessionData.createdAt || null;
        this.updatedAt = sessionData.updated_at || sessionData.updatedAt || null;
        
        // Additional properties from joins
        this.gameTitle = sessionData.game_title || sessionData.gameTitle || '';
        this.gameSlug = sessionData.game_slug || sessionData.gameSlug || '';
        this.hostName = sessionData.host_name || sessionData.hostName || '';
        this.players = sessionData.players || [];
    }

    // =====================================================
    // VALIDATION METHODS
    // =====================================================

    /**
     * Validate session data for creation
     */
    static validateForCreation(sessionData) {
        const errors = [];
        
        // Game ID validation
        if (!sessionData.gameId || typeof sessionData.gameId !== 'number') {
            errors.push('Game ID is required and must be a number');
        }

        // Host User ID validation
        if (!sessionData.hostUserId || typeof sessionData.hostUserId !== 'number') {
            errors.push('Host User ID is required and must be a number');
        }

        // Max players validation
        if (sessionData.maxPlayers !== undefined) {
            if (typeof sessionData.maxPlayers !== 'number' || sessionData.maxPlayers < 1 || sessionData.maxPlayers > 8) {
                errors.push('Max players must be a number between 1 and 8');
            }
        }

        // Session name validation (optional)
        if (sessionData.sessionName !== undefined) {
            if (typeof sessionData.sessionName !== 'string' || sessionData.sessionName.length > 100) {
                errors.push('Session name must be a string under 100 characters');
            }
        }

        // Settings validation (optional)
        if (sessionData.settings !== undefined) {
            if (typeof sessionData.settings !== 'object') {
                errors.push('Settings must be an object');
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Validate game state data
     */
    static validateGameState(gameState) {
        const errors = [];
        
        if (typeof gameState !== 'object' || gameState === null) {
            errors.push('Game state must be an object');
            return { isValid: false, errors };
        }

        // Common game state validation
        if (gameState.score !== undefined) {
            if (typeof gameState.score !== 'number' || gameState.score < 0) {
                errors.push('Score must be a non-negative number');
            }
        }

        if (gameState.level !== undefined) {
            if (typeof gameState.level !== 'number' || gameState.level < 1) {
                errors.push('Level must be a positive number');
            }
        }

        if (gameState.timeElapsed !== undefined) {
            if (typeof gameState.timeElapsed !== 'number' || gameState.timeElapsed < 0) {
                errors.push('Time elapsed must be a non-negative number');
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Validate session settings
     */
    static validateSettings(settings) {
        const errors = [];
        
        if (typeof settings !== 'object' || settings === null) {
            return { isValid: true, errors: [] }; // Settings are optional
        }

        // Difficulty validation
        if (settings.difficulty !== undefined) {
            const validDifficulties = ['easy', 'medium', 'hard', 'expert'];
            if (!validDifficulties.includes(settings.difficulty)) {
                errors.push(`Difficulty must be one of: ${validDifficulties.join(', ')}`);
            }
        }

        // Time limit validation
        if (settings.timeLimit !== undefined) {
            if (typeof settings.timeLimit !== 'number' || settings.timeLimit < 30 || settings.timeLimit > 3600) {
                errors.push('Time limit must be between 30 and 3600 seconds');
            }
        }

        // Private session validation
        if (settings.isPrivate !== undefined) {
            if (typeof settings.isPrivate !== 'boolean') {
                errors.push('Private setting must be a boolean');
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // =====================================================
    // STATUS CHECKING METHODS
    // =====================================================

    /**
     * Check if session is joinable
     */
    isJoinable() {
        return this.sessionStatus === 'waiting' && this.currentPlayers < this.maxPlayers;
    }

    /**
     * Check if session is active (game in progress)
     */
    isActive() {
        return this.sessionStatus === 'active';
    }

    /**
     * Check if session is finished
     */
    isFinished() {
        return this.sessionStatus === 'finished';
    }

    /**
     * Check if session is full
     */
    isFull() {
        return this.currentPlayers >= this.maxPlayers;
    }

    /**
     * Check if user is host
     */
    isHost(userId) {
        return this.hostUserId === userId;
    }

    /**
     * Check if user is in session
     */
    hasPlayer(userId) {
        return this.players.some(player => player.userId === userId && player.isActive);
    }

    // =====================================================
    // UTILITY METHODS
    // =====================================================

    /**
     * Get session duration in seconds
     */
    getDuration() {
        if (!this.startedAt) return 0;
        
        const endTime = this.endedAt ? new Date(this.endedAt) : new Date();
        const startTime = new Date(this.startedAt);
        
        return Math.floor((endTime - startTime) / 1000);
    }

    /**
     * Get formatted duration (human readable)
     */
    getFormattedDuration() {
        const seconds = this.getDuration();
        
        if (seconds < 60) {
            return `${seconds}s`;
        } else if (seconds < 3600) {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
        } else {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
        }
    }

    /**
     * Get active players list
     */
    getActivePlayers() {
        return this.players.filter(player => player.isActive);
    }

    /**
     * Get player by user ID
     */
    getPlayer(userId) {
        return this.players.find(player => player.userId === userId);
    }

    /**
     * Convert to safe JSON for API responses
     */
    toSafeJSON() {
        return {
            id: this.id,
            gameId: this.gameId,
            gameTitle: this.gameTitle,
            gameSlug: this.gameSlug,
            sessionName: this.sessionName,
            hostUserId: this.hostUserId,
            hostName: this.hostName,
            maxPlayers: this.maxPlayers,
            currentPlayers: this.currentPlayers,
            sessionStatus: this.sessionStatus,
            settings: this.settings,
            startedAt: this.startedAt,
            endedAt: this.endedAt,
            createdAt: this.createdAt,
            duration: this.getFormattedDuration(),
            isJoinable: this.isJoinable(),
            isActive: this.isActive(),
            players: this.getActivePlayers().map(player => ({
                userId: player.userId,
                username: player.username,
                displayName: player.displayName,
                playerNumber: player.playerNumber,
                joinedAt: player.joinedAt
            }))
            // Note: gameState is excluded from public JSON for security
        };
    }

    /**
     * Convert to full JSON (for host/admin)
     */
    toFullJSON() {
        return {
            ...this.toSafeJSON(),
            gameState: this.gameState,
            players: this.players // Include all player data
        };
    }

    // =====================================================
    // STATIC UTILITY METHODS
    // =====================================================

    /**
     * Create Session instance from database row
     */
    static fromDatabaseRow(row) {
        return new Session(row);
    }

    /**
     * Create multiple Session instances from database rows
     */
    static fromDatabaseRows(rows) {
        return rows.map(row => Session.fromDatabaseRow(row));
    }

    /**
     * Generate session name
     */
    static generateSessionName(gameTitle, hostName) {
        const timestamp = new Date().toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        return `${hostName}'s ${gameTitle} (${timestamp})`;
    }

    /**
     * Get valid session statuses
     */
    static getValidStatuses() {
        return ['waiting', 'active', 'paused', 'finished'];
    }

    /**
     * Check if status transition is valid
     */
    static isValidStatusTransition(fromStatus, toStatus) {
        const validTransitions = {
            'waiting': ['active', 'finished'],
            'active': ['paused', 'finished'],
            'paused': ['active', 'finished'],
            'finished': [] // No transitions from finished
        };
        
        return validTransitions[fromStatus]?.includes(toStatus) || false;
    }

    /**
     * Get session status color for UI
     */
    static getStatusColor(status) {
        const colors = {
            'waiting': '#fbbf24',    // Yellow - waiting for players
            'active': '#10b981',     // Green - game in progress
            'paused': '#f59e0b',     // Orange - game paused
            'finished': '#6b7280'    // Gray - game finished
        };
        
        return colors[status] || '#6b7280';
    }

    /**
     * Get session status emoji
     */
    static getStatusEmoji(status) {
        const emojis = {
            'waiting': '⏳',
            'active': '🎮',
            'paused': '⏸️',
            'finished': '🏁'
        };
        
        return emojis[status] || '❓';
    }
}

module.exports = Session;