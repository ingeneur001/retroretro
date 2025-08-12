import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';

// Retro Animations
const neonPulse = keyframes`
  0% {
    text-shadow: 
      0 0 15px #ffff00,
      0 0 30px #ffff00,
      0 0 45px #ffff00;
  }
  100% {
    text-shadow: 
      0 0 8px #ffff00,
      0 0 15px #ffff00,
      0 0 25px #ffff00;
  }
`;

const neonPulseGreen = keyframes`
  0% {
    text-shadow: 
      0 0 10px #00ff00,
      0 0 20px #00ff00,
      0 0 30px #00ff00;
  }
  100% {
    text-shadow: 
      0 0 5px #00ff00,
      0 0 10px #00ff00,
      0 0 15px #00ff00;
  }
`;

const boxGlow = keyframes`
  0% {
    box-shadow: 
      0 0 20px rgba(255, 255, 0, 0.5),
      0 0 40px rgba(255, 255, 0, 0.3);
    border-color: #ffff00;
  }
  100% {
    box-shadow: 
      0 0 30px rgba(255, 255, 0, 0.8),
      0 0 60px rgba(255, 255, 0, 0.4);
    border-color: #ffff00;
  }
`;

// Styled Components
const Container = styled.div`
  font-family: 'Courier New', monospace;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  color: #ffffff;
  min-height: 100vh;
  margin: 0;
  padding: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const BackButton = styled.button`
  background: transparent;
  border: 2px solid #00ffff;
  color: #00ffff;
  padding: 0.7rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  text-shadow: 0 0 5px #00ffff, 0 0 8px #00ffff;
  
  &:hover {
    background: rgba(0, 255, 255, 0.1);
    text-shadow: 0 0 8px #00ffff, 0 0 15px #00ffff, 0 0 25px #00ffff;
    box-shadow: 0 0 15px rgba(0, 255, 255, 0.6);
    transform: scale(1.05);
  }
`;

const Title = styled.h1`
  font-size: 3rem;
  font-weight: bold;
  color: #ffff00;
  text-align: center;
  letter-spacing: 0.2rem;
  animation: ${neonPulse} 2s infinite alternate;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 2.2rem;
  }
`;

const SettingsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 800px;
  margin: 0 auto;
`;

const SettingsSection = styled.div`
  background: rgba(0, 0, 0, 0.9);
  border: 4px solid #ffff00;
  border-radius: 15px;
  padding: 2rem;
  animation: ${boxGlow} 3s infinite alternate;
`;

const SectionTitle = styled.h2`
  color: #ffff00;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  text-transform: uppercase;
  text-shadow: 0 0 5px #ffff00, 0 0 10px #ffff00;
`;

const SettingItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: rgba(0, 20, 40, 0.5);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 0, 0.3);

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
`;

const SettingLabel = styled.div`
  color: #ffffff;
  font-weight: bold;
  
  small {
    display: block;
    color: rgba(255, 255, 255, 0.7);
    font-weight: normal;
    margin-top: 0.3rem;
  }
`;

const SettingControl = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const Switch = styled.label<{ checked: boolean }>`
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
  
  input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  
  span {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: ${props => props.checked ? '#00ff00' : '#666'};
    transition: 0.4s;
    border-radius: 34px;
    box-shadow: ${props => props.checked ? 
      '0 0 10px rgba(0, 255, 0, 0.5)' : 
      '0 0 5px rgba(102, 102, 102, 0.5)'
    };
    
    &:before {
      position: absolute;
      content: "";
      height: 26px;
      width: 26px;
      left: ${props => props.checked ? '30px' : '4px'};
      bottom: 4px;
      background-color: white;
      transition: 0.4s;
      border-radius: 50%;
    }
  }
`;

const Select = styled.select`
  background: rgba(0, 20, 40, 0.8);
  border: 2px solid #ffff00;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  color: #ffffff;
  font-family: 'Courier New', monospace;
  font-size: 1rem;
  min-width: 150px;
  
  &:focus {
    outline: none;
    border-color: #00ff88;
    box-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
  }
  
  option {
    background: #1a1a2e;
    color: #ffffff;
  }
`;

const Input = styled.input`
  background: rgba(0, 20, 40, 0.8);
  border: 2px solid #ffff00;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  color: #ffffff;
  font-family: 'Courier New', monospace;
  font-size: 1rem;
  min-width: 150px;
  
  &:focus {
    outline: none;
    border-color: #00ff88;
    box-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
  }
`;

const SaveButton = styled.button`
  background: transparent;
  border: 2px solid #00ff00;
  color: #00ff00;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  text-shadow: 0 0 5px #00ff00, 0 0 8px #00ff00;
  animation: ${neonPulseGreen} 2s infinite alternate;
  align-self: center;
  margin-top: 2rem;
  
  &:hover {
    background: rgba(0, 255, 0, 0.1);
    text-shadow: 0 0 8px #00ff00, 0 0 15px #00ff00, 0 0 25px #00ff00;
    box-shadow: 0 0 15px rgba(0, 255, 0, 0.6);
    transform: scale(1.05);
  }
