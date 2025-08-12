import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useModeDetection } from '../../hooks/useModeDetection';
import { GameNavigation, GameNavigationPresets } from '../gameszone/shared/GameNavigation';
import styled from 'styled-components';

// Styled Components
const ZoneContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
  color: white;
  padding: 2rem;
  font-family: 'Orbitron', monospace;
`;

const ZoneHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const ZoneTitle = styled.h1`
  font-size: 3rem;
  background: linear-gradient(45deg, #ff9800, #ffa726, #ffb74d);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 1rem;
  text-shadow: 0 0 20px rgba(255, 152, 0, 0.5);

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const ZoneSubtitle = styled.p`
  font-size: 1.2rem;
  color: #b0b0b0;
  max-width: 600px;
  margin: 0 auto;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  max-width: 1400px;
  margin: 0 auto;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const Section = styled.div`
  background: rgba(0, 20, 40, 0.6);
  border: 2px solid rgba(255, 152, 0, 0.3);
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 0 20px rgba(255, 152, 0, 0.1);
`;

const SectionTitle = styled.h2`
  color: #ff9800;
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  text-align: center;
  text-shadow: 0 0 10px rgba(255, 152, 0, 0.5);
`;

const AchievementsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const AchievementCard = styled.div<{ unlocked: boolean }>`
  background: rgba(0, 0, 0, 0.4);
  border: 2px solid ${props => props.unlocked ? '#ff9800' : '#444'};
  border-radius: 10px;
  padding: 1rem;
  text-align: center;
  transition: all 0.3s ease;
  opacity: ${props => props.unlocked ? 1 : 0.5};
  
  &:hover {
    transform: ${props => props.unlocked ? 'translateY(-5px)' : 'none'};
    box-shadow: ${props => props.unlocked ? '0 10px 20px rgba(255, 152, 0, 0.3)' : 'none'};
  }
`;

const AchievementIcon = styled.div<{ unlocked: boolean }>`
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  filter: ${props => props.unlocked ? 'none' : 'grayscale(100%)'};
`;

const AchievementTitle = styled.h4<{ unlocked: boolean }>`
  color: ${props => props.unlocked ? '#ff9800' : '#666'};
  font-size: 0.9rem;
  margin: 0.5rem 0;
  text-transform: uppercase;
`;

const AchievementDescription = styled.p`
  color: #aaa;
  font-size: 0.7rem;
  margin: 0;
  line-height: 1.3;
`;

const LeaderboardTable = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  overflow: hidden;
`;

const LeaderboardHeader = styled.div`
  background: rgba(255, 152, 0, 0.2);
  padding: 1rem;
  display: grid;
  grid-template-columns: 60px 1fr 100px 100px;
  gap: 1rem;
  font-weight: bold;
  color: #ff9800;
  font-size: 0.9rem;
`;

const LeaderboardRow = styled.div<{ isUser?: boolean }>`
  padding: 0.8rem 1rem;
  display: grid;
  grid-template-columns: 60px 1fr 100px 100px;
  gap: 1rem;
  border-bottom: 1px solid rgba(255, 152, 0, 0.1);
  background: ${props => props.isUser ? 'rgba(255, 152, 0, 0.1)' : 'transparent'};
  font-size: 0.8rem;
  
  &:hover {
    background: rgba(255, 152, 0, 0.05);
  }
`;

const RankBadge = styled.div<{ rank: number }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
  
  ${props => props.rank === 1 && `
    background: linear-gradient(45deg, #ffd700, #ffed4e);
    color: #000;
    box-shadow: 0 0 15px rgba(255, 215, 0, 0.5);
  `}
  
  ${props => props.rank === 2 && `
    background: linear-gradient(45deg, #c0c0c0, #e8e8e8);
    color: #000;
    box-shadow: 0 0 15px rgba(192, 192, 192, 0.5);
  `}
  
  ${props => props.rank === 3 && `
    background: linear-gradient(45deg, #cd7f32, #d4a574);
    color: #000;
    box-shadow: 0 0 15px rgba(205, 127, 50, 0.5);
  `}
  
  ${props => props.rank > 3 && `
    background: rgba(255, 152, 0, 0.2);
    border: 1px solid #ff9800;
    color: #ff9800;
  `}
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-top: 2rem;
`;

const StatCard = styled.div`
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 152, 0, 0.3);
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 1.8rem;
  font-weight: bold;
  color: #ff9800;
  text-shadow: 0 0 10px rgba(255, 152, 0, 0.3);
`;

const StatLabel = styled.div`
  font-size: 0.8rem;
  color: #aaa;
  text-transform: uppercase;
  margin-top: 0.5rem;
