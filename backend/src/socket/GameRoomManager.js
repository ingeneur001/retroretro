const multiplayerConfig = require('../config/multiplayer');
const { sessionManager } = require('../../config/redis');
// ========================================
// MULTI-USER WEBSOCKET ARCHITECTURE
// Complete implementation for RetroRetro Gaming Platform
// ========================================

// ========================================
// 1. BACKEND: Enhanced Game Room Manager
// File: backend/src/socket/GameRoomManager.js
// ========================================

class GameRoomManager {
    constructor() {
        this.rooms = new Map(); // roomId -> Room
        this.players = new Map(); // socketId -> Player
        this.matchmaking = new Map(); // gameType -> Queue[]
        
        // Room limits
        this.MAX_ROOMS = 1000;
        this.MAX_PLAYERS_PER_ROOM = 8;
        this.ROOM_TIMEOUT = 30 * 60 * 1000; // 30 minutes
        
        // Start cleanup interval
        setInterval(() => this.cleanupInactiveRooms(), 60000); // Every minute
    }
    
    // ========================================
    // ROOM MANAGEMENT
    // ========================================
    
    createRoom(gameType, hostSocketId, hostUser, isPrivate = false) {
        // Generate unique room ID
        const roomId = this.generateRoomId();
        
        // Create room
        const room = {
            id: roomId,
            gameType: gameType, // 'snake', 'pong', 'tetris', 'memory'
            hostSocketId: hostSocketId,
            players: new Map(), // socketId -> Player
            spectators: new Map(), // socketId -> Spectator
            isPrivate: isPrivate,
            status: 'waiting', // waiting, playing, paused, finished
            maxPlayers: this.getMaxPlayersForGame(gameType),
            createdAt: new Date(),
            lastActivity: new Date(),
            gameState: null,
            settings: this.getDefaultGameSettings(gameType),
            chat: [], // Message history
            inviteCode: isPrivate ? this.generateInviteCode() : null
        };
        
        // Add host as first player
        const hostPlayer = {
            socketId: hostSocketId,
            user: hostUser,
            isHost: true,
            joinedAt: new Date(),
            status: 'ready',
            score: 0,
            lives: this.getDefaultLives(gameType)
        };
        
        room.players.set(hostSocketId, hostPlayer);
        this.rooms.set(roomId, room);
        this.players.set(hostSocketId, { roomId, player: hostPlayer });
        
        console.log(`🎮 Room created: ${roomId} (${gameType}) by ${hostUser.username}`);
        
        return room;
    }
    
    joinRoom(roomId, socketId, user, asSpectator = false) {
        const room = this.rooms.get(roomId);
        if (!room) {
            throw new Error('Room not found');
        }
        
        // Check if room is full (for players)
        if (!asSpectator && room.players.size >= room.maxPlayers) {
            throw new Error('Room is full');
        }
        
        // Check if game already started (spectators can always join)
        if (!asSpectator && room.status === 'playing') {
            throw new Error('Game already in progress');
        }
        
        // Remove player from any previous room
        this.leaveCurrentRoom(socketId);
        
        if (asSpectator) {
            // Add as spectator
            const spectator = {
                socketId: socketId,
                user: user,
                joinedAt: new Date()
            };
            
            room.spectators.set(socketId, spectator);
            this.players.set(socketId, { roomId, spectator });
            
            console.log(`👀 Spectator joined room ${roomId}: ${user.username}`);
        } else {
            // Add as player
            const player = {
                socketId: socketId,
                user: user,
                isHost: false,
                joinedAt: new Date(),
                status: 'ready',
                score: 0,
                lives: this.getDefaultLives(room.gameType)
            };
            
            room.players.set(socketId, player);
            this.players.set(socketId, { roomId, player });
            
            console.log(`🎮 Player joined room ${roomId}: ${user.username}`);
        }
        
        room.lastActivity = new Date();
        return room;
    }
    
    leaveRoom(socketId) {
        const playerData = this.players.get(socketId);
        if (!playerData) return null;
        
        const room = this.rooms.get(playerData.roomId);
        if (!room) return null;
        
        // Remove player or spectator
        if (playerData.player) {
            room.players.delete(socketId);
            
            // If host left, assign new host
            if (playerData.player.isHost && room.players.size > 0) {
                const newHost = room.players.values().next().value;
                newHost.isHost = true;
                room.hostSocketId = newHost.socketId;
                console.log(`👑 New host assigned: ${newHost.user.username}`);
            }
        }
        
        if (playerData.spectator) {
            room.spectators.delete(socketId);
        }
        
        this.players.delete(socketId);
        
        // If room is empty, delete it
        if (room.players.size === 0) {
            this.rooms.delete(playerData.roomId);
            console.log(`🗑️ Room deleted: ${playerData.roomId} (empty)`);
            return null;
        }
        
        room.lastActivity = new Date();
        return room;
    }
    
    leaveCurrentRoom(socketId) {
        return this.leaveRoom(socketId);
    }
    
    // ========================================
    // MATCHMAKING SYSTEM
    // ========================================
    
    addToMatchmaking(socketId, user, gameType, skillLevel = 'beginner') {
        // Remove from any existing queue
        this.removeFromMatchmaking(socketId);
        
        const queueItem = {
            socketId: socketId,
            user: user,
            gameType: gameType,
            skillLevel: skillLevel,
            queuedAt: new Date()
        };
        
        if (!this.matchmaking.has(gameType)) {
            this.matchmaking.set(gameType, []);
        }
        
        this.matchmaking.get(gameType).push(queueItem);
        
        console.log(`🔍 Player queued for ${gameType}: ${user.username}`);
        
        // Try to find match immediately
        return this.tryFindMatch(gameType);
    }
    
    removeFromMatchmaking(socketId) {
        for (const [gameType, queue] of this.matchmaking) {
            const index = queue.findIndex(item => item.socketId === socketId);
            if (index !== -1) {
                queue.splice(index, 1);
                console.log(`❌ Player removed from ${gameType} queue`);
                return true;
            }
        }
        return false;
    }
    
    tryFindMatch(gameType) {
        const queue = this.matchmaking.get(gameType) || [];
        const requiredPlayers = this.getRequiredPlay