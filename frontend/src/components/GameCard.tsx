// GameCard.tsx - Funktionsfähige Version ohne styled-components
interface GameCardProps {
  icon: string;
  title: string;
  description: string;
  buttonText: string;
  onPlay: () => void;
}

const GameCard = ({ 
  icon, 
  title, 
  description, 
  buttonText, 
  onPlay 
}: GameCardProps) => {
  
  return (
    <div 
      style={{
        background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)',
        border: '2px solid #00ffff',
        borderRadius: '10px',
        padding: '20px',
        textAlign: 'center',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'default',
        minHeight: '200px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-10px)';
        e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 255, 255, 0.5)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Animated background effect */}
      <div 
        style={{
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: 'linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
          transform: 'rotate(45deg)',
          transition: 'all 0.5s',
          opacity: 0,
          pointerEvents: 'none'
        }} 
      />
      
      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <h3 style={{
          color: '#00ffff',
          marginBottom: '10px',
          fontSize: '1.2rem',
          fontWeight: '700',
          margin: '0 0 10px 0'
        }}>
          {icon} {title}
        </h3>
        
        <p style={{
          color: '#cccccc',
          fontSize: '0.9rem',
          lineHeight: '1.4',
          marginBottom: '20px',
          margin: '0 0 20px 0'
        }}>
          {description}
        </p>
      </div>
      
      {/* START Button */}
      <button 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onPlay();
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'linear-gradient(45deg, #f7931e, #ff6b35)';
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 5px 15px rgba(255, 107, 53, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'linear-gradient(45deg, #ff6b35, #f7931e)';
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = 'none';
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.transform = 'scale(0.95)';
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        style={{
          background: 'linear-gradient(45deg, #ff6b35, #f7931e)',
          border: 'none',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '25px',
          fontFamily: 'Orbitron, monospace',
          fontWeight: '700',
          fontSize: '1rem',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          position: 'relative',
          zIndex: 2,
          outline: 'none',
          width: 'auto',
          alignSelf: 'center'
        }}
      >
        {buttonText}
      </button>
    </div>
  );
};

export default GameCard;