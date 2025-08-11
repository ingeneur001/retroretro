// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

// Simulierte User-Datenbank (in Produktion: echte DB verwenden)
let users = [
  {
    id: '1',
    username: 'User001',
    email: 'user001@retro.game',
    password: '$2a$10$8K1p/a0dRt..4Xy58YjEyuJaoCGF.8WJvJ6qv/L5U7.3rD8Y7M2K6', // User001
    createdAt: new Date(),
    stats: {
      totalScore: 1500,
      gamesPlayed: 25,
      favoriteGame: 'snake',
      highScores: {
        snake: 450,
        tetris: 3200,
        pong: 8,
        memory: 180
      },
      achievements: ['🎮 Game Veteran', '🐍 Snake Champion']
    }
  }
];

// POST /api/auth/register - User registrieren
router.post('/register', async (req, res) => {
  try {
    console.log('📝 Registration attempt:', req.body);
    
    const { username, email, password } = req.body;
    
    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ 
        message: 'Username, email and password are required' 
      });
    }
    
    if (password.length < 3) {
      return res.status(400).json({ 
        message: 'Password must be at least 3 characters long' 
      });
    }
    
    // Check if user exists
    const existingUser = users.find(u => 
      u.username === username || u.email === email
    );
    
    if (existingUser) {
      return res.status(400).json({ 
        message: 'Username or email already exists' 
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    const newUser = {
      id: Date.now().toString(),
      username,
      email,
      password: hashedPassword,
      createdAt: new Date(),
      stats: {
        totalScore: 0,
        gamesPlayed: 0,
        favoriteGame: 'none',
        highScores: {},
        achievements: []
      }
    };
    
    users.push(newUser);
    
    // Return user without password
    const { password: _, ...userResponse } = newUser;
    
    console.log('✅ User registered:', userResponse);
    
    res.status(201).json({
      message: 'User registered successfully',
      user: userResponse
    });
    
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/auth/login - User einloggen
router.post('/login', async (req, res) => {
  try {
    console.log('🔐 Login attempt:', { username: req.body.username });
    
    const { username, password } = req.body;
    
    // Validation
    if (!username || !password) {
      return res.status(400).json({ 
        message: 'Username and password are required' 
      });
    }
    
    // Find user
    const user = users.find(u => u.username === username);
    
    if (!user) {
      console.log('❌ User not found:', username);
      return res.status(401).json({ 
        message: 'Invalid username or password' 
      });
    }
    
    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      console.log('❌ Invalid password for user:', username);
      return res.status(401).json({ 
        message: 'Invalid username or password' 
      });
    }
    
    // Return user without password
    const { password: _, ...userResponse } = user;
    
    console.log('✅ Login successful:', userResponse);
    
    res.json({
      message: 'Login successful',
      user: userResponse
    });
    
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/auth/profile - User-Profil abrufen
router.get('/profile/:id', (req, res) => {
  try {
    const userId = req.params.id;
    const user = users.find(u => u.id === userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const { password: _, ...userResponse } = user;
    res.json(userResponse);
    
  } catch (error) {
    console.error('❌ Profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/auth/profile/:id - User-Profil aktualisieren
router.put('/profile/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const updates = req.body;
    
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update user (ohne password zu überschreiben)
    const { password, id, ...allowedUpdates } = updates;
    users[userIndex] = { ...users[userIndex], ...allowedUpdates };
    
    const { password: _, ...userResponse } = users[userIndex];
    
    console.log('✅ Profile updated:', userResponse);
    
    res.json({
      message: 'Profile updated successfully',
      user: userResponse
    });
    
  } catch (error) {
    console.error('❌ Profile update error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/auth/users - Alle User für Leaderboard
router.get('/users', (req, res) => {
  try {
    const usersWithoutPasswords = users.map(({ password, ...user }) => user);
    res.json(usersWithoutPasswords);
  } catch (error) {
    console.error('❌ Users fetch error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Debug endpoint - nur für Development
router.get('/debug/users', (req, res) => {
  res.json({
    message: 'Debug: All users',
    count: users.length,
    users: users.map(u => ({ 
      id: u.id, 
      username: u.username, 
      email: u.email,
      stats: u.stats 
    }))
  });
});

module.exports = router; 
