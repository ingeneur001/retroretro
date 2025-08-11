// ===================================================================
// EVENT NAMES SYNCHRONIZATION VERIFICATION - Fixed Version
// backend/scripts/verify-events.js
// ===================================================================

// Frontend Event Names (copied from frontend config)
const frontendEvents = {
  // Connection Events
  connect: 'connect',
  disconnect: 'disconnect',
  error: 'connect_error',
  
  // Authentication Events  
  authenticate: 'authenticate',
  authenticated: 'authenticated',
  authError: 'auth_error',
  
  // Room Events
  createRoom: 'room:create',
  joinRoom: 'room:join',
  leaveRoom: 'room:leave',
  roomCreated: 'room:created',
  roomJoined: 'room:joined',
  roomLeft: 'room:left',
  roomUpdate: 'room:update',
  roomError: 'room:error',
  
  // Game Events
  gameStart: 'game:start',
  gameEnd: 'game:end',
  gameUpdate: 'game:update',
  gameAction: 'game:action',
  
  // Player Events
  playerJoined: 'player:joined',
  playerLeft: 'player:left',
  playerUpdate: 'player:update',
  
  // Chat Events
  chatMessage: 'chat:message',
  chatReceived: 'chat:received',
};

// Backend Event Names (should match frontend)
const backendEvents = {
  // Connection Events
  connect: 'connect',
  disconnect: 'disconnect',
  error: 'connect_error',
  
  // Authentication Events  
  authenticate: 'authenticate',
  authenticated: 'authenticated',
  authError: 'auth_error',
  
  // Room Events
  createRoom: 'room:create',
  joinRoom: 'room:join',
  leaveRoom: 'room:leave',
  roomCreated: 'room:created',
  roomJoined: 'room:joined',
  roomLeft: 'room:left',
  roomUpdate: 'room:update',
  roomError: 'room:error',
  
  // Game Events
  gameStart: 'game:start',
  gameEnd: 'game:end',
  gameUpdate: 'game:update',
  gameAction: 'game:action',
  
  // Player Events
  playerJoined: 'player:joined',
  playerLeft: 'player:left',
  playerUpdate: 'player:update',
  
  // Chat Events
  chatMessage: 'chat:message',
  chatReceived: 'chat:received',
};

// Verification Function
function verifyEventSync() {
  console.log('🔍 Verifying Frontend-Backend Event Synchronization...');
  
  let allMatch = true;
  
  for (const [key, backendEvent] of Object.entries(backendEvents)) {
    const frontendEvent = frontendEvents[key];
    
    if (frontendEvent !== backendEvent) {
      console.error(`❌ Event mismatch: ${key}`);
      console.error(`   Frontend: ${frontendEvent}`);
      console.error(`   Backend:  ${backendEvent}`);
      allMatch = false;
    } else {
      console.log(`✅ ${key}: ${backendEvent}`);
    }
  }
  
  if (allMatch) {
    console.log('\n🎉 All events synchronized!');
  } else {
    console.log('\n⚠️ Events need synchronization!');
  }
  
  return allMatch;
}

module.exports = { backendEvents, verifyEventSync };

// Run verification if called directly
if (require.main === module) {
  verifyEventSync();
}
