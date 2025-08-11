/**
 * 🎮 RETRORETRO - EXPRESS APPLICATION SETUP
 * Organisierte Express-App mit allen Features aus Ihrer bestehenden server.js
 */

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

class RetroRetroApp {
    constructor() {
        this.app = express();
        this.connectedUsers = 0;
        this.serverStartTime = Date.now();
        this.activeConnections = new Map();
        this.io = null;
        
        // Database-Status (wird von server.js gesetzt)
        this.databaseReady = false;
        this.userManager = null;
        this.sessionManager = null;
        
        this.setupMiddleware();
        this.setupRoutes();
        this.setupErrorHandling();
    }

    // Database-Manager setzen (von server.js)
    setDatabaseManagers(userManager, sessionManager) {
        this.userManager = userManager;
        this.sessionManager = sessionManager;
        this.databaseReady = true;
        console.log('✅ Database managers attached to app');
    }

    // Socket.IO anhängen
    setSocketIO(io) {
        this.io = io;
        console.log('🔌 Socket.IO attached to Express app');
    }

    // Connection tracking
    updateConnectedUsers(count) {
        this.connectedUsers = count;
    }

    setActiveConnections(connections) {
        this.activeConnections = connections;
    }

    setupMiddleware() {
        // CORS für Frontend-Backend-Kommunikation (Ihre bewährte Config)
        this.app.use(cors({
            origin: ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001"],
            credentials: true,
            methods: ["GET", "POST", "PUT", "DELETE"],
            allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
        }));

        // Body Parsing
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        
        // Logging (Ihre bestehende Config)
        this.app.use(morgan('combined'));

        // Request Logging (erweitert)
        this.app.use((req, res, next) => {
            console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
            next();
        });
    }

    setupRoutes() {
        // =================================================================
        // HEALTH & STATUS ROUTES (aus Ihrer server.js übernommen)
        // =================================================================
        
        this.app.get('/health', (req, res) => {
            const uptime = Math.floor((Date.now() - this.serverStartTime) / 1000);
            
            res.json({
                status: 'OK',
                uptime: uptime,
                version: '1.0.0',
                timestamp: new Date().toISOString(),
                connectedUsers: this.connectedUsers,
                port: process.env.PORT || '3001',
                socketio: 'repaired',
                note: 'Socket.IO fixed for stability'
            });
        });

        this.app.get('/health-db', async (req, res) => {
            try {
                console.log('Testing database connections...');
                
                // Import nur wenn verfügbar
                let testPostgreSQL, testRedis;
                try {
                    const connection = require('./database/connection');
                    testPostgreSQL = connection.testPostgreSQL;
                    testRedis = connection.testRedis;
                } catch (err) {
                    return res.json({
                        status: 'database-check',
                        databases: {
                            postgresql: 'not-configured',
                            redis: 'not-configured'
                        },
                        note: 'Database modules not found'
                    });
                }
                
                const pgHealth = await testPostgreSQL();
                const redisHealth = await testRedis();
                
                res.json({
                    status: 'database-check',
                    databases: {
                        postgresql: pgHealth ? 'connected' : 'disconnected',
                        redis: redisHealth ? 'connected' : 'disconnected'
                    },
                    features: {
                        userManagement: this.databaseReady && this.userManager !== null,
                        sessionManagement: this.databaseReady && this.sessionManager !== null,
                        scoreTracking: this.databaseReady
                    },
                    timestamp: new Date().toISOString()
                });
            } catch (err) {
                res.status(500).json({ 
                    error: 'Database connection error',
                    message: err.message 
                });
            }
        });

        this.app.get('/api/status', (req, res) => {
            res.json({
                server: 'Legal Retro Gaming Service',
                status: 'running',
                users: this.connectedUsers,
                uptime: Math.floor((Date.now() - this.serverStartTime) / 1000),
                database: this.databaseReady,
                socketio: 'stable',
                features: this.databaseReady ? ['multiplayer', 'user-accounts', 'score-tracking'] : ['multiplayer']
            });
        });

        // =================================================================
        // GAMES API (aus Ihrer server.js übernommen und erweitert)
        // =================================================================
        
        this.app.get('/api/games', async (req, res) => {
            try {
                // Database-First approach (wie in Ihrer server.js)
                if (this.databaseReady && this.userManager) {
                    const dbGames = await this.userManager.getGames();
                    if (dbGames && dbGames.length > 0) {
                        return res.json({
                            source: 'database',
                            availableGames: dbGames.map(game => ({
                                id: game.slug,
                                name: game.title,
                                description: game.description,
                                status: 'available',
                                maxPlayers: game.max_players,
                                isMultiplayer: game.is_multiplayer,
                                category: game.category,
                                difficulty: game.difficulty_level
                            }))
                        });
                    }
                }
                
                // Fallback zu statischen Games (Ihre bestehende Liste)
                res.json({
                    source: 'fallback',
                    availableGames: [
                        {
                            id: 'snake',
                            name: 'Snake Game',
                            description: 'Classic Snake game built in React',
                            status: 'available',
                            maxPlayers: 4,
                            isMultiplayer: true
                        },
                        {
                            id: 'memory',
                            name: 'Memory Game', 
                            description: 'Test your memory with cards',
                            status: 'available',
                            maxPlayers: 1,
                            isMultiplayer: false
                        },
                        {
                            id: 'pong',
                            name: 'Pong Demo',
                            description: 'Simple Pong game simulation',
                            status: 'available',
                            maxPlayers: 2,
                            isMultiplayer: true
                        },
                        {
                            id: 'tetris',
                            name: 'Tetris Demo',
                            description: 'Tetris-style block game',
                            status: 'available',
                            maxPlayers: 2,
                            isMultiplayer: true
                        }
                    ]
                });
            } catch (error) {
                console.error('❌ Error fetching games:', error);
                res.status(500).json({ error: 'Failed to fetch games' });
            }
        });

        // =================================================================
        // SESSION & LEADERBOARD API (aus Ihrer server.js)
        // =================================================================
        
        this.app.get('/api/sessions', async (req, res) => {
            if (!this.databaseReady || !this.sessionManager) {
                return res.json({
                    message: 'Session management requires database connection',
                    sessions: []
                });
            }
            
            try {
                const sessions = await this.sessionManager.getActiveSessions();
                res.json({ sessions });
            } catch (error) {
                console.error('❌ Error fetching sessions:', error);
                res.status(500).json({ error: 'Failed to fetch sessions' });
            }
        });

        this.app.get('/api/leaderboard/:gameId?', async (req, res) => {
            if (!this.databaseReady || !this.userManager) {
                return res.json({
                    message: 'Leaderboard requires database connection',
                    leaderboard: []
                });
            }
            
            try {
                const { gameId } = req.params;
                const limit = parseInt(req.query.limit) || 10;
                const leaderboard = await this.userManager.getLeaderboard(gameId, limit);
                res.json({ leaderboard, game: gameId || 'all' });
            } catch (error) {
                console.error('❌ Error fetching leaderboard:', error);
                res.status(500).json({ error: 'Failed to fetch leaderboard' });
            }
        });

        // =================================================================
        // USER MANAGEMENT API (aus Ihrer server.js)
        // =================================================================
        
        this.app.post('/api/register', async (req, res) => {
            if (!this.databaseReady || !this.userManager) {
                return res.status(503).json({
                    error: 'User registration requires database connection'
                });
            }
            
            try {
                const { username, email, password, displayName } = req.body;
                
                if (!username || !email || !password) {
                    return res.status(400).json({
                        error: 'Username, email, and password are required'
                    });
                }

                const user = await this.userManager.createUser({
                    username,
                    email,
                    password,
                    displayName: displayName || username
                });

                res.json({
                    success: true,
                    user: {
                        id: user.id,
                        username: user.username,
                        displayName: user.display_name,
                        membershipTier: user.membership_tier
                    }
                });
            } catch (error) {
                console.error('❌ Registration error:', error);
                res.status(400).json({
                    success: false,
                    error: error.message
                });
            }
        });

        // =================================================================
        // STATIC FRONTEND SERVING
        // =================================================================
        
        const frontendPath = path.join(__dirname, '../../frontend/dist');
        if (require('fs').existsSync(frontendPath)) {
            this.app.use(express.static(frontendPath));
            console.log('📁 Static files served from:', frontendPath);
            
            // SPA Support
            this.app.get('*', (req, res) => {
                res.sendFile(path.join(frontendPath, 'index.html'));
            });
        }
    }

    setupErrorHandling() {
        // Error Handler (aus Ihrer server.js)
        this.app.use((err, req, res, next) => {
            console.error('❌ Express Error:', err);
            res.status(500).json({
                error: 'Internal Server Error',
                message: err.message
            });
        });

        // 404 Handler (aus Ihrer server.js)
        this.app.use('*', (req, res) => {
            res.status(404).json({
                error: 'Route not found',
                path: req.originalUrl
            });
        });
    }

    // Express App zurückgeben
    getApp() {
        return this.app;
    }
}

module.exports = RetroRetroApp;