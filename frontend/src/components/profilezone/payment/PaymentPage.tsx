import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';

// Retro Animations
const neonPulse = keyframes`
  0% {
    text-shadow: 
      0 0 15px #00ff88,
      0 0 30px #00ff88,
      0 0 45px #00ff88;
  }
  100% {
    text-shadow: 
      0 0 8px #00ff88,
      0 0 15px #00ff88,
      0 0 25px #00ff88;
  }
`;

const neonPulseGold = keyframes`
  0% {
    text-shadow: 
      0 0 10px #ffd700,
      0 0 20px #ffd700,
      0 0 30px #ffd700;
  }
  100% {
    text-shadow: 
      0 0 5px #ffd700,
      0 0 10px #ffd700,
      0 0 15px #ffd700;
  }
`;

const boxGlow = keyframes`
  0% {
    box-shadow: 
      0 0 20px rgba(0, 255, 136, 0.5),
      0 0 40px rgba(0, 255, 136, 0.3);
    border-color: #00ff88;
  }
  100% {
    box-shadow: 
      0 0 30px rgba(0, 255, 136, 0.8),
      0 0 60px rgba(0, 255, 136, 0.4);
    border-color: #00ff88;
  }
`;

const coinSpin = keyframes`
  0% { transform: rotateY(0deg); }
  100% { transform: rotateY(360deg); }
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
  color: #00ff88;
  text-align: center;
  letter-spacing: 0.2rem;
  animation: ${neonPulse} 2s infinite alternate;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 2.2rem;
  }
`;

const PaymentContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Section = styled.div`
  background: rgba(0, 0, 0, 0.9);
  border: 4px solid #00ff88;
  border-radius: 15px;
  padding: 2rem;
  animation: ${boxGlow} 3s infinite alternate;
`;

const SectionTitle = styled.h2`
  color: #00ff88;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  text-transform: uppercase;
  text-shadow: 0 0 5px #00ff88, 0 0 10px #00ff88;
`;

const CreditPackage = styled.div<{ featured?: boolean }>`
  background: ${props => props.featured ? 
    'linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 215, 0, 0.1))' : 
    'rgba(0, 20, 40, 0.5)'
  };
  border: 2px solid ${props => props.featured ? '#ffd700' : '#00ff88'};
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    transform: scale(1.02);
    box-shadow: 0 0 20px ${props => props.featured ? 
      'rgba(255, 215, 0, 0.5)' : 
      'rgba(0, 255, 136, 0.5)'
    };
  }
  
  ${props => props.featured && `
    &:before {
      content: "⭐ BEST VALUE";
      position: absolute;
      top: -10px;
      right: 10px;
      background: #ffd700;
      color: #000;
      padding: 0.3rem 0.8rem;
      border-radius: 15px;
      font-size: 0.8rem;
      font-weight: bold;
    }
  `}
`;

const PackageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const CreditAmount = styled.div<{ featured?: boolean }>`
  font-size: 2rem;
  font-weight: bold;
  color: ${props => props.featured ? '#ffd700' : '#00ff88'};
  animation: ${props => props.featured ? neonPulseGold : 'none'} 2s infinite alternate;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:before {
    content: "🪙";
    font-size: 1.5rem;
    animation: ${coinSpin} 3s linear infinite;
  }
`;

const Price = styled.div<{ featured?: boolean }>`
  font-size: 1.5rem;
  color: ${props => props.featured ? '#ffd700' : '#ffffff'};
  font-weight: bold;
`;

const PackageDescription = styled.p`
  color: rgba(255, 255, 255, 0.8);
  margin: 0.5rem 0;
  font-size: 0.9rem;
`;

const BuyButton = styled.button<{ featured?: boolean }>`
  width: 100%;
  background: transparent;
  border: 2px solid ${props => props.featured ? '#ffd700' : '#00ff88'};
  color: ${props => props.featured ? '#ffd700' : '#00ff88'};
  padding: 0.8rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  margin-top: 1rem;
  
  &:hover {
    background: ${props => props.featured ? 
      'rgba(255, 215, 0, 0.1)' : 
      'rgba(0, 255, 136, 0.1)'
    };
    transform: scale(1.05);
    box-shadow: 0 0 15px ${props => props.featured ? 
      'rgba(255, 215, 0, 0.6)' : 
      'rgba(0, 255, 136, 0.6)'
    };
  }
`;

const CurrentBalance = styled.div`
  background: rgba(0, 30, 60, 0.8);
  border: 2px solid #00ffff;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  margin-bottom: 2rem;
`;

const BalanceAmount = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  color: #00ffff;
  margin: 0.5rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  &:before {
    content: "🪙";
    font-size: 2rem;
    animation: ${coinSpin} 3s linear infinite;
  }
`;

const TransactionHistory = styled.div`
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid rgba(0, 255, 136, 0.3);
  border-radius: 8px;
  padding: 1rem;
`;

const Transaction = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  &:last-child {
    border-bottom: none;
  }
`;

