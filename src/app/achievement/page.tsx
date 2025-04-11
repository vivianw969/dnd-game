'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { fadeIn, staggerContainer } from '@/utils/motion';
import { FC } from 'react';

const achievements = [
  {
    id: 'rat_racer_king',
    title: 'Rat Racer King',
    description: 'Master of the corporate ladder',
    icon: '👑',
    color: '#BB86FC'
  },
  {
    id: 'offer_claimer',
    title: 'Offer Claimer',
    description: 'Successfully negotiated multiple job offers',
    icon: '📝',
    color: '#03DAC6'
  },
  {
    id: 'mentor_master',
    title: 'Mentor Master',
    description: 'Guided others to success',
    icon: '🎓',
    color: '#FFD54F'
  },
  {
    id: 'work_life_hero',
    title: 'Work-Life Hero',
    description: 'Achieved perfect balance in career and life',
    icon: '⚖️',
    color: '#CF6679'
  }
];

const AchievementPage: FC = () => {
  const router = useRouter();

  const styles = {
    container: {
      minHeight: '100vh',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #121212 0%, #2D1F3D 50%, #1E1E1E 100%)',
      color: '#ffffff',
      fontFamily: 'Roboto, "Segoe UI", Arial, sans-serif',
      position: 'relative' as const,
      padding: '2rem 1rem',
    },
    backgroundElements: {
      position: 'fixed' as const,
      inset: 0,
      zIndex: 0,
    },
    purpleGlow: {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      width: '33%',
      height: '66%',
      background: 'rgba(186, 104, 200, 0.1)',
      borderRadius: '50%',
      filter: 'blur(120px)',
    },
    tealGlow: {
      position: 'absolute' as const,
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
      position: 'relative' as const,
      zIndex: 10,
    },
    card: {
      background: 'rgba(30, 30, 30, 0.7)',
      backdropFilter: 'blur(10px)',
      borderRadius: '1rem',
      boxShadow: '0 15px 40px rgba(0, 0, 0, 0.3)',
      padding: '2.5rem',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      textAlign: 'center' as const,
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
    achievementsList: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '1.5rem',
      maxWidth: '900px',
      margin: '0 auto',
    },
    achievementCard: {
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '1rem',
      padding: '1.5rem',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      transition: 'all 0.3s ease',
    },
    achievementIcon: {
      fontSize: '2rem',
      width: '48px',
      height: '48px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '50%',
      flexShrink: 0,
    },
    achievementInfo: {
      textAlign: 'left' as const,
    },
    achievementTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      marginBottom: '0.5rem',
    },
    achievementDescription: {
      fontSize: '0.875rem',
      opacity: '0.8',
    },
    backButton: {
      background: 'transparent',
      border: '1px solid #BB86FC',
      color: '#BB86FC',
      padding: '0.75rem 1.5rem',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: '500',
      marginTop: '2rem',
      transition: 'all 0.3s ease',
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
            Achievements
          </motion.h1>

          <motion.div 
            variants={fadeIn('up', 'tween', 0.4, 1)} 
            style={styles.divider}
          />

          <motion.div
            variants={fadeIn('up', 'tween', 0.5, 1)}
            style={styles.achievementsList}
          >
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                variants={fadeIn('up', 'tween', 0.6 + index * 0.1, 1)}
                style={styles.achievementCard}
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
                }}
              >
                <div 
                  style={{
                    ...styles.achievementIcon,
                    background: `${achievement.color}20`,
                    color: achievement.color,
                  }}
                >
                  {achievement.icon}
                </div>
                <div style={styles.achievementInfo}>
                  <h3 style={{
                    ...styles.achievementTitle,
                    color: achievement.color,
                  }}>
                    {achievement.title}
                  </h3>
                  <p style={styles.achievementDescription}>
                    {achievement.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.button
            onClick={() => router.back()}
            style={styles.backButton}
            whileHover={{ 
              scale: 1.05,
              background: '#BB86FC20',
            }}
            whileTap={{ scale: 0.98 }}
          >
            Back to Menu
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AchievementPage; 