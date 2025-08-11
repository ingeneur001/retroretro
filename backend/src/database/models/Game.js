/**
 * 🎮 GAME MODEL - Game definitions, validation, and metadata
 * Handles game data structure, settings validation, and business rules
 */

class Game {
    constructor(gameData = {}) {
        this.id = gameData.id || null;
        this.slug = gameData.slug || '';
        this.title = gameData.title || '';
        this.description = gameData.description || '';
        this.category = gameData.category || 'arcade';
        this.difficultyLevel = gameData.difficulty_level || gameData.difficultyLevel || 1;
        this.maxPlayers = gameData.max_players || gameData.maxPlayers || 1;
        this.minPlayers = gameData.min_players || gameData.minPlayers || 1;
        this.estimatedDuration = gameData.estimated_duration || gameData.estimatedDuration || null;
        this.thumbnailUrl = gameData.thumbnail_url || gameData.thumbnailUrl || null;
        this.gameData = gameData.game_data || gameData.gameData || {};
        this.requiredMembership = gameData.required_membership || gameData.requiredMembership || 'free';
        this.isMultiplayer = gameData.is_multiplayer !== undefined ? gameData.is_multiplayer : gameData.isMultiplayer !== undefined ? gameData.isMultiplayer : false;
        this.isActive = gameData.is_active !== undefined ? gameData.is_active : gameData.isActive !== undefined ? gameData.isActive : true;
        this.createdAt = gameData.created_at || gameData.createdAt || null;
        this.updatedAt = gameData.updated_at || gameData.updatedAt || null;
    }

    // =====================================================
    // VALIDATION METHODS
    // =====================================================

