import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';

// Retro Animations
const neonPulse = keyframes`
  0% {
    text-shadow: 
      0 0 15px #ff00ff,
      0 0 30px #ff00ff,
      0 0 45px #ff00ff;
  }
  100% {
    text-shadow: 
      0 0 8px #ff00ff,
      0 0 15px #ff00ff,
      0 0 25px #ff00ff;
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
      0 0 20px rgba(255, 0, 255, 0.5),
      0 0 40px rgba(255, 0, 255, 0.3);
    border-color: #ff00ff;
  }
  100% {
    box-shadow: 
      0 0 30px rgba(255, 0, 255, 0.8),
      0 0 60px rgba(255, 0, 255, 0.4);
    border-color: #ff00ff;
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

const RegisterContainer = styled.div`
  background: rgba(0, 0, 0, 0.9);
  border: 4px solid #ff00ff;
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
  color: #ff00ff;
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
  gap: 1.2rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  color: #ff00ff;
  font-weight: bold;
  text-transform: uppercase;
  font-size: 0.9rem;
  text-shadow: 0 0 5px #ff00ff;
`;

const Input = styled.input`
  background: rgba(0, 20, 40, 0.8);
  border: 2px solid #ff00ff;
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
    border-color: #ff8800;
    box-shadow: 
      0 0 10px rgba(255, 136, 0, 0.5),
      inset 0 0 10px rgba(255, 136, 0, 0.2);
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

const SuccessMessage = styled.div`
  color: #00ff00;
  background: rgba(0, 255, 0, 0.1);
  border: 1px solid #00ff00;
  border-radius: 5px;
  padding: 0.8rem;
  text-align: center;
  margin-bottom: 1rem;
  text-shadow: 0 0 5px #00ff00;
`;

// RegisterPage Component
const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear messages when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const validateForm = () => {
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      return 'All fields are required!';
    }
    
    if (formData.username.length < 3) {
      return 'Username must be at least 3 characters!';
    }
    
    if (formData.password.length < 6) {
      return 'Password must be at least 6 characters!';
    }
    
    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match!';
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return 'Please enter a valid email address!';
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setIsLoading(false);
      return;
    }

    try {
      // TODO: Implement actual registration logic
      console.log('📝 Registration attempt:', { 
        username: formData.username, 
        email: formData.email 
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For now, always succeed
      setSuccess('Registration successful! Redirecting to login...');
      console.log('✅ Registration successful');
      
      // Redirect to login after success
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (err) {
      console.error('❌ Registration failed:', err);
      setError('Registration failed! Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackClick = () => {
    console.log('🏠 Navigating back to home');
    navigate('/');
  };

  const handleLoginClick = () => {
    console.log('🔐 Navigating to login');
    navigate('/login');
  };

  return (
    <Container>
      <BackButton onClick={handleBackClick}>
        ← HOME
      </BackButton>

      <RegisterContainer>
        <Title>REGISTER</Title>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}
        
        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Label htmlFor="username">Username</Label>
            <Input
              type="text"
              id="username"
              name="username"
              placeholder="Choose a cool username"
              value={formData.username}
              onChange={handleInputChange}
              disabled={isLoading}
            />
          </InputGroup>

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
              placeholder="Create a strong password"
              value={formData.password}
              onChange={handleInputChange}
              disabled={isLoading}
            />
          </InputGroup>

          <InputGroup>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              disabled={isLoading}
            />
          </InputGroup>

          <SubmitButton type="submit" disabled={isLoading}>
            {isLoading ? 'CREATING ACCOUNT...' : 'REGISTER'}
          </SubmitButton>
        </Form>

        <LinkText>
          Already have an account?{' '}
          <a onClick={handleLoginClick}>
            Login here
          </a>
        </LinkText>
      </RegisterContainer>
    </Container>
  );
};

export default RegisterPage;