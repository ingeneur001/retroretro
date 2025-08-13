import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';

// Retro Animations
const neonPulse = keyframes`
  0% {
    text-shadow: 
      0 0 15px #00ffff,
      0 0 30px #00ffff,
      0 0 45px #00ffff;
  }
  100% {
    text-shadow: 
      0 0 8px #00ffff,
      0 0 15px #00ffff,
      0 0 25px #00ffff;
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
      0 0 20px rgba(0, 255, 255, 0.5),
      0 0 40px rgba(0, 255, 255, 0.3);
  }
  100% {
    box-shadow: 
      0 0 30px rgba(0, 255, 255, 0.8),
      0 0 60px rgba(0, 255, 255, 0.4);
  }
`;

// Styled Components
const Container = styled.div`
  font-family: 'Courier New', monospace;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  color: #ffffff;
  min-height: 100vh;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const BackButton = styled.button`
  position: absolute;
  top: 2rem;
  left: 2rem;
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

const LoginContainer = styled.div`
  background: rgba(0, 0, 0, 0.9);
  border: 4px solid #00ffff;
  border-radius: 15px;
  padding: 3rem;
  min-width: 400px;
  max-width: 500px;
  animation: ${boxGlow} 3s infinite alternate;

  @media (max-width: 768px) {
    min-width: auto;
    width: 90%;
    padding: 2rem;
  }
`;

const Title = styled.h1`
  font-size: 3rem;
  font-weight: bold;
  color: #00ffff;
  text-align: center;
  margin-bottom: 2rem;
  letter-spacing: 0.2rem;
  animation: ${neonPulse} 2s infinite alternate;

  @media (max-width: 768px) {
    font-size: 2.2rem;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  color: #00ffff;
  font-weight: bold;
  text-transform: uppercase;
  font-size: 0.9rem;
  text-shadow: 0 0 5px #00ffff;
`;

const Input = styled.input`
  background: rgba(0, 20, 40, 0.8);
  border: 2px solid #00ffff;
  border-radius: 8px;
  padding: 0.8rem;
  color: #ffffff;
  font-family: 'Courier New', monospace;
  font-size: 1rem;
  transition: all 0.3s ease;

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }

  &:focus {
    outline: none;
    border-color: #00ff88;
    box-shadow: 
      0 0 10px rgba(0, 255, 136, 0.5),
      inset 0 0 10px rgba(0, 255, 136, 0.2);
    background: rgba(0, 30, 60, 0.9);
  }
`;

const SubmitButton = styled.button`
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
  margin-top: 1rem;
  
  &:hover {
    background: rgba(0, 255, 0, 0.1);
    text-shadow: 0 0 8px #00ff00, 0 0 15px #00ff00, 0 0 25px #00ff00;
    box-shadow: 0 0 15px rgba(0, 255, 0, 0.6);
    transform: scale(1.05);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const LinkText = styled.p`
  text-align: center;
  margin-top: 1.5rem;
  color: #ffffff;
  
  a {
    color: #00ffff;
    text-decoration: none;
    font-weight: bold;
    cursor: pointer;
    text-shadow: 0 0 5px #00ffff;
    
    &:hover {
      text-shadow: 0 0 8px #00ffff, 0 0 15px #00ffff;
    }
  }
`;

const ErrorMessage = styled.div`
  color: #ff4444;
  background: rgba(255, 68, 68, 0.1);
  border: 1px solid #ff4444;
  border-radius: 5px;
  padding: 0.8rem;
  text-align: center;
  margin-bottom: 1rem;
  text-shadow: 0 0 5px #ff4444;
`;

// LoginPage Component
const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Basic validation
    if (!formData.email || !formData.password) {
      setError('All fields are required!');
      setIsLoading(false);
      return;
    }

    try {
      // TODO: Implement actual login logic
      console.log('🔐 Login attempt:', { email: formData.email });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For now, always succeed and navigate to profile
      console.log('✅ Login successful - navigating to profile');
      navigate('/profile');
      
    } catch (err) {
      console.error('❌ Login failed:', err);
      setError('Invalid email or password!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackClick = () => {
    console.log('🏠 Navigating back to home');
    navigate('/');
  };

  const handleRegisterClick = () => {
    console.log('📝 Navigating to register');
    navigate('/register');
  };

  return (
    <Container>
      <BackButton onClick={handleBackClick}>
        ← HOME
      </BackButton>

      <LoginContainer>
        <Title>LOGIN</Title>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Label htmlFor="email">Email Address</Label>
            <Input
              type="email"
              id="email"
              name="email"
              placeholder="player@retro.game"
              value={formData.email}
              onChange={handleInputChange}
              disabled={isLoading}
            />
          </InputGroup>

          <InputGroup>
            <Label htmlFor="password">Password</Label>
            <Input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
              disabled={isLoading}
            />
          </InputGroup>

          <SubmitButton type="submit" disabled={isLoading}>
            {isLoading ? 'LOGGING IN...' : 'LOGIN'}
          </SubmitButton>
        </Form>

        <LinkText>
          Don't have an account?{' '}
          <a onClick={handleRegisterClick}>
            Register here
          </a>
        </LinkText>
      </LoginContainer>
    </Container>
  );
};

export default LoginPage;