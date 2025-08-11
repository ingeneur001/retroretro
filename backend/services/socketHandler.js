 
class SocketHandler {
    constructor(io) {
        this.io = io;
        this.connectedUsers = new Map();
        this.gameRooms = new Map();
        this.setupSocketHandlers();
    }

    setupSocketHandlers() {
        this.io.on('connection', (socket) => {
            console.log(`User connected: ${socket.id}`);
            
            // User authentication
            socket.on('authenticate', (userData) => {
                this.connectedUsers.set(socket.id, {
                    id: userData.userId,
                    username: userData.username,
                    socketId: socket.id,
                    currentGame: null
                });
                
                socket.emit('authenticated', { 
                    status: 'success',
                    socketId: socket.id 
                });
                
                console.log(`User authenticated: ${userData.username} (${socket.id})`);
            });

            // Game room management
            socket.on('join-game', (gameData) => {
                const user = this.connectedUsers.get(socket.id);
                if (!user) return socket.emit('error', 'Not authenticated');

                const roomId = gameData.gameId || `game-${Date.now()}`;
                socket.join(roomId);
                
                user.currentGame = roomId;
                
                // Initialize room if it doesn't exist
                if (!this.gameRooms.has(roomId)) {
                    this.gameRooms.set(roomId, {
                        id: roomId,
                        players: [],
                        gameState: null,
                        maxPlayers: gameData.maxPlayers || 4
                    });
                }

                const room = this.gameRooms.get(roomId);
                room.players.push({
                    socketId: socket.id,
                    userId: user.id,
                    username: user.username
                });

                socket.emit('joined-game', { 
                    roomId: roomId,
                    players: room.players.length
                });

                // Notify other players
                socket.to(roomId).emit('player-joined', {
                    player: user.username,
                    totalPlayers: room.players.length
                });

                console.log(`${user.username} joined game room: ${roomId}`);
            });

            // Leave game room
            socket.on('leave-game', () => {
                this.handleLeaveGame(socket);
            });

            // Game state updates
            socket.on('game-update', (gameState) => {
                const user = this.connectedUsers.get(socket.id);
                if (!user || !user.currentGame) return;

                const room = this.gameRooms.get(user.currentGame);
                if (room) {
                    room.gameState = gameState;
                    socket.to(user.currentGame).emit('game-state-update', {
                        player: user.username,
                        gameState: gameState
                    });
                }
            });

            // Chat messages
            socket.on('chat-message', (message) => {
                const user = this.connectedUsers.get(socket.id);
                if (!user || !user.currentGame) return;

                this.io.to(user.currentGame).emit('chat-message', {
                    username: user.username,
                    message: message.text,
                    timestamp: Date.now()
                });
            });

            // Handle multiplayer game actions
            socket.on('multiplayer-action', (actionData) => {
                const user = this.connectedUsers.get(socket.id);
                if (!user || !user.currentGame) return;

                socket.to(user.currentGame).emit('multiplayer-action', {
                    player: user.username,
                    playerId: user.id,
                    action: actionData.action,
                    data: actionData.data,
                    timestamp: Date.now()
                });
            });

            // Handle game invitations
            socket.on('invite-player', (inviteData) => {
                const user = this.connectedUsers.get(socket.id);
                if (!user) return;

                // Find target user by username
                const targetUser = Array.from(this.connectedUsers.values())
                    .find(u => u.username === inviteData.targetUsername);

                if (targetUser) {
                    this.io.to(targetUser.socketId).emit('game-invitation', {
                        from: user.username,
                        gameType: inviteData.gameType,
                        roomId: inviteData.roomId
                    });
                } else {
                    socket.emit('invite-error', 'User not found or offline');
                }
            });

            // Handle disconnect
            socket.on('disconnect', () => {
                this.handleDisconnect(socket);
            });

            // Ping/Pong for connection health
            socket.on('ping', () => {
                socket.emit('pong');
            });
        });
    }

    handleLeaveGame(socket) {
        const user = this.connectedUsers.get(socket.id);
        if (!user || !user.currentGame) return;

        const roomId = user.currentGame;
        const room = this.gameRooms.get(roomId);

        if (room) {
            // Remove player from room
            room.players = room.players.filter(p => p.socketId !== socket.id);
            
            // Leave socket room
            socket.leave(roomId);
            
            // Notify other players
            socket.to(roomId).emit('player-left', {
                player: user.username,
                totalPlayers: room.players.length
            });

            // Clean up empty rooms
            if (room.players.length === 0) {
                this.gameRooms.delete(roomId);
                console.log(`Game room ${roomId} closed - no players remaining`);
            }
        }

        user.currentGame = null;
        console.log(`${user.username} left game room: ${roomId}`);
    }

    handleDisconnect(socket) {
        const user = this.connectedUsers.get(socket.id);
        
        if (user) {
            console.log(`User disconnected: ${user.username} (${socket.id})`);
            
            // Handle leaving current game
            if (user.currentGame) {
                this.handleLeaveGame(socket);
            }
            
            // Remove from connected users
            this.connectedUsers.delete(socket.id);
        } else {
            console.log(`Unknown user disconnected: ${socket.id}`);
        }
    }

    // Utility methods
    getConnectedUsersCount() {
        return this.connectedUsers.size;
    }

    getActiveGamesCount() {
        return this.gameRooms.size;
    }

    getUsersInRoom(roomId) {
        const room = this.gameRooms.get(roomId);
        return room ? room.players : [];
    }

    broadcastToRoom(roomId, event, data) {
        this.io.to(roomId).emit(event, data);
    }

    // For backward compatibility - alias for MultiplayerSocketHandler
    static create(io) {
        return new SocketHandler(io);
    }
}

// Export both class and create method for flexibility
module.exports = SocketHandler;
module.exports.MultiplayerSocketHandler = SocketHandler;