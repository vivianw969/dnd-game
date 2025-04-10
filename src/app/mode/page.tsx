'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { getCurrentUser } from '@/utils/supabase/client';

// Assuming these motion utilities are in this path
// If your project has a different structure, adjust this import
import { fadeIn, staggerContainer } from '@/utils/motion';

export default function GameModePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleStartNewGame = () => {
    setIsLoading(true);
    router.push('/character');
  };

  const handleLoadGame = () => {
    setIsLoading(true);
    router.push('/saves');
  };

  // Define standard CSS styles
  const styles = {
    container: {
      minHeight: '100vh',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #121212 0%, #2D1F3D 50%, #1E1E1E 100%)',
      color: '#ffffff',
      fontFamily: 'Roboto, "Segoe UI", Arial, sans-serif',
      position: 'relative',
      padding: '2rem 1rem',
    },
    backgroundElements: {
      position: 'fixed',
      inset: 0,
      zIndex: 0,
    },
    purpleGlow: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '33%',
      height: '66%',
      background: 'rgba(186, 104, 200, 0.1)',
      borderRadius: '50%',
      filter: 'blur(120px)',
    },
    tealGlow: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: '50%',
      height: '50%',
      background: 'rgba(0, 176, 155, 0.1)',
      borderRadius: '50%',
      filter: 'blur(120px)',
    },
    content: {
      maxWidth: '900px',
      margin: '0 auto',
      position: 'relative',
      zIndex: 10,
    },
    card: {
      background: 'rgba(30, 30, 30, 0.7)',
      backdropFilter: 'blur(10px)',
      borderRadius: '1rem',
      boxShadow: '0 15px 40px rgba(0, 0, 0, 0.3)',
      padding: '2.5rem',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      textAlign: 'center',
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      color: '#BB86FC',
      marginBottom: '2rem',
      letterSpacing: '-0.025em',
    },
    divider: {
      width: '6rem',
      height: '4px',
      background: '#BB86FC',
      borderRadius: '2px',
      margin: '1.5rem auto 3rem',
    },
    buttonsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1.5rem',
      maxWidth: '700px',
      margin: '0 auto',
    },
    buttonBase: {
      padding: '2rem',
      borderRadius: '1rem',
      color: 'white',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
    },
    newGameButton: {
      background: 'linear-gradient(135deg, #8E24AA 0%, #BB86FC 100%)',
      boxShadow: '0 10px 30px rgba(187, 134, 252, 0.3)',
    },
    loadGameButton: {
      background: 'linear-gradient(135deg, #00897B 0%, #03DAC6 100%)',
      boxShadow: '0 10px 30px rgba(3, 218, 198, 0.3)',
    },
    buttonTitle: {
      fontSize: '1.5rem',
      fontWeight: '600',
      marginBottom: '0.75rem',
    },
    buttonDescription: {
      opacity: '0.8',
    },
    buttonDisabled: {
      opacity: '0.5',
      cursor: 'not-allowed',
    },
    buttonShine: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
      transform: 'translateX(-100%)',
    }
  };

  return (
    <div style={styles.container}>
      {/* Background Elements */}
      <div style={styles.backgroundElements}>
        <div style={styles.purpleGlow}></div>
        <div style={styles.tealGlow}></div>
      </div>

      <motion.div
        variants={staggerContainer()}
        initial="hidden"
        animate="show"
        style={styles.content}
      >
        <motion.div
          variants={fadeIn('up', 'tween', 0.2, 1)}
          style={styles.card}
        >
          <motion.h1 
            variants={fadeIn('up', 'tween', 0.3, 1)}
            style={styles.title}
          >
            Choose Your Adventure
          </motion.h1>

          <motion.div 
            variants={fadeIn('up', 'tween', 0.4, 1)} 
            style={styles.divider}
          />
          
          <motion.div
            variants={fadeIn('up', 'tween', 0.5, 1)}
            style={styles.buttonsGrid}
          >
            <motion.button
              onClick={handleStartNewGame}
              disabled={isLoading}
              style={{
                ...styles.buttonBase,
                ...styles.newGameButton,
                ...(isLoading ? styles.buttonDisabled : {})
              }}
              whileHover={!isLoading ? { 
                y: -5, 
                boxShadow: '0 15px 30px rgba(187, 134, 252, 0.4)'
              } : {}}
              whileTap={!isLoading ? { scale: 0.98 } : {}}
            >
              <h2 style={styles.buttonTitle}>Start New Game</h2>
              <p style={styles.buttonDescription}>Begin a new parenting journey</p>
              
              {/* Shine effect */}
              <motion.div
                style={styles.buttonShine}
                animate={{ 
                  x: ['100%', '200%'],
                  transition: { repeat: Infinity, duration: 3, ease: 'linear' }
                }}
              />
            </motion.button>

            <motion.button
              onClick={handleLoadGame}
              disabled={isLoading}
              style={{
                ...styles.buttonBase,
                ...styles.loadGameButton,
                ...(isLoading ? styles.buttonDisabled : {})
              }}
              whileHover={!isLoading ? { 
                y: -5, 
                boxShadow: '0 15px 30px rgba(3, 218, 198, 0.4)'
              } : {}}
              whileTap={!isLoading ? { scale: 0.98 } : {}}
            >
              <h2 style={styles.buttonTitle}>Load Game</h2>
              <p style={styles.buttonDescription}>Continue your previous adventure</p>
              
              {/* Shine effect */}
              <motion.div
                style={styles.buttonShine}
                animate={{ 
                  x: ['100%', '200%'],
                  transition: { repeat: Infinity, duration: 3, ease: 'linear', delay: 1.5 }
                }}
              />
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}