// 1. Imports
import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
// 2. Keyframes  
const glow = keyframes`
  0%, 100% { box-shadow: 0 0 10px #00ffff; }
  50% { box-shadow: 0 0 20px #00ffff, 0 0 30px #00ffff; }
`;

// 3. Styled Components
const ProfileContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 30px;
  background: linear-gradient(145deg, #1a1a2e 0%, #16213e 100%);
  border: 2px solid #00ffff;
  border-radius: 15px;
  animation: ${glow} 3s ease-in-out infinite;
  max-width: 800px;
  margin: 2rem auto;
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  padding-bottom: 20px;
  border-bottom: 2px solid #00ffff;
`;

const ProfileAvatar = styled.div`
  width: 80px;
  height: 80px;
  background: linear-gradient(45deg, #ff6b9d, #00ffff);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: white;
  font-weight: bold;
`;

const ProfileInfo = styled.div`
  flex: 1;
  
  h2 {
    color: #00ffff;
    margin: 0 0 5px 0;
    font-size: 1.8rem;
  }
  
  p {
    color: #ffffff;
    margin: 0;
    opacity: 0.8;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
`;

const StatCard = styled.div`
  background: rgba(0, 255, 255, 0.1);
  border: 2px solid #00ffff;
  border-radius: 10px;
  padding: 20px;
  text-align: center;
  
  h3 {
    color: #00ffff;
    margin: 0 0 10px 0;
    font-size: 1.1rem;
    text-transform: uppercase;
  }
  
  .stat-value {
    color: #ffff00;
    font-size: 2rem;
    font-weight: bold;
    margin-bottom: 5px;
  }
  
  .stat-label {
    color: #ffffff;
    font-size: 0.9rem;
    opacity: 0.8;
  }
`;

const HighScoresSection = styled.div`
  h3 {
    color: #ff6b9d;
    margin-bottom: 15px;
    font-size: 1.4rem;
    text-align: center;
  }
`;

const HighScoresList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 15px;
`;

const HighScoreCard = styled.div`
  background: rgba(255, 107, 157, 0.1);
  border: 2px solid #ff6b9d;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
  
  .game-name {
    color: #ff6b9d;
    font-weight: bold;
    margin-bottom: 8px;
    text-transform: uppercase;
  }
  
  .score {
    color: #ffff00;
    font-size: 1.5rem;
    font-weight: bold;
  }
`;

const AchievementsSection = styled.div`
  h3 {
    color: #00ff00;
    margin-bottom: 15px;
    font-size: 1.4rem;
    text-align: center;
  }
`;

const AchievementsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const AchievementBadge = styled.div`
  background: rgba(0, 255, 0, 0.1);
  border: 1px solid #00ff00;
  border-radius: 20px;
  padding: 8px 15px;
  color: #00ff00;
  font-size: 0.9rem;
  font-weight: 500;
`;

// User Interface 
interface User {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
  stats: {
    totalGamesPlayed: number;
    totalScore: number;
    favoriteGame: string;
    highScores: Record<string, number>;
    achievements: string[];
  };
}

interface UserProfileProps {
  user: User;
  onUpdateStats: (gameType: string, score: number) => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user, onUpdateStats }) => {
  const [achievements, setAchievements] = useState<string[]>(user.stats.achievements);

  // Achievements prüfen
  useEffect(() => {
    const newAchievements: string[] = [...achievements];
    const stats = user.stats;
    
    // Verschiedene Achievements
    if (stats.totalGamesPlayed >= 10 && !achievements.includes('🎮 Game Veteran')) {
      newAchievements.push('🎮 Game Veteran');
    }
    
    if (stats.totalScore >= 10000 && !achievements.includes('💎 Score Master')) {
      newAchievements.push('💎 Score Master');
    }
    
    if (stats.highScores.snake >= 500 && !achievements.includes('🐍 Snake Champion')) {
      newAchievements.push('🐍 Snake Champion');
    }
    
    if (stats.highScores.tetris >= 5000 && !achievements.includes('🧩 Tetris Master')) {
      newAchievements.push('🧩 Tetris Master');
    }
    
    if (stats.highScores.pong >= 11 && !achievements.includes('🏓 Pong Winner')) {
      newAchievements.push('🏓 Pong Winner');
    }
    
    if (Object.values(stats.highScores).every(score => score > 0) && !achievements.includes('🏆 All-Rounder')) {
      newAchievements.push('🏆 All-Rounder');
    }
    
    if (newAchievements.length !== achievements.length) {
      setAchievements(newAchievements);
      // Update user data
      const users = JSON.parse(localStorage.getItem('retro_gaming_users') || '[]');
      const updatedUsers = users.map((u: any) => 
        u.id === user.id ? { ...u, stats: { ...u.stats, achievements: newAchievements } } : u
      );
      localStorage.setItem('retro_gaming_users', JSON.stringify(updatedUsers));
    }
  }, [user.stats, achievements, user.id]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('de-DE');
  };

  const getInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase();
  };

  return (
    <ProfileContainer>
      <ProfileHeader>
        <ProfileAvatar>
          {getInitials(user.username)}
        </ProfileAvatar>
        <ProfileInfo>
          <h2>{user.username}</h2>
          <p>📧 {user.email}</p>
          <p>📅 Member since {formatDate(user.createdAt)}</p>
        </ProfileInfo>
      </ProfileHeader>
      
      <StatsGrid>
        <StatCard>
          <h3>🎮 Games Played</h3>
          <div className="stat-value">{user.stats.totalGamesPlayed}</div>
          <div className="stat-label">Total Sessions</div>
        </StatCard>
        
        <StatCard>
          <h3>💯 Total Score</h3>
          <div className="stat-value">{user.stats.totalScore.toLocaleString()}</div>
          <div className="stat-label">All Games Combined</div>
        </StatCard>
        
        <StatCard>
          <h3>⭐ Favorite Game</h3>
          <div className="stat-value">{user.stats.favoriteGame || '🎲'}</div>
          <div className="stat-label">Most Played</div>
        </StatCard>
        
        <StatCard>
          <h3>🏆 Achievements</h3>
          <div className="stat-value">{achievements.length}</div>
          <div className="stat-label">Unlocked Badges</div>
        </StatCard>
      </StatsGrid>
      
      <HighScoresSection>
        <h3>🏆 High Scores</h3>
        <HighScoresList>
          <HighScoreCard>
            <div className="game-name">🐍 Snake</div>
            <div className="score">{user.stats.highScores.snake || 0}</div>
          </HighScoreCard>
          
          <HighScoreCard>
            <div className="game-name">🧠 Memory</div>
            <div className="score">{user.stats.highScores.memory || 0}</div>
          </HighScoreCard>
          
          <HighScoreCard>
            <div className="game-name">🏓 Pong</div>
            <div className="score">{user.stats.highScores.pong || 0}</div>
          </HighScoreCard>
          
          <HighScoreCard>
            <div className="game-name">🧩 Tetris</div>
            <div className="score">{user.stats.highScores.tetris || 0}</div>
          </HighScoreCard>
        </HighScoresList>
      </HighScoresSection>
      
      {achievements.length > 0 && (
        <AchievementsSection>
          <h3>🏅 Achievements</h3>
          <AchievementsList>
            {achievements.map((achievement, index) => (
              <AchievementBadge key={index}>
                {achievement}
              </AchievementBadge>
            ))}
          </AchievementsList>
        </AchievementsSection>
      )}
    </ProfileContainer>
  );
};