    /**
     * Validate game data for creation
     */
    static validateForCreation(gameData) {
        const errors = [];
        
        // Slug validation (required, unique identifier)
        if (!gameData.slug || typeof gameData.slug !== 'string') {
            errors.push('Game slug is required');
        } else if (gameData.slug.length < 2 || gameData.slug.length > 100) {
            errors.push('Game slug must be 2-100 characters long');
        } else if (!/^[a-z0-9_-]+$/.test(gameData.slug)) {
            errors.push('Game slug can only contain lowercase letters, numbers, underscores, and hyphens');
        }

        // Title validation
        if (!gameData.title || typeof gameData.title !== 'string') {
            errors.push('Game title is required');
        } else if (gameData.title.length < 2 || gameData.title.length > 200) {
            errors.push('Game title must be 2-200 characters long');
        }

        // Category validation
        if (gameData.category !== undefined) {
            const validCategories = ['arcade', 'puzzle', 'strategy', 'action', 'adventure', 'simulation', 'sports', 'racing'];
            if (!validCategories.includes(gameData.category)) {
                errors.push(`Category must be one of: ${validCategories.join(', ')}`);
            }
        }

        // Difficulty level validation
        if (gameData.difficultyLevel !== undefined) {
            if (typeof gameData.difficultyLevel !== 'number' || gameData.difficultyLevel < 1 || gameData.difficultyLevel > 5) {
                errors.push('Difficulty level must be a number between 1 and 5');
            }
        }

        // Player count validation
        if (gameData.maxPlayers !== undefined) {
            if (typeof gameData.maxPlayers !== 'number' || gameData.maxPlayers < 1 || gameData.maxPlayers > 8) {
                errors.push('Max players must be a number between 1 and 8');
            }
        }

        if (gameData.minPlayers !== undefined) {
            if (typeof gameData.minPlayers !== 'number' || gameData.minPlayers < 1) {
                errors.push('Min players must be at least 1');
            }
        }

        // Cross-validation: minPlayers <= maxPlayers
        if (gameData.minPlayers && gameData.maxPlayers) {
            if (gameData.minPlayers > gameData.maxPlayers) {
                errors.push('Min players cannot be greater than max players');
            }
        }

        // Membership requirement validation
        if (gameData.requiredMembership !== undefined) {
            const validMemberships = ['free', 'premium', 'vip'];
            if (!validMemberships.includes(gameData.requiredMembership)) {
                errors.push(`Required membership must be one of: ${validMemberships.join(', ')}`);
            }
        }

        // Duration validation (in seconds)
        if (gameData.estimatedDuration !== undefined) {
            if (typeof gameData.estimatedDuration !== 'number' || gameData.estimatedDuration < 30 || gameData.estimatedDuration > 7200) {
                errors.push('Estimated duration must be between 30 seconds and 2 hours');
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Validate game configuration data
     */
    static validateGameData(gameData) {
        const errors = [];
        
        if (typeof gameData !== 'object' || gameData === null) {
            return { isValid: true, errors: [] }; // Game data is optional
        }

        // Common game configuration validation
        if (gameData.controls !== undefined) {
            if (typeof gameData.controls !== 'object') {
                errors.push('Game controls must be an object');
            }
        }

        if (gameData.scoring !== undefined) {
            if (typeof gameData.scoring !== 'object') {
                errors.push('Game scoring configuration must be an object');
            }
        }

        if (gameData.physics !== undefined) {
            if (typeof gameData.physics !== 'object') {
                errors.push('Game physics configuration must be an object');
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // =====================================================
    // BUSINESS LOGIC METHODS
    // =====================================================

    /**
     * Check if user can play this game
     */
    canUserPlay(user) {
        // Check membership requirement
        if (!user.hasRequiredMembership(this.requiredMembership)) {
            return {
                canPlay: false,
                reason: `${this.requiredMembership} membership required`
            };
        }

        // Check if game is active
        if (!this.isActive) {
            return {
                canPlay: false,
                reason: 'Game is currently unavailable'
            };
        }

        return {
            canPlay: true,
            reason: null
        };
    }

    /**
     * Get default session settings for this game
     */
    getDefaultSessionSettings() {
        const baseSettings = {
            difficulty: this.getDifficultyName(),
            timeLimit: this.estimatedDuration || 600, // 10 minutes default
            isPrivate: false,
            allowSpectators: true
        };

        // Game-specific default settings
        switch (this.slug) {
            case 'snake':
                return {
                    ...baseSettings,
                    startingSpeed: 150,
                    speedIncrease: 10,
                    powerUpsEnabled: true
                };
                
            case 'tetris':
                return {
                    ...baseSettings,
                    startingLevel: 1,
                    linesClearGoal: 40,
                    nextPiecePreview: true
                };
                
            case 'pong':
                return {
                    ...baseSettings,
                    ballSpeed: 5,
                    paddleSpeed: 8,
                    scoreLimit: 11
                };
                
            case 'memory':
                return {
                    ...baseSettings,
                    gridSize: 4,
                    showTime: 1000,
                    maxAttempts: null
                };
                
            default:
                return baseSettings;
        }
    }

    /**
     * Get difficulty name from level
     */
    getDifficultyName() {
        const difficulties = {
            1: 'easy',
            2: 'medium', 
            3: 'hard',
            4: 'expert',
            5: 'insane'
        };
        
        return difficulties[this.difficultyLevel] || 'medium';
    }

    /**
     * Get estimated duration formatted
     */
    getFormattedDuration() {
        if (!this.estimatedDuration) return 'Variable';
        
        const minutes = Math.floor(this.estimatedDuration / 60);
        const seconds = this.estimatedDuration % 60;
        
        if (minutes === 0) {
            return `${seconds}s`;
        } else if (seconds === 0) {
            return `${minutes}m`;
        } else {
            return `${minutes}m ${seconds}s`;
        }
    }

    // =====================================================
    // UTILITY METHODS
    // =====================================================

    /**
     * Convert to safe JSON for API responses
     */
    toSafeJSON() {
        return {
            id: this.id,
            slug: this.slug,
            title: this.title,
            description: this.description,
            category: this.category,
            difficulty: {
                level: this.difficultyLevel,
                name: this.getDifficultyName()
            },
            players: {
                min: this.minPlayers,
                max: this.maxPlayers
            },
            estimatedDuration: this.estimatedDuration,
            formattedDuration: this.getFormattedDuration(),
            thumbnailUrl: this.thumbnailUrl,
            requiredMembership: this.requiredMembership,
            isMultiplayer: this.isMultiplayer,
            isActive: this.isActive,
            defaultSettings: this.getDefaultSessionSettings()
            // Note: gameData is excluded from public JSON for security
        };
    }

    /**
     * Convert to full JSON (for admin/development)
     */
    toFullJSON() {
        return {
            ...this.toSafeJSON(),
            gameData: this.gameData,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    // =====================================================
    // STATIC UTILITY METHODS
    // =====================================================

    /**
     * Create Game instance from database row
     */
    static fromDatabaseRow(row) {
        return new Game(row);
    }

    /**
     * Create multiple Game instances from database rows
     */
    static fromDatabaseRows(rows) {
        return rows.map(row => Game.fromDatabaseRow(row));
    }

    /**
     * Get valid categories
     */
    static getValidCategories() {
        return ['arcade', 'puzzle', 'strategy', 'action', 'adventure', 'simulation', 'sports', 'racing'];
    }

    /**
     * Get category emoji
     */
    static getCategoryEmoji(category) {
        const emojis = {
            'arcade': '🕹️',
            'puzzle': '🧩',
            'strategy': '♟️',
            'action': '⚡',
            'adventure': '🗺️',
            'simulation': '🏗️',
            'sports': '⚽',
            'racing': '🏎️'
        };
        
        return emojis[category] || '🎮';
    }

    /**
     * Generate game slug from title
     */
    static generateSlug(title) {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')  // Remove special chars
            .replace(/\s+/g, '-')          // Replace spaces with hyphens
            .replace(/-+/g, '-')           // Remove multiple hyphens
            .trim();
    }

    /**
     * Validate slug format
     */
    static isValidSlug(slug) {
        return typeof slug === 'string' && 
               slug.length >= 2 && 
               slug.length <= 100 && 
               /^[a-z0-9_-]+$/.test(slug);
    }
}

module.exports = Game;