import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import '../styles/DiceRoll.css';

interface DiceRollProps {
  isRolling: boolean;
  diceValue: number | null;
}

const DiceRoll = ({ isRolling, diceValue }: DiceRollProps) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [currentFace, setCurrentFace] = useState<number | null>(null);
  const [isRollingState, setIsRollingState] = useState(false);

  // Update current face when dice value changes
  useEffect(() => {
    if (diceValue !== null) {
      setCurrentFace(diceValue);
    }
  }, [diceValue]);

  // Update rolling state when isRolling changes
  useEffect(() => {
    if (isRolling) {
      setIsRollingState(true);
      // Reset state after rolling ends
      const timer = setTimeout(() => {
        setIsRollingState(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isRolling]);

  // Generate 20-sided dice
  const renderFaces = () => {
    const faces = [];
    for (let i = 1; i <= 20; i++) {
      faces.push(
        <figure 
          key={i} 
          className="face" 
          data-value={i}
        />
      );
    }
    return faces;
  };

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        margin: '2rem 0',
        height: '200px',
        position: 'relative'
      }}
    >
      <div 
        style={{ position: 'relative' }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <div className="dice-container">
          <div 
            className={`die ${isRollingState ? 'rolling' : ''}`}
            data-face={currentFace || undefined}
          >
            {renderFaces()}
          </div>
        </div>
        
        {/* Dice Tooltip */}
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="dice-tooltip"
          >
            <h3>Dice Mechanism</h3>
            <p>When you choose an action, the system rolls a 20-sided dice to determine the outcome:</p>
            <div className="highlight">
              <div className="result-row">
                <span className="result-indicator success">Yes!</span>
                <span className="result-text">11-20: Action Success</span>
              </div>
              <div className="result-row">
                <span className="result-indicator failure">Oh no!</span>
                <span className="result-text">1-10: Action Failure</span>
              </div>
            </div>
            <p>Success increases attributes, failure decreases them.</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default DiceRoll; 