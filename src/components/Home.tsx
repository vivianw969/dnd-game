'use client';

import Link from 'next/link';
import { motion, MotionStyle } from 'framer-motion';
import { fadeIn, slideIn, staggerContainer, textVariant } from '../utils/motion';
import { CSSProperties, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface StatBarProps {
  label: string;
  value: number;
  color: string;
}

interface ActionButtonProps {
  action: {
    id: string;
    description: string;
    requiredAttribute?: string;
  };
  onClick: () => void;
  disabled: boolean;
}

interface EffectDisplayProps {
  label: string;
  value: number;
  color: string;
}

interface DiceRollProps {
  isRolling: boolean;
  diceValue: number | null;
}

// Separate component for stats display
const StatBar = ({ label, value, color }: StatBarProps) => (
  <div className={`bg-${color}-50 p-4 rounded-lg`}>
    <h3 className={`text-sm font-semibold text-${color}-800 mb-1`}>{label}</h3>
    <div className="flex items-center">
      <div className={`w-full bg-${color}-200 rounded-full h-2.5`}>
        <div 
          className={`bg-${color}-500 h-2.5 rounded-full`} 
          style={{ width: `${((value + 100) / 200) * 100}%` }}
        ></div>
      </div>
      <span className={`ml-2 text-sm font-medium text-${color}-800`}>{value}</span>
    </div>
  </div>
);

// Action button component
const ActionButton = ({ action, onClick, disabled }: ActionButtonProps) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow text-left hover:bg-gray-50"
  >
    <p className="font-medium text-gray-800">{action.description}</p>
    {action.requiredAttribute && (
      <p className="text-sm text-gray-500 mt-1">
        Requires: {action.requiredAttribute}
      </p>
    )}
  </button>
);

// Effect display component for action results
const EffectDisplay = ({ label, value, color }: EffectDisplayProps) => (
  <div className={`bg-${color}-50 p-3 rounded-lg`}>
    <p className={`text-sm text-${color}-800`}>
      {label}: {value > 0 ? '+' : ''}{value}
    </p>
  </div>
);

// Dice rolling animation component
const DiceRoll = ({ isRolling, diceValue }: DiceRollProps) => (
  <div className="flex flex-col items-center justify-center my-4">
    <div className={`w-16 h-16 rounded-lg border-2 border-gray-300 flex items-center justify-center ${isRolling ? 'animate-bounce' : ''}`}>
      <span className="text-2xl font-bold">{diceValue || '?'}</span>
    </div>
    {isRolling && <p className="mt-2 text-gray-600">Rolling...</p>}
  </div>
);

// Add floating icons component
const FloatingIcons = () => {
  const icons = ['🎮', '🎲', '📚', '🌟', '🎯', '🎨'];
  return (
    <div style={{ position: 'absolute', width: '100%', height: '100%', overflow: 'hidden', pointerEvents: 'none' }}>
      {icons.map((icon, index) => (
        <motion.div
          key={index}
          initial={{ 
            x: Math.random() * window.innerWidth,
            y: -50,
            opacity: 0,
            scale: 0.8 + Math.random() * 0.4
          }}
          animate={{
            y: window.innerHeight + 50,
            x: [
              Math.random() * window.innerWidth,
              Math.random() * window.innerWidth,
              Math.random() * window.innerWidth
            ],
            opacity: [0, 1, 1, 0],
            rotate: [0, 360]
          }}
          transition={{
            duration: 8 + Math.random() * 7,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "easeInOut"
          }}
          style={{
            position: 'absolute',
            fontSize: '2rem',
            zIndex: 1
          }}
        >
          {icon}
        </motion.div>
      ))}
    </div>
  );
};

