// 🗄️ DATABASE CONFIGURATION
// backend/config/database.js

const { Pool } = require('pg');
const redis = require('redis');

// PostgreSQL Configuration
const postgresConfig = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20, // connection pool size
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
};

// Redis Configuration  
const redisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: 0,
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3,
};

// Create instances
const pgPool = new Pool(postgresConfig);
const redisClient = redis.createClient(redisConfig);

// Database connection manager
const db = {
    // PostgreSQL
    query: async (text, params) => {
        const start = Date.now();
        const result = await pgPool.query(text, params);
        const duration = Date.now() - start;
        console.log(`🔍 Query executed in ${duration}ms`);
        return result;
    },

    // Redis cache operations
    cache: {
        get: async (key) => {
            try {
                const value = await redisClient.get(key);
                return value ? JSON.parse(value) : null;
            } catch (error) {
                console.error('❌ Redis GET error:', error);
                return null;
            }
        },

        set: async (key, value, expiration = 3600) => {
            try {
                return await redisClient.setEx(key, expiration, JSON.stringify(value));
            } catch (error) {
                console.error('❌ Redis SET error:', error);
                return false;
            }
        },

        del: async (key) => {
            try {
                return await redisClient.del(key);
            } catch (error) {
                console.error('❌ Redis DEL error:', error);
                return false;
            }
        }
    },

    // Health check
    async healthCheck() {
        const health = { 
            postgresql: false, 
            redis: false, 
            timestamp: new Date().toISOString() 
        };

        try {
            const pgResult = await pgPool.query('SELECT NOW()');
            health.postgresql = !!pgResult.rows[0];
        } catch (error) {
            console.error('PostgreSQL health check failed:', error);
        }

        try {
            const redisResult = await redisClient.ping();
            health.redis = redisResult === 'PONG';
        } catch (error) {
            console.error('Redis health check failed:', error);
        }

        return health;
    },

    // Graceful shutdown
    async disconnect() {
        try {
            await pgPool.end();
            await redisClient.quit();
            console.log('🔌 Database connections closed');
        } catch (error) {
            console.error('❌ Error closing connections:', error);
        }
    }
};

module.exports = {
    db,
    pgPool,
    redisClient,
    postgresConfig,
    redisConfig
};