const TransactionType = styled.span<{ type: 'purchase' | 'spent' }>`
  color: ${props => props.type === 'purchase' ? '#00ff88' : '#ff8888'};
  font-weight: bold;
`;

const PaymentMethods = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const PaymentMethod = styled.div`
  background: rgba(0, 20, 40, 0.8);
  border: 2px solid #00ff88;
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #00ffff;
    box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
    transform: scale(1.05);
  }
`;

// PaymentPage Component
const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentBalance] = useState(1250); // Mock balance
  const [transactions] = useState([
    { id: 1, type: 'purchase' as const, amount: 500, description: 'Credits Purchase', date: '2025-08-10' },
    { id: 2, type: 'spent' as const, amount: -50, description: 'Snake Game Premium', date: '2025-08-09' },
    { id: 3, type: 'purchase' as const, amount: 1000, description: 'Mega Pack', date: '2025-08-08' },
    { id: 4, type: 'spent' as const, amount: -200, description: 'Multiplayer Tournament', date: '2025-08-07' },
  ]);

  const creditPackages = [
    {
      id: 1,
      credits: 100,
      price: '$1.99',
      description: 'Perfect for casual gaming',
      featured: false
    },
    {
      id: 2,
      credits: 500,
      price: '$7.99',
      description: 'Great value for regular players',
      featured: false
    },
    {
      id: 3,
      credits: 1000,
      price: '$12.99',
      description: 'Best value! Save 35%',
      featured: true
    },
    {
      id: 4,
      credits: 2500,
      price: '$24.99',
      description: 'Ultimate gaming package',
      featured: false
    }
  ];

  const handlePurchase = (packageId: number, credits: number, price: string) => {
    console.log(`💳 Purchasing ${credits} credits for ${price}`);
    // TODO: Implement actual payment logic
    alert(`Purchase initiated: ${credits} credits for ${price}`);
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
        <Title>PAYMENT</Title>
        <div style={{ width: '120px' }}></div>
      </Header>

      <PaymentContainer>
        {/* Left Column - Credit Packages */}
        <Section>
          <SectionTitle>💰 Buy Credits</SectionTitle>
          
          <CurrentBalance>
            <div style={{ color: '#00ffff', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              CURRENT BALANCE
            </div>
            <BalanceAmount>{currentBalance}</BalanceAmount>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
              Available Credits
            </div>
          </CurrentBalance>

          {creditPackages.map(pkg => (
            <CreditPackage key={pkg.id} featured={pkg.featured}>
              <PackageHeader>
                <CreditAmount featured={pkg.featured}>
                  {pkg.credits}
                </CreditAmount>
                <Price featured={pkg.featured}>{pkg.price}</Price>
              </PackageHeader>
              <PackageDescription>{pkg.description}</PackageDescription>
              <BuyButton 
                featured={pkg.featured}
                onClick={() => handlePurchase(pkg.id, pkg.credits, pkg.price)}
              >
                Buy Now
              </BuyButton>
            </CreditPackage>
          ))}

          <SectionTitle style={{ marginTop: '2rem' }}>💳 Payment Methods</SectionTitle>
          <PaymentMethods>
            <PaymentMethod>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>💳</div>
              <div style={{ fontSize: '0.8rem' }}>Credit Card</div>
            </PaymentMethod>
            <PaymentMethod>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🏦</div>
              <div style={{ fontSize: '0.8rem' }}>PayPal</div>
            </PaymentMethod>
            <PaymentMethod>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>₿</div>
              <div style={{ fontSize: '0.8rem' }}>Crypto</div>
            </PaymentMethod>
            <PaymentMethod>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📱</div>
              <div style={{ fontSize: '0.8rem' }}>Mobile</div>
            </PaymentMethod>
          </PaymentMethods>
        </Section>

        {/* Right Column - Transaction History */}
        <Section>
          <SectionTitle>📊 Transaction History</SectionTitle>
          
          <TransactionHistory>
            {transactions.map(transaction => (
              <Transaction key={transaction.id}>
                <div>
                  <div style={{ fontWeight: 'bold', marginBottom: '0.2rem' }}>
                    {transaction.description}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>
                    {transaction.date}
                  </div>
                </div>
                <TransactionType type={transaction.type}>
                  {transaction.amount > 0 ? '+' : ''}{transaction.amount} 🪙
                </TransactionType>
              </Transaction>
            ))}
          </TransactionHistory>

          <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: 'rgba(0,255,136,0.1)', borderRadius: '8px', border: '1px solid rgba(0,255,136,0.3)' }}>
            <h3 style={{ color: '#00ff88', margin: '0 0 1rem 0' }}>💡 What are Credits?</h3>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'rgba(255,255,255,0.8)' }}>
              <li>Unlock premium game features</li>
              <li>Access exclusive tournaments</li>
              <li>Customize your gaming experience</li>
              <li>Boost your scores and achievements</li>
              <li>Never expire - use them anytime!</li>
            </ul>
          </div>
        </Section>
      </PaymentContainer>
    </Container>
  );
};

export default PaymentPage;