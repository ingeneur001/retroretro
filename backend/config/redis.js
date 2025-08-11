// ===================================================================
// REDIS CONFIGURATION für Multiplayer Sessions
// backend/config/redis.js
// ===================================================================

const redis = require('redis');

const redisConfig = {
  // Development Settings
  development: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || null,
    db: 0,
    retryDelayOnFailover: 100,
    enableReadyCheck: false,
    maxRetriesPerRequest: null,
  },
  
  // Production Settings
  production: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD,
    db: 0,
    tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
    retryDelayOnFailover: 100,
    enableReadyCheck: false,
    maxRetriesPerRequest: null,
  }
};

// Create Redis Client
const createRedisClient = () => {
  const env = process.env.NODE_ENV || 'development';
  const config = redisConfig[env];
  
  const client = redis.createClient(config);
  
  client.on('error', (err) => {
    console.error('❌ Redis Client Error:', err);
  });
  
  client.on('connect', () => {
    console.log('✅ Redis Client Connected');
  });
  
  client.on('ready', () => {
    console.log('🚀 Redis Client Ready');
  });
  
  return client;
};

// Session Management
const sessionManager = {
  // Game Room Sessions
  async setGameRoom(roomId, roomData, ttl = 3600) {
    const client = createRedisClient();
    await client.setex(`room:${roomId}`, ttl, JSON.stringify(roomData));
    await client.quit();
  },
  
  async getGameRoom(roomId) {
    const client = createRedisClient();
    const data = await client.get(`room:${roomId}`);
    await client.quit();
    return data ? JSON.parse(data) : null;
  },
  
  async deleteGameRoom(roomId) {
    const client = createRedisClient();
    await client.del(`room:${roomId}`);
    await client.quit();
  },
  
  // Player Sessions
  async setPlayerSession(playerId, sessionData, ttl = 7200) {
    const client = createRedisClient();
    await client.setex(`player:${playerId}`, ttl, JSON.stringify(sessionData));
    await client.quit();
  },
  
  async getPlayerSession(playerId) {
    const client = createRedisClient();
    const data = await client.get(`player:${playerId}`);
    await client.quit();
    return data ? JSON.parse(data) : null;
  }
};

module.exports = {
  redisConfig,
  createRedisClient,
  sessionManager
};