`;

const SuccessMessage = styled.div`
  color: #00ff00;
  background: rgba(0, 255, 0, 0.1);
  border: 1px solid #00ff00;
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  margin-bottom: 1rem;
  text-shadow: 0 0 5px #00ff00;
`;

// SettingsPage Component
const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    notifications: true,
    soundEffects: true,
    backgroundMusic: false,
    theme: 'neon',
    language: 'en',
    difficulty: 'normal',
    displayName: 'Guest Player',
    autoSave: true
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSelectChange = (key: keyof typeof settings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleInputChange = (key: keyof typeof settings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    console.log('💾 Saving settings:', settings);
    
    // TODO: Implement actual save logic
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleBackClick = () => {
    console.log('👤 Navigating back to profile');
    navigate('/profile');
  };

  return (
    <Container>
      <Header>
        <BackButton onClick={handleBackClick}>
          ← PROFILE
        </BackButton>
        <Title>SETTINGS</Title>
        <div style={{ width: '120px' }}></div> {/* Spacer for centering */}
      </Header>

      {showSuccess && (
        <SuccessMessage>
          Settings saved successfully!
        </SuccessMessage>
      )}

      <SettingsContainer>
        {/* Game Settings */}
        <SettingsSection>
          <SectionTitle>🎮 Game Settings</SectionTitle>
          
          <SettingItem>
            <SettingLabel>
              Sound Effects
              <small>Enable game sound effects</small>
            </SettingLabel>
            <SettingControl>
              <Switch checked={settings.soundEffects}>
                <input 
                  type="checkbox" 
                  checked={settings.soundEffects}
                  onChange={() => handleToggle('soundEffects')}
                />
                <span></span>
              </Switch>
            </SettingControl>
          </SettingItem>

          <SettingItem>
            <SettingLabel>
              Background Music
              <small>Enable background music</small>
            </SettingLabel>
            <SettingControl>
              <Switch checked={settings.backgroundMusic}>
                <input 
                  type="checkbox" 
                  checked={settings.backgroundMusic}
                  onChange={() => handleToggle('backgroundMusic')}
                />
                <span></span>
              </Switch>
            </SettingControl>
          </SettingItem>

          <SettingItem>
            <SettingLabel>
              Difficulty Level
              <small>Game difficulty setting</small>
            </SettingLabel>
            <SettingControl>
              <Select 
                value={settings.difficulty}
                onChange={(e) => handleSelectChange('difficulty', e.target.value)}
              >
                <option value="easy">Easy</option>
                <option value="normal">Normal</option>
                <option value="hard">Hard</option>
                <option value="expert">Expert</option>
              </Select>
            </SettingControl>
          </SettingItem>

          <SettingItem>
            <SettingLabel>
              Auto Save
              <small>Automatically save game progress</small>
            </SettingLabel>
            <SettingControl>
              <Switch checked={settings.autoSave}>
                <input 
                  type="checkbox" 
                  checked={settings.autoSave}
                  onChange={() => handleToggle('autoSave')}
                />
                <span></span>
              </Switch>
            </SettingControl>
          </SettingItem>
        </SettingsSection>

        {/* Display Settings */}
        <SettingsSection>
          <SectionTitle>🎨 Display Settings</SectionTitle>
          
          <SettingItem>
            <SettingLabel>
              Theme
              <small>Visual theme for the interface</small>
            </SettingLabel>
            <SettingControl>
              <Select 
                value={settings.theme}
                onChange={(e) => handleSelectChange('theme', e.target.value)}
              >
                <option value="neon">Neon (Default)</option>
                <option value="classic">Classic Arcade</option>
                <option value="dark">Dark Mode</option>
                <option value="retro">Retro Green</option>
              </Select>
            </SettingControl>
          </SettingItem>

          <SettingItem>
            <SettingLabel>
              Language
              <small>Interface language</small>
            </SettingLabel>
            <SettingControl>
              <Select 
                value={settings.language}
                onChange={(e) => handleSelectChange('language', e.target.value)}
              >
                <option value="en">English</option>
                <option value="de">Deutsch</option>
                <option value="fr">Français</option>
                <option value="es">Español</option>
              </Select>
            </SettingControl>
          </SettingItem>
        </SettingsSection>

        {/* Account Settings */}
        <SettingsSection>
          <SectionTitle>👤 Account Settings</SectionTitle>
          
          <SettingItem>
            <SettingLabel>
              Display Name
              <small>Your public display name</small>
            </SettingLabel>
            <SettingControl>
              <Input 
                type="text"
                value={settings.displayName}
                onChange={(e) => handleInputChange('displayName', e.target.value)}
                placeholder="Enter display name"
              />
            </SettingControl>
          </SettingItem>

          <SettingItem>
            <SettingLabel>
              Notifications
              <small>Receive game notifications</small>
            </SettingLabel>
            <SettingControl>
              <Switch checked={settings.notifications}>
                <input 
                  type="checkbox" 
                  checked={settings.notifications}
                  onChange={() => handleToggle('notifications')}
                />
                <span></span>
              </Switch>
            </SettingControl>
          </SettingItem>
        </SettingsSection>

        <SaveButton onClick={handleSave}>
          💾 SAVE SETTINGS
        </SaveButton>
      </SettingsContainer>
    </Container>
  );
};

export default SettingsPage;