'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

// Assuming these are imported from your utils/motion.ts
const fadeIn = (direction: string, type: string, delay: number, duration: number) => ({
  hidden: {
    opacity: 0,
    x: direction === 'left' ? 100 : direction === 'right' ? -100 : 0,
    y: direction === 'up' ? 100 : direction === 'down' ? -100 : 0,
  },
  show: {
    opacity: 1,
    x: 0,
    y: 0,
    transition: {
      type,
      delay,
      duration,
      ease: 'easeOut',
    },
  },
});

const staggerContainer = (staggerChildren?: number, delayChildren?: number) => ({
  hidden: {},
  show: {
    transition: {
      staggerChildren,
      delayChildren,
    },
  },
});

const parentingStyles = [
  { id: 'authoritative', name: 'Authoritative', description: 'High responsiveness, high demands. Sets clear rules and expectations while being warm and supportive.', color: '#BB86FC', icon: '👨‍👩‍👧‍👦' },
  { id: 'authoritarian', name: 'Authoritarian', description: 'High demands, low responsiveness. Strict rules with little room for negotiation.', color: '#CF6679', icon: '👮' },
  { id: 'permissive', name: 'Permissive', description: 'High responsiveness, low demands. Few rules and high warmth.', color: '#03DAC6', icon: '🤗' },
  { id: 'uninvolved', name: 'Uninvolved', description: 'Low responsiveness, low demands. Minimal interaction and few rules.', color: '#8D8D8D', icon: '🧘' },
];

const familyBackgrounds = [
  { id: 'middle-class', name: 'Middle Class', description: 'Stable income, comfortable lifestyle, emphasis on education and personal development.', color: '#BB86FC', icon: '🏠' },
  { id: 'working-class', name: 'Working Class', description: 'Modest income, practical values, emphasis on hard work and responsibility.', color: '#03DAC6', icon: '🛠️' },
  { id: 'upper-class', name: 'Upper Class', description: 'Wealthy background, access to resources, emphasis on achievement and status.', color: '#CF6679', icon: '💎' },
  { id: 'immigrant', name: 'Immigrant Family', description: 'Cultural diversity, strong family ties, emphasis on tradition and adaptation.', color: '#8D8D8D', icon: '🌏' },
];

export default function CharacterInit() {
  const router = useRouter();
  const [step, setStep] = useState<'parenting' | 'background'>('parenting');
  const [selectedParenting, setSelectedParenting] = useState<string>('');
  const [selectedBackground, setSelectedBackground] = useState<string>('');

  const handleParentingSelect = (style: string) => {
    setSelectedParenting(style);
    setStep('background');
  };

  const handleBackgroundSelect = (background: string) => {
    setSelectedBackground(background);
    // Build query params and navigate to game page
    const queryParams = new URLSearchParams({
      parentingStyle: selectedParenting,
      familyBackground: background
    });
    router.push(`/game?${queryParams.toString()}`);
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
    },
    header: {
      textAlign: 'center',
      marginBottom: '2.5rem',
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      color: '#BB86FC',
      marginBottom: '0.75rem',
      letterSpacing: '-0.025em',
    },
    subtitle: {
      fontSize: '1.125rem',
      color: '#E1E1E1',
      maxWidth: '700px',
      margin: '0 auto',
      lineHeight: 1.6,
    },
    divider: {
      width: '6rem',
      height: '4px',
      background: '#BB86FC',
      borderRadius: '2px',
      margin: '1.5rem auto 3rem',
    },
    optionsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '1.5rem',
      width: '100%',
    },
    optionCard: {
      padding: '2rem',
      borderRadius: '1rem',
      border: '2px solid transparent',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      position: 'relative',
      overflow: 'hidden',
      background: 'rgba(30, 30, 30, 0.5)',
    },
    optionIcon: {
      fontSize: '2.5rem',
      marginBottom: '1rem',
      display: 'block',
    },
    optionTitle: {
      fontSize: '1.5rem',
      fontWeight: '600',
      marginBottom: '0.75rem',
    },
    optionDescription: {
      color: '#E1E1E1',
      fontSize: '0.95rem',
      lineHeight: 1.6,
    },
    backButton: {
      background: 'transparent',
      border: 'none',
      color: '#BB86FC',
      fontSize: '1rem',
      fontWeight: '500',
      padding: '0.75rem 1.5rem',
      margin: '3rem auto 0',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s ease',
    },
    backButtonText: {
      marginLeft: '0.5rem',
    },
    progressBar: {
      width: '100%',
      height: '4px',
      background: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '2px',
      marginBottom: '3rem',
      position: 'relative',
    },
    progressIndicator: {
      position: 'absolute',
      height: '100%',
      borderRadius: '2px',
      background: '#BB86FC',
      transition: 'width 0.3s ease',
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
          {/* Progress Bar */}
          <div style={styles.progressBar}>
            <div style={{
              ...styles.progressIndicator,
              width: step === 'parenting' ? '50%' : '100%'
            }}></div>
          </div>
          
          <div style={styles.header}>
            <motion.h1 
              variants={fadeIn('up', 'tween', 0.3, 1)}
              style={styles.title}
            >
              {step === 'parenting' ? 'Choose Your Parenting Style' : 'Select Your Family Background'}
            </motion.h1>
            <motion.p
              variants={fadeIn('up', 'tween', 0.4, 1)}
              style={styles.subtitle}
            >
              {step === 'parenting' 
                ? 'Your parenting style will influence how you interact with your child and the outcomes of your decisions.'
                : 'Your family background will shape your character\'s values and available resources.'}
            </motion.p>
            
            <motion.div 
              variants={fadeIn('up', 'tween', 0.5, 1)} 
              style={styles.divider}
            />
          </div>

          <motion.div
            variants={fadeIn('up', 'tween', 0.6, 1)}
            style={styles.optionsGrid}
          >
            {(step === 'parenting' ? parentingStyles : familyBackgrounds).map((item, index) => (
              <motion.div
                key={item.id}
                variants={fadeIn('up', 'spring', 0.6 + (index * 0.1), 0.75)}
                onClick={() => step === 'parenting' ? handleParentingSelect(item.id) : handleBackgroundSelect(item.id)}
                style={{
                  ...styles.optionCard,
                  borderColor: (step === 'parenting' ? selectedParenting : selectedBackground) === item.id
                    ? item.color
                    : 'transparent',
                  boxShadow: (step === 'parenting' ? selectedParenting : selectedBackground) === item.id
                    ? `0 10px 30px ${item.color}30`
                    : 'none',
                }}
                whileHover={{
                  borderColor: item.color,
                  boxShadow: `0 10px 30px ${item.color}30`,
                  transform: 'translateY(-5px)'
                }}
                whileTap={{ transform: 'scale(0.98)' }}
              >
                <span style={styles.optionIcon}>{item.icon}</span>
                <h3 style={{...styles.optionTitle, color: item.color}}>{item.name}</h3>
                <p style={styles.optionDescription}>{item.description}</p>
              </motion.div>
            ))}
          </motion.div>

          {step === 'background' && (
            <motion.button
              variants={fadeIn('up', 'tween', 0.7, 1)}
              onClick={() => setStep('parenting')}
              style={styles.backButton}
              whileHover={{ color: '#9965DA' }}
            >
              ← <span style={styles.backButtonText}>Back to Parenting Style</span>
            </motion.button>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}