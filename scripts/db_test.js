#!/usr/bin/env node
/**
 * 🗄️ DATABASE CONNECTION TESTER
 * Schneller Test für PostgreSQL + Redis Verbindungen
 */

// Node.js findet Module automatisch im Parent-Verzeichnis:
const { Pool } = require('pg');
const redis = require('redis');
require('dotenv').config({ path: '../backend/.env' });

// Load environment from backend
require('dotenv').config({ path: '../backend/.env' });

console.log('🗄️ DATABASE CONNECTION TESTER');
console.log('=' * 40);
console.log('📁 Backend .env loaded');

// Test configurations
const configs = {
    // Test 1: Default postgres database
    postgres_db: {
        host: 'localhost',
        port: 5433,
        database: 'postgres',
        user: 'postgres', 
        password: 'Retroretro_001'
    },
    
    // Test 2: Your project database
    project_db: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 5433,
        database: process.env.DB_NAME || 'legal_retro_gaming',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'Retroretro_001'
    }
};

async function testPostgreSQL(name, config) {
    console.log(`\n🐘 Testing PostgreSQL: ${name}`);
    console.log(`   Database: ${config.database}`);
    console.log(`   User: ${config.user}`);
    console.log(`   Password: ${'*'.repeat(config.password.length)}`);
    
    const pool = new Pool(config);
    
    try {
        const result = await pool.query('SELECT version(), current_database()');
        console.log('   ✅ Connected successfully!');
        console.log(`   📝 Version: ${result.rows[0].version.split(' ')[0]} ${result.rows[0].version.split(' ')[1]}`);
        console.log(`   🗄️ Database: ${result.rows[0].current_database}`);
        return true;
    } catch (error) {
        console.log('   ❌ Connection failed!');
        console.log(`   📋 Error Code: ${error.code}`);
        console.log(`   📝 Message: ${error.message}`);
        
        // Common error explanations
        if (error.code === '28P01') {
            console.log('   💡 Solution: Wrong username or password');
        } else if (error.code === '3D000') {
            console.log('   💡 Solution: Database does not exist');
        } else if (error.code === 'ECONNREFUSED') {
            console.log('   💡 Solution: PostgreSQL service not running');
        }
        
        return false;
    } finally {
        await pool.end();
    }
}

async function testRedis() {
    if (!redis) {
        console.log('\n🔴 Redis test skipped - module not available');
        return false;
    }
    
    console.log('\n🔴 Testing Redis');
    
    const client = redis.createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379'
    });
    
    try {
        await client.connect();
        const pong = await client.ping();
        console.log('   ✅ Redis connected successfully!');
        console.log(`   📝 Ping response: ${pong}`);
        return true;
    } catch (error) {
        console.log('   ❌ Redis connection failed!');
        console.log(`   📝 Message: ${error.message}`);
        return false;
    } finally {
        await client.quit().catch(() => {});
    }
}

async function main() {
    // Test both PostgreSQL configurations
    const pgDefault = await testPostgreSQL('Default postgres', configs.postgres_db);
    const pgProject = await testPostgreSQL('Project database', configs.project_db);
    
    // Test Redis
    const redisOk = await testRedis();
    
    // Summary
    console.log('\n📊 TEST SUMMARY');
    console.log('=' * 40);
    console.log(`PostgreSQL (default): ${pgDefault ? '✅ OK' : '❌ FAILED'}`);
    console.log(`PostgreSQL (project): ${pgProject ? '✅ OK' : '❌ FAILED'}`);
    console.log(`Redis: ${redisOk ? '✅ OK' : '❌ FAILED'}`);
    
    if (pgProject && redisOk) {
        console.log('\n🎉 All databases ready for RetroRetro!');
    } else {
        console.log('\n⚠️ Some databases need attention');
    }
}

if (require.main === module) {
    main().catch(console.error);
}