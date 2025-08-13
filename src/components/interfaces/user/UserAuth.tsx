// src/components/interfaces/user/UserAuth.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppContainer,
  PageHeader,
  PageTitle,
  ContentArea,
  CenteredContent,
  Card,
  CardTitle,
  CardContent,
  Button,
  FormContainer,
  Input,
  Label,
  FlexColumn,
  FlexRow,
  Text,
  Spacer
} from '../../../styles/components';

// User Interface - angepasst an UserManager-Struktur
interface User {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
  stats: {
    totalScore: number;
    gamesPlayed: number;
    favoriteGame: string;
    highScores: Record<string, number>;
    achievements: string[];
  };
  // Backwards compatibility - behalte die alten Properties als Getter
  totalScore: number;
  gamesPlayed: number;
  favoriteGame: string;
}

interface UserAuthProps {
  onLogin: (user: User) => void;
  onLogout: () => void;
  currentUser: User | null;
}

export const UserAuth: React.FC<UserAuthProps> = ({ onLogin, onLogout, currentUser }) => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(''); // Clear error when user types
  };

// In UserAuth.tsx - ändere nur die handleSubmit Funktion:

const handleSubmit = async (e: React.FormEvent) => {
  console.log("🔥 SUBMIT CLICKED!");
  e.preventDefault();
  console.log("🔥 FORM DATA:", formData);
  setIsLoading(true);
  setError('');

  try {
    if (!isLogin) {
      // Registration validation
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        setIsLoading(false);
        return;
      }
      if (formData.password.length < 3) {
        setError('Password must be at least 3 characters');
        setIsLoading(false);
        return;
      }
    }

    // === BACKEND ERSETZT DURCH LOCALSTORAGE ===
    
    if (isLogin) {
      // LOGIN: Prüfe localStorage
      const users = JSON.parse(localStorage.getItem('retro_gaming_users') || '[]');
      const user = users.find((u: any) => 
        u.username === formData.username && u.password === formData.password
      );
      
      if (user) {
        // Login erfolgreich
        const statsData = {
          totalScore: user.stats?.totalScore || 0,
          gamesPlayed: user.stats?.gamesPlayed || 0,
          favoriteGame: user.stats?.favoriteGame || 'none',
          highScores: user.stats?.highScores || {},
          achievements: user.stats?.achievements || []
        };

        const loggedInUser: User = {
          id: user.id,
          username: user.username,
          email: user.email,
          createdAt: new Date(user.createdAt),
          stats: statsData,
          // Backwards compatibility
          totalScore: statsData.totalScore,
          gamesPlayed: statsData.gamesPlayed,
          favoriteGame: statsData.favoriteGame
        };
        
        onLogin(loggedInUser);
        console.log(`✅ Login successful:`, loggedInUser);
      } else {
        setError('Invalid username or password');
      }
    } else {
      // REGISTRATION: Speichere in localStorage
      const users = JSON.parse(localStorage.getItem('retro_gaming_users') || '[]');
      
      // Prüfe ob User bereits existiert
      if (users.find((u: any) => u.username === formData.username)) {
        setError('Username already exists');
        setIsLoading(false);
        return;
      }
      
      // Neuen User erstellen
      const newUser = {
        id: Date.now().toString(),
        username: formData.username,
        email: formData.email,
        password: formData.password, // In Production: hash this!
        createdAt: new Date().toISOString(),
        stats: {
          totalScore: 0,
          gamesPlayed: 0,
          favoriteGame: 'none',
          highScores: {},
          achievements: []
        }
      };
      
      // In localStorage speichern
      users.push(newUser);
      localStorage.setItem('retro_gaming_users', JSON.stringify(users));
      
      // Automatisch einloggen
      const statsData = {
        totalScore: 0,
        gamesPlayed: 0,
        favoriteGame: 'none',
        highScores: {},
        achievements: []
      };

      const user: User = {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        createdAt: new Date(),
        stats: statsData,
        // Backwards compatibility
        totalScore: 0,
        gamesPlayed: 0,
        favoriteGame: 'none'
      };
      
      onLogin(user);
      console.log(`✅ Registration successful:`, user);
    }
  } catch (err) {
    console.error('Auth error:', err);
    setError('Connection error. Please try again.');
  } finally {
    setIsLoading(false);
  }
};

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleGuestMode = () => {
    // Create a guest user mit stats-Struktur
    const statsData = {
      totalScore: 0,
      gamesPlayed: 0,
      favoriteGame: 'none',
      highScores: {},
      achievements: []
    };

    const guestUser: User = {
      id: 'guest_' + Date.now(),
      username: 'Guest Player',
      email: 'guest@retro.game',
      createdAt: new Date(),
      stats: statsData,
      // Backwards compatibility
      totalScore: 0,
      gamesPlayed: 0,
      favoriteGame: 'none'
    };
    onLogin(guestUser);
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  };

  return (
    <AppContainer>
      <PageHeader>
        <PageTitle>🔑 {isLogin ? 'Player Login' : 'Player Registration'}</PageTitle>
        <FlexRow>
          <Button variant="ghost" onClick={handleBackToHome}>
            ← Back to Home
          </Button>
          <Button variant="secondary" onClick={handleGuestMode}>
            🎮 Play as Guest
          </Button>
        </FlexRow>
      </PageHeader>

      <ContentArea>
        <CenteredContent>
          <Card style={{ maxWidth: '500px', width: '100%' }}>
            <CardTitle>
              {isLogin ? '🚀 Welcome Back, Player!' : '🎮 Join the Retro Gaming Community!'}
            </CardTitle>
            
            <CardContent>
              <FlexColumn>
                <Text size="sm" color="#cccccc">
                  {isLogin 
                    ? 'Enter your credentials to access your gaming profile and high scores.'
                    : 'Create an account to save your progress, track high scores, and compete on leaderboards!'
                  }
                </Text>

                <Spacer size="md" />

                <FormContainer onSubmit={handleSubmit}>
                  <FlexColumn>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      placeholder="Enter your username"
                      value={formData.username}
                      onChange={handleInputChange}
                      required
                    />
                  </FlexColumn>

                  {!isLogin && (
                    <FlexColumn>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </FlexColumn>
                  )}

                  <FlexColumn>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                    />
                  </FlexColumn>

                  {!isLogin && (
                    <FlexColumn>
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                      />
                    </FlexColumn>
                  )}

                  {error && (
                    <Text size="sm" color="#ff6b6b">
                      ⚠️ {error}
                    </Text>
                  )}

                  <Spacer size="md" />

                  <FlexColumn>
                    <Button 
                      type="submit" 
                      variant="primary" 
                      size="large" 
                      fullWidth 
                      disabled={isLoading}
                    >
                      {isLoading ? '⏳ Processing...' : isLogin ? '🚀 Login' : '✨ Create Account'}
                    </Button>

                    <Button 
                      type="button" 
                      variant="ghost" 
                      onClick={toggleMode}
                      disabled={isLoading}
                    >
                      {isLogin 
                        ? "Don't have an account? Register here" 
                        : 'Already have an account? Login here'
                      }
                    </Button>
                  </FlexColumn>
                </FormContainer>

                <Spacer size="lg" />

                <FlexColumn style={{ textAlign: 'center' }}>
                  <Text size="xs" color="#888">
                    🎮 RetroRetro Gaming Service
                  </Text>
                  <Text size="xs" color="#888">
                    Play classic games • Track scores • Compete with friends
                  </Text>
                </FlexColumn>
              </FlexColumn>
            </CardContent>
          </Card>
        </CenteredContent>
      </ContentArea>
    </AppContainer>
  );
};

// Exportiere auch den User-Type für andere Komponenten
export type { User };