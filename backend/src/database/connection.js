/**
 * 🗄️ RETRORETRO - DATABASE CONNECTIONS
 * Optimierte PostgreSQL + Redis Verbindungen mit Enhanced Error Handling
 */

require('dotenv').config();
const { Pool } = require('pg');
const redis = require('redis');

// =================================================================
// POSTGRESQL CONNECTION POOL
// =================================================================

const pgPool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'retro_gaming',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    
    // Connection Pool Settings (Ihre bewährte Config)
    max: 20,                        // Max connections
    idleTimeoutMillis: 30000,       // 30s idle timeout
    connectionTimeoutMillis: 2000,  // 2s connection timeout
    
    // Zusätzliche Optimierungen
    allowExitOnIdle: true,          // Allows process to exit when idle
    application_name: 'retroretro_gaming'
});

// PostgreSQL Pool Event Handlers
pgPool.on('connect', (client) => {
    console.log('🔌 New PostgreSQL client connected');
});

pgPool.on('error', (err, client) => {
    console.error('❌ PostgreSQL pool error:', err.message);
});

pgPool.on('acquire', (client) => {
    // Silent - nur für Debugging
    // console.log('📍 PostgreSQL client acquired');
});

pgPool.on('release', (err, client) => {
    if (err) {
        console.error('❌ PostgreSQL client release error:', err.message);
    }
    // Silent - nur für Debugging
    // console.log('📍 PostgreSQL client released');
});

// =================================================================
// REDIS CLIENT
// =================================================================

const redisClient = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    
    // Redis-spezifische Einstellungen
    socket: {
        connectTimeout: 5000,       // 5s connection timeout
        lazyConnect: true,          // Connect nur wenn benötigt
        reconnectDelay: 1000        // 1s reconnect delay
    },
    
    // Error Handling
    legacyMode: false
});

// Redis Event Handlers
redisClient.on('connect', () => {
    console.log('🔌 Redis connecting...');
});

redisClient.on('ready', () => {
    console.log('✅ Redis client ready');
});

redisClient.on('error', (err) => {
    console.error('❌ Redis error:', err.message);
});

redisClient.on('end', () => {
    console.log('🔌 Redis connection ended');
});

// =================================================================
// CONNECTION TEST FUNCTIONS (Ihre bewährten, aber optimiert)
// =================================================================

const testPostgreSQL = async () => {
    try {
        const client = await pgPool.connect();
        try {
            const result = await client.query(
                'SELECT NOW() as current_time, $1 as status, version() as pg_version',
                ['PostgreSQL Connected!']
            );
            
            console.log('✅ PostgreSQL connected:', {
                status: result.rows[0].status,
                version: result.rows[0].pg_version.split(' ')[0] + ' ' + result.rows[0].pg_version.split(' ')[1],
                timestamp: result.rows[0].current_time
            });
            
            return true;
        } finally {
            client.release(); // Wichtig: Client immer freigeben
        }
    } catch (err) {
        console.error('❌ PostgreSQL connection failed:', err.message);
        return false;
    }
};

const testRedis = async () => {
    try {
        // Lazy connection - verbindet nur wenn nötig
        if (!redisClient.isOpen) {
            await redisClient.connect();
        }
        
        // Extended ping test
        const pong = await redisClient.ping();
        const redisInfo = await redisClient.info('server');
        const redisVersion = redisInfo.split('\n')
            .find(line => line.startsWith('redis_version:'))
            ?.split(':')[1]?.trim();
        
        console.log('✅ Redis connected:', {
            ping: pong,
            version: redisVersion || 'unknown'
        });
        
        return true;
    } catch (err) {
        console.error('❌ Redis connection failed:', err.message);
        return false;
    }
};

// =================================================================
// ENHANCED CONNECTION UTILITIES
// =================================================================

const getConnectionStatus = async () => {
    /**
     * Erweiterte Status-Informationen für beide Databases
     */
    const status = {
        postgresql: {
            connected: false,
            totalConnections: pgPool.totalCount,
            idleConnections: pgPool.idleCount,
            waitingClients: pgPool.waitingCount
        },
        redis: {
            connected: redisClient.isOpen,
            ready: redisClient.isReady
        },
        timestamp: new Date().toISOString()
    };
    
    // Test connections
    status.postgresql.connected = await testPostgreSQL().catch(() => false);
    status.redis.connected = await testRedis().catch(() => false);
    
    return status;
};

const ensureConnections = async () => {
    /**
     * Stelle sicher, dass beide Verbindungen aktiv sind
     */
    console.log('🔌 Ensuring database connections...');
    
    const pgConnected = await testPostgreSQL();
    const redisConnected = await testRedis();
    
    if (pgConnected && redisConnected) {
        console.log('🎉 All database connections ready!');
        return true;
    } else {
        console.log('⚠️ Some database connections failed - check configuration');
        return false;
    }
};

// =================================================================
// GRACEFUL SHUTDOWN (Ihre bewährte Version, aber enhanced)
// =================================================================

const closeConnections = async () => {
    console.log('🧹 Closing database connections...');
    
    // PostgreSQL Pool schließen
    try {
        await pgPool.end();
        console.log('✅ PostgreSQL pool closed');
    } catch (err) {
        console.error('❌ Error closing PostgreSQL:', err.message);
    }
    
    // Redis Client schließen (mit improved error handling)
    try {
        if (redisClient.isOpen) {
            await redisClient.quit();
            console.log('✅ Redis connection closed');
        } else {
            console.log('💡 Redis was already closed');
        }
    } catch (err) {
        // Weniger alarmierende Ausgabe für bereits geschlossene Connections
        console.log('⚠️ Redis close warning:', err.message);
    }
};

// =================================================================
// EXPORTS
// =================================================================

module.exports = {
    // Connection Objects
    pgPool,
    redisClient,
    
    // Legacy Exports (für Kompatibilität mit Ihrer server.js)
    pool: pgPool,  // Alias für backwards compatibility
    
    // Test Functions
    testPostgreSQL,
    testRedis,
    
    // Enhanced Utilities
    getConnectionStatus,
    ensureConnections,
    
    // Shutdown
    closeConnections
};