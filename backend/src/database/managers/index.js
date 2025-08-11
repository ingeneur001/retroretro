/**
 * 📋 DATABASE MANAGERS INDEX - Export Hub
 * Provides backwards compatibility with existing server.js imports
 */

const UserManager = require('./UserManager');
const GameSessionManager = require('./GameSessionManager');

// Export both managers for backwards compatibility
module.exports = {
    UserManager,
    GameSessionManager
};