// Navigation component
const Navigation = () => {
  const router = useRouter();
  
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={fadeIn('down', 'tween', 0.1, 1)}
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        padding: '1.5rem',
        zIndex: 20,
        display: 'flex',
        gap: '1rem',
        pointerEvents: 'auto'
      }}
    >
      <motion.button
        onClick={() => {
          console.log('Navigating to login...');
          router.push('/login');
        }}
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          color: '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          padding: '0.5rem 1rem',
          borderRadius: '0.5rem',
          cursor: 'pointer',
          fontSize: '0.875rem',
          fontWeight: 500,
          position: 'relative',
          zIndex: 21
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Sign In
      </motion.button>
      <motion.button
        onClick={() => {
          console.log('Navigating to signup...');
          router.push('/login?signup=true');
        }}
        style={{
          background: 'linear-gradient(90deg, #BB86FC, #03DAC6)',
          color: '#000000',
          border: 'none',
          padding: '0.5rem 1rem',
          borderRadius: '0.5rem',
          cursor: 'pointer',
          fontSize: '0.875rem',
          fontWeight: 500,
          position: 'relative',
          zIndex: 21
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Sign Up
      </motion.button>
    </motion.div>
  );
};

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const styles = {
    container: {
      minHeight: '100vh',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #121212 0%, #2D1F3D 50%, #1E1E1E 100%)',
      color: '#ffffff',
      fontFamily: 'Roboto, "Segoe UI", Arial, sans-serif',
      position: 'relative' as const,
    } as CSSProperties,
    backgroundImage: {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover' as const,
      opacity: 0.25,
      zIndex: 0,
    } as CSSProperties,
    backgroundElements: {
      position: 'fixed' as const,
      inset: 0,
      zIndex: 0,
      pointerEvents: 'none',  
    } as CSSProperties,
    purpleGlow: {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      width: '33%',
      height: '66%',
      background: 'rgba(186, 104, 200, 0.1)',
      borderRadius: '50%',
      filter: 'blur(120px)',
    } as CSSProperties,
    tealGlow: {
      position: 'absolute' as const,
      bottom: 0,
      right: 0,
      width: '50%',
      height: '50%',
      background: 'rgba(0, 176, 155, 0.1)',
      borderRadius: '50%',
      filter: 'blur(120px)',
    } as CSSProperties,
    section: {
      padding: '2rem 1.5rem', // Reduced from 3rem to 2rem
      position: 'relative' as const,
      zIndex: 10,
      maxWidth: '1200px',
      margin: '0 auto',
    } as CSSProperties,
    heroContainer: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '0.5rem', // Reduced from 1rem to 0.5rem
    } as CSSProperties,
    mainTitle: {
      fontSize: 'clamp(3rem, 10vw, 5rem)',
      fontWeight: 'bold',
      color: '#BB86FC',
      textAlign: 'center' as const,
      marginBottom: '0',
      letterSpacing: '-0.025em',
    } as MotionStyle,
    subTitle: {
      fontSize: 'clamp(2.5rem, 8vw, 4rem)',
      fontWeight: 'bold',
      color: '#03DAC6',
      textAlign: 'center' as const,
      marginBottom: '0.5rem', // Reduced from 1rem to 0.5rem
      letterSpacing: '-0.025em',
    } as MotionStyle,
    divider: {
      width: '6rem',
      height: '4px',
      background: '#BB86FC',
      borderRadius: '2px',
      margin: '0.5rem 0', // Reduced from 1rem to 0.5rem
    },
    description: {
      fontSize: '1.25rem',
      textAlign: 'center' as const,
      maxWidth: '600px',
      margin: '0 auto',
      color: '#E1E1E1',
      lineHeight: 1.6,
    } as MotionStyle,
    buttonContainer: {
      display: 'flex',
      justifyContent: 'center',
      marginTop: '1.5rem', // Reduced from 2rem to 1.5rem
    } as CSSProperties,
    button: {
      background: '#BB86FC',
      color: '#121212',
      fontSize: '1.125rem',
      fontWeight: 500,
      padding: '1rem 2rem',
      borderRadius: '0.5rem',
      minWidth: '200px',
      textAlign: 'center',
      boxShadow: '0 4px 20px rgba(187, 134, 252, 0.3)',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      textDecoration: 'none',
      display: 'inline-block',
    } as CSSProperties,
    featuresGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '1.5rem', // Reduced from 2rem to 1.5rem
      marginTop: '3rem', // Reduced from 4rem to 3rem
      width: '100%',
    } as CSSProperties,
    featureCard: {
      padding: '1.5rem', // Reduced from 2rem to 1.5rem
      borderRadius: '1rem',
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      textAlign: 'center' as const,
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      border: '1px solid #2D2D2D',
      position: 'relative' as const,
      overflow: 'hidden',
    } as MotionStyle,
    featureIcon: {
      fontSize: '2.5rem', // Reduced from 3rem to 2.5rem
      marginBottom: '0.75rem', // Reduced from 1rem to 0.75rem
    } as CSSProperties,
    featureTitle: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      marginBottom: '0.75rem', // Reduced from 1rem to 0.75rem
    } as CSSProperties,
    featureDescription: {
      color: '#E1E1E1',
      lineHeight: 1.6,
    } as CSSProperties,
    footer: {
      marginTop: '3rem', // Reduced from 4rem to 3rem
      fontSize: '0.875rem',
      color: '#777777',
      textAlign: 'center' as const,
    } as MotionStyle,
    navButton: {
      cursor: 'pointer',
      display: 'inline-block',
      transition: 'all 0.3s ease',
      fontWeight: '500',
      fontSize: '0.875rem',
      padding: '0.5rem 1rem',
      borderRadius: '0.5rem',
      textDecoration: 'none',
    } as CSSProperties
  };

  const getFeatureCardStyle = (color: string, bgColor: string): MotionStyle => ({
    ...styles.featureCard,
    background: bgColor,
    boxShadow: `0 10px 30px ${color}15`,
  });

  return (
    <div style={styles.container}>
      {/* Background Image */}
      <Image
        src="/planet-04.png"
        alt="Background"
        layout="fill"
        objectFit="cover"
        style={styles.backgroundImage}
      />
      
      {/* Floating Icons */}
      <FloatingIcons />

      {/* Background Elements */}
      <div style={styles.backgroundElements}>
        <div style={styles.purpleGlow}></div>
        <div style={styles.tealGlow}></div>
      </div>

      {/* Navigation Bar */}
      {mounted && <Navigation />}

      <section style={styles.section}>
        <motion.div
          variants={staggerContainer()}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, amount: 0.25 }}
        >
          {/* Hero Section */}
          <div style={styles.heroContainer}>
            <motion.h1 
              variants={textVariant(1.1)} 
              style={styles.mainTitle}
            >
              AI Adventure
            </motion.h1>
            <motion.h2
              variants={textVariant(1.2)}
              style={{
                ...styles.subTitle,
                marginTop: '0'
              }}
            >
              Simulator
            </motion.h2>
            
            {/* Material Design divider */}
            <motion.div 
              variants={fadeIn('up', 'tween', 0.2, 1)}
              style={styles.divider}
            />
          </div>

          {/* Description */}
          <motion.p
            variants={fadeIn('up', 'tween', 0.2, 1)}
            style={styles.description}
          >
            Experience unique adventures in an AI-powered simulation game
          </motion.p>

          {/* Get Started Button */}
          <motion.div
            variants={fadeIn('up', 'tween', 0.3, 1)}
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: '1.5rem' // Reduced from 2rem to 1.5rem
            }}
          >
            <Link href="/mode" passHref>
              <motion.button
                style={{
                  background: 'linear-gradient(90deg, #BB86FC, #03DAC6)',
                  color: '#000000',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '500',
                  transition: 'all 0.3s ease',
                  fontSize: '1.125rem',
                  minWidth: '200px',
                  textAlign: 'center'
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Let's Go
              </motion.button>
            </Link>
          </motion.div>

          {/* Feature Cards */}
          <motion.div
            variants={fadeIn('up', 'tween', 0.4, 1)}
            style={styles.featuresGrid}
          >
            {[
              {
                icon: '🤖',
                title: 'AI-Powered',
                description: 'Dynamic scenarios generated by advanced AI',
                color: '#BB86FC',
                bgColor: 'rgba(187, 134, 252, 0.03)'
              },
              {
                icon: '🎮',
                title: 'Interactive',
                description: 'Make meaningful choices that shape your story',
                color: '#03DAC6',
                bgColor: 'rgba(3, 218, 198, 0.03)'
              },
              {
                icon: '📚',
                title: 'Educational',
                description: 'Learn through immersive storytelling',
                color: '#CF6679',
                bgColor: 'rgba(207, 102, 121, 0.03)'
              },
            ].map((feature) => (
              <motion.div
                key={feature.title}
                variants={fadeIn('up', 'spring', 0.5, 0.75)}
                style={getFeatureCardStyle(feature.color, feature.bgColor)}
                whileHover={{
                  transform: 'translateY(-8px)',
                  boxShadow: `0 20px 40px ${feature.color}20`,
                  border: `1px solid ${feature.color}30`,
                }}
              >
                <div style={styles.featureIcon}>{feature.icon}</div>
                <h3 style={{...styles.featureTitle, color: feature.color}}>{feature.title}</h3>
                <p className="text-lg text-gray-600 mt-2">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
          
          {/* Footer (proper styling to avoid the black line) */}
          <motion.div 
            variants={fadeIn('up', 'tween', 0.6, 1)}
            style={styles.footer}
          >
            <p>Designed with Material UI principles</p>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}
