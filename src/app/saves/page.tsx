'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getGameSaves, GameSave } from '@/utils/supabase/client';
import { motion } from 'framer-motion';
import { fadeIn } from '@/utils/motion';

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, rgba(17, 24, 39, 0.8) 0%, rgba(17, 24, 39, 0.95) 100%)',
    padding: '2rem',
    color: '#ffffff',
    position: 'relative' as const,
    overflow: 'hidden'
  },
  content: {
    maxWidth: '1200px',
    margin: '0 auto',
    position: 'relative' as const,
    zIndex: 1
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '2rem'
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    background: 'linear-gradient(90deg, #BB86FC, #03DAC6)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '1rem'
  },
  saveCard: {
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '1rem',
    padding: '1.5rem',
    marginBottom: '1rem',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)'
  },
  saveHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem'
  },
  saveTitle: {
    fontSize: '1.25rem',
    fontWeight: '500',
    color: '#ffffff'
  },
  saveDate: {
    fontSize: '0.875rem',
    color: 'rgba(255, 255, 255, 0.6)'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginTop: '1rem'
  },
  statItem: {
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '0.5rem',
    padding: '1rem',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  },
  statLabel: {
    fontSize: '0.875rem',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: '0.5rem'
  },
  statValue: {
    fontSize: '1.25rem',
    fontWeight: '500',
    color: '#ffffff'
  },
  loadButton: {
    background: 'linear-gradient(90deg, #BB86FC, #03DAC6)',
    color: '#000000',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.5rem',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'all 0.3s ease'
  },
  loadingSpinner: {
    width: '2rem',
    height: '2rem',
    border: '3px solid rgba(187, 134, 252, 0.3)',
    borderTop: '3px solid #BB86FC',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  }
};

export default function SavesPage() {
  const router = useRouter();
  const [saves, setSaves] = useState<GameSave[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSaves();
  }, []);

  const loadSaves = async () => {
    try {
      setIsLoading(true);
      const gameSaves = await getGameSaves();
      setSaves(gameSaves);
    } catch (error) {
      setError('Failed to load saves. Please try again.');
      console.error('Error loading saves:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handleLoadSave = (saveId: string) => {
    router.push(`/game?load=true&saveId=${saveId}`);
  };

  const getInitialStats = (save: GameSave) => {
    const { child } = save.game_state;
    return {
      mood: child.mood,
      academic: child.academicPerformance,
      social: child.socialLife,
      cultural: child.culturalConnection
    };
  };

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={fadeIn('up', 'tween', 0.2, 1)}
      style={styles.container}
    >
      <div style={styles.content}>
        <div style={styles.header}>
          <h1 style={styles.title}>Your Game Saves</h1>
        </div>

        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
            <div style={styles.loadingSpinner} />
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', color: '#CF6679' }}>
            <p style={{ marginBottom: '1rem' }}>{error}</p>
            <button
              onClick={loadSaves}
              style={styles.loadButton}
            >
              Retry
            </button>
          </div>
        ) : saves.length === 0 ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', marginBottom: '1rem' }}>
              No saved games found.
            </p>
            <button
              onClick={() => router.push('/mode')}
              style={styles.loadButton}
            >
              Start New Game
            </button>
          </div>
        ) : (
          <div>
            {saves.map((save) => {
              const stats = getInitialStats(save);
              return (
                <motion.div
                  key={save.id}
                  style={styles.saveCard}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div style={styles.saveHeader}>
                    <div>
                      <h2 style={styles.saveTitle}>
                        Save from {formatDate(save.created_at)}
                      </h2>
                      <p style={styles.saveDate}>
                        Last updated: {formatDate(save.updated_at)}
                      </p>
                    </div>
                    <motion.button
                      onClick={() => handleLoadSave(save.id)}
                      style={styles.loadButton}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Load Game
                    </motion.button>
                  </div>
                  <div style={styles.statsGrid}>
                    <div style={styles.statItem}>
                      <p style={styles.statLabel}>Mood</p>
                      <p style={{ ...styles.statValue, color: '#FFC107' }}>{stats.mood}</p>
                    </div>
                    <div style={styles.statItem}>
                      <p style={styles.statLabel}>Academic Performance</p>
                      <p style={{ ...styles.statValue, color: '#BB86FC' }}>{stats.academic}</p>
                    </div>
                    <div style={styles.statItem}>
                      <p style={styles.statLabel}>Social Life</p>
                      <p style={{ ...styles.statValue, color: '#FF4081' }}>{stats.social}</p>
                    </div>
                    <div style={styles.statItem}>
                      <p style={styles.statLabel}>Cultural Connection</p>
                      <p style={{ ...styles.statValue, color: '#03DAC6' }}>{stats.cultural}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
} 