`;

// Interfaces
interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

interface LeaderboardEntry {
  rank: number;
  player: string;
  score: number;
  game: string;
  isCurrentUser?: boolean;
}

interface UserStats {
  gamesPlayed: number;
  totalScore: number;
  achievementsUnlocked: number;
  hoursPlayed: number;
}

const ScoreView: React.FC = () => {
  const navigate = useNavigate();
  const { mode } = useModeDetection();

  // Sample Achievements Data
  const achievements: Achievement[] = [
    {
      id: 'first-win',
      title: 'First Victory',
      description: 'Win your first game',
      icon: '🎯',
      unlocked: true,
      unlockedAt: '2024-01-15'
    },
    {
      id: 'speed-demon',
      title: 'Speed Demon',
      description: 'Complete Snake game in under 2 minutes',
      icon: '⚡',
      unlocked: true,
      unlockedAt: '2024-01-20'
    },
    {
      id: 'tetris-master',
      title: 'Tetris Master',
      description: 'Clear 10 lines in a single Tetris game',
      icon: '🧩',
      unlocked: false
    },
    {
      id: 'memory-champion',
      title: 'Memory Champion',
      description: 'Complete Memory game without mistakes',
      icon: '🧠',
      unlocked: true,
      unlockedAt: '2024-01-25'
    },
    {
      id: 'arcade-legend',
      title: 'Arcade Legend',
      description: 'Reach top 10 in any arcade game',
      icon: '🏆',
      unlocked: false
    },
    {
      id: 'social-gamer',
      title: 'Social Gamer',
      description: 'Win 5 multiplayer matches',
      icon: '👥',
      unlocked: false
    }
  ];

  // Sample Leaderboard Data
  const leaderboard: LeaderboardEntry[] = [
    { rank: 1, player: 'ProGamer2024', score: 15420, game: 'Snake' },
    { rank: 2, player: 'RetroMaster', score: 12890, game: 'Tetris' },
    { rank: 3, player: 'ArcadeKing', score: 11250, game: 'Snake' },
    { rank: 4, player: 'YouPlayer', score: 9840, game: 'Memory', isCurrentUser: true },
    { rank: 5, player: 'GameWiz', score: 8750, game: 'Pong' },
    { rank: 6, player: 'PixelHero', score: 7620, game: 'Snake' },
    { rank: 7, player: 'NeonNinja', score: 6890, game: 'Tetris' },
    { rank: 8, player: 'ByteBuster', score: 5940, game: 'Memory' }
  ];

  // Sample User Stats
  const userStats: UserStats = {
    gamesPlayed: 47,
    totalScore: 23680,
    achievementsUnlocked: achievements.filter(a => a.unlocked).length,
    hoursPlayed: 12
  };

  return (
    <ZoneContainer>
      {/* Zone Header */}
      <ZoneHeader>
        <ZoneTitle>🏆 SCORES & ACHIEVEMENTS</ZoneTitle>
        <ZoneSubtitle>
          Track your progress, unlock achievements, and compete on the leaderboards!
        </ZoneSubtitle>
      </ZoneHeader>

      {/* Content Grid */}
      <ContentGrid>
        {/* Achievements Section */}
        <Section>
          <SectionTitle>🎖️ Achievements</SectionTitle>
          <AchievementsGrid>
            {achievements.map(achievement => (
              <AchievementCard key={achievement.id} unlocked={achievement.unlocked}>
                <AchievementIcon unlocked={achievement.unlocked}>
                  {achievement.icon}
                </AchievementIcon>
                <AchievementTitle unlocked={achievement.unlocked}>
                  {achievement.title}
                </AchievementTitle>
                <AchievementDescription>
                  {achievement.description}
                </AchievementDescription>
                {achievement.unlocked && achievement.unlockedAt && (
                  <div style={{ 
                    fontSize: '0.6rem', 
                    color: '#ff9800', 
                    marginTop: '0.5rem' 
                  }}>
                    Unlocked: {achievement.unlockedAt}
                  </div>
                )}
              </AchievementCard>
            ))}
          </AchievementsGrid>
        </Section>

        {/* Leaderboard Section */}
        <Section>
          <SectionTitle>📊 Global Leaderboard</SectionTitle>
          <LeaderboardTable>
            <LeaderboardHeader>
              <div>Rank</div>
              <div>Player</div>
              <div>Score</div>
              <div>Game</div>
            </LeaderboardHeader>
            {leaderboard.map(entry => (
              <LeaderboardRow key={entry.rank} isUser={entry.isCurrentUser}>
                <RankBadge rank={entry.rank}>
                  {entry.rank <= 3 ? (
                    entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'
                  ) : (
                    entry.rank
                  )}
                </RankBadge>
                <div>{entry.player}</div>
                <div>{entry.score.toLocaleString()}</div>
                <div>{entry.game}</div>
              </LeaderboardRow>
            ))}
          </LeaderboardTable>
        </Section>
      </ContentGrid>

      {/* User Stats */}
      <StatsGrid>
        <StatCard>
          <StatValue>{userStats.gamesPlayed}</StatValue>
          <StatLabel>Games Played</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{userStats.totalScore.toLocaleString()}</StatValue>
          <StatLabel>Total Score</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{userStats.achievementsUnlocked}/{achievements.length}</StatValue>
          <StatLabel>Achievements</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{userStats.hoursPlayed}h</StatValue>
          <StatLabel>Hours Played</StatLabel>
        </StatCard>
      </StatsGrid>

      {/* Navigation */}
      <GameNavigation {...GameNavigationPresets.singleplayerGame('Scores')} />
    </ZoneContainer>
  );
};

export default ScoreView;