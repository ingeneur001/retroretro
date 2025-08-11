/**
 * 👤 USER MODEL - Data validation and schema definitions
 * Handles user data structure, validation, and business rules
 */

class User {
    constructor(userData = {}) {
        this.id = userData.id || null;
        this.username = userData.username || '';
        this.email = userData.email || '';
        this.displayName = userData.display_name || userData.displayName || '';
        this.avatarUrl = userData.avatar_url || userData.avatarUrl || null;
        this.membershipTier = userData.membership_tier || userData.membershipTier || 'free';
        this.languagePreference = userData.language_preference || userData.languagePreference || 'en';
        this.totalPlaytime = userData.total_playtime || userData.totalPlaytime || 0;
        this.lastActive = userData.last_active || userData.lastActive || null;
        this.createdAt = userData.created_at || userData.createdAt || null;
        this.updatedAt = userData.updated_at || userData.updatedAt || null;
        this.isActive = userData.is_active !== undefined ? userData.is_active : userData.isActive !== undefined ? userData.isActive : true;
        this.emailVerified = userData.email_verified !== undefined ? userData.email_verified : userData.emailVerified !== undefined ? userData.emailVerified : false;
    }

    // =====================================================
    // VALIDATION METHODS
    // =====================================================

    /**
     * Validate user data for creation
     */
    static validateForCreation(userData) {
        const errors = [];
        
        // Username validation
        if (!userData.username || typeof userData.username !== 'string') {
            errors.push('Username is required');
        } else if (userData.username.length < 3) {
            errors.push('Username must be at least 3 characters long');
        } else if (userData.username.length > 50) {
            errors.push('Username must be less than 50 characters');
        } else if (!/^[a-zA-Z0-9_-]+$/.test(userData.username)) {
            errors.push('Username can only contain letters, numbers, underscores, and hyphens');
        }

        // Email validation
        if (!userData.email || typeof userData.email !== 'string') {
            errors.push('Email is required');
        } else if (userData.email.length > 255) {
            errors.push('Email must be less than 255 characters');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
            errors.push('Email format is invalid');
        }

        // Password validation
        if (!userData.password || typeof userData.password !== 'string') {
            errors.push('Password is required');
        } else if (userData.password.length < 8) {
            errors.push('Password must be at least 8 characters long');
        } else if (userData.password.length > 128) {
            errors.push('Password must be less than 128 characters');
        }

        // Display name validation (optional)
        if (userData.displayName) {
            if (typeof userData.displayName !== 'string') {
                errors.push('Display name must be a string');
            } else if (userData.displayName.length > 100) {
                errors.push('Display name must be less than 100 characters');
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Validate user data for updates
     */
    static validateForUpdate(userData) {
        const errors = [];
        
        // Only validate provided fields
        if (userData.username !== undefined) {
            if (typeof userData.username !== 'string' || userData.username.length < 3 || userData.username.length > 50) {
                errors.push('Username must be 3-50 characters long');
            } else if (!/^[a-zA-Z0-9_-]+$/.test(userData.username)) {
                errors.push('Username can only contain letters, numbers, underscores, and hyphens');
            }
        }

        if (userData.email !== undefined) {
            if (typeof userData.email !== 'string' || userData.email.length > 255) {
                errors.push('Email must be a valid string under 255 characters');
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
                errors.push('Email format is invalid');
            }
        }

        if (userData.displayName !== undefined) {
            if (typeof userData.displayName !== 'string' || userData.displayName.length > 100) {
                errors.push('Display name must be a string under 100 characters');
            }
        }

        if (userData.membershipTier !== undefined) {
            const validTiers = ['free', 'premium', 'vip'];
            if (!validTiers.includes(userData.membershipTier)) {
                errors.push(`Membership tier must be one of: ${validTiers.join(', ')}`);
            }
        }

        if (userData.languagePreference !== undefined) {
            const validLanguages = ['en', 'de', 'fr', 'es', 'it'];
            if (!validLanguages.includes(userData.languagePreference)) {
                errors.push(`Language preference must be one of: ${validLanguages.join(', ')}`);
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // =====================================================
    // UTILITY METHODS
    // =====================================================

    /**
     * Convert to safe JSON (without sensitive data)
     */
    toSafeJSON() {
        return {
            id: this.id,
            username: this.username,
            email: this.email,
            displayName: this.displayName,
            avatarUrl: this.avatarUrl,
            membershipTier: this.membershipTier,
            languagePreference: this.languagePreference,
            totalPlaytime: this.totalPlaytime,
            lastActive: this.lastActive,
            createdAt: this.createdAt,
            emailVerified: this.emailVerified
            // Note: password_hash is never included in JSON output
        };
    }

    /**
     * Convert to public profile (minimal data for other users)
     */
    toPublicProfile() {
        return {
            id: this.id,
            username: this.username,
            displayName: this.displayName,
            avatarUrl: this.avatarUrl,
            membershipTier: this.membershipTier,
            totalPlaytime: this.totalPlaytime,
            lastActive: this.lastActive
            // Note: email and other private data excluded
        };
    }

    /**
     * Check if user has required membership tier
     */
    hasRequiredMembership(requiredTier) {
        const tierLevels = {
            'free': 0,
            'premium': 1,
            'vip': 2
        };
        
        const userLevel = tierLevels[this.membershipTier] || 0;
        const requiredLevel = tierLevels[requiredTier] || 0;
        
        return userLevel >= requiredLevel;
    }

    /**
     * Get formatted playtime (human readable)
     */
    getFormattedPlaytime() {
        const seconds = this.totalPlaytime;
        
        if (seconds < 60) {
            return `${seconds}s`;
        } else if (seconds < 3600) {
            const minutes = Math.floor(seconds / 60);
            return `${minutes}m`;
        } else {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
        }
    }

    /**
     * Check if user is recently active (within last 24 hours)
     */
    isRecentlyActive() {
        if (!this.lastActive) return false;
        
        const now = new Date();
        const lastActive = new Date(this.lastActive);
        const hoursDiff = (now - lastActive) / (1000 * 60 * 60);
        
        return hoursDiff <= 24;
    }

    // =====================================================
    // STATIC UTILITY METHODS
    // =====================================================

    /**
     * Create User instance from database row
     */
    static fromDatabaseRow(row) {
        return new User(row);
    }

    /**
     * Create multiple User instances from database rows
     */
    static fromDatabaseRows(rows) {
        return rows.map(row => User.fromDatabaseRow(row));
    }

    /**
     * Sanitize username (remove special characters, convert to lowercase)
     */
    static sanitizeUsername(username) {
        if (typeof username !== 'string') return '';
        
        return username
            .toLowerCase()
            .replace(/[^a-z0-9_-]/g, '')
            .substring(0, 50);
    }

    /**
     * Generate random username suggestion
     */
    static generateUsernameSuggestion(baseName = 'gamer') {
        const sanitized = User.sanitizeUsername(baseName);
        const randomSuffix = Math.floor(Math.random() * 10000);
        return `${sanitized}${randomSuffix}`;
    }

    /**
     * Check password strength
     */
    static checkPasswordStrength(password) {
        const score = {
            length: password.length >= 8,
            hasLower: /[a-z]/.test(password),
            hasUpper: /[A-Z]/.test(password),
            hasNumber: /\d/.test(password),
            hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };
        
        const strength = Object.values(score).filter(Boolean).length;
        
        return {
            score: strength,
            strength: strength <= 2 ? 'weak' : strength <= 4 ? 'medium' : 'strong',
            requirements: score,
            isAcceptable: strength >= 3
        };
    }
}

module.exports = User;