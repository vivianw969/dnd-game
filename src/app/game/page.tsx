'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { generateScene, generateActionResult } from '@/utils/openai/client';
import { saveGame, loadGame, getCurrentUser, signOut } from '@/utils/supabase/client';
import { GameState } from '@/types/game';
import { supabase } from '@/utils/supabase/client';
import { fadeIn, staggerContainer } from '@/utils/motion';

interface Scene {
  description: string;
  actions: {
    id: string;
    description: string;
    requiredAttribute?: string;
    requiredSkill?: string;
    successText: string;
    failureText: string;
  }[];
}

interface ActionResult {
  description: string;
  effects: {
    mood: number;
    academicPerformance: number;
    socialLife: number;
    culturalConnection: number;
  };
}

export default function GamePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [gameState, setGameState] = useState<GameState>({
    character: {
      stats: {
        parentingStyle: searchParams.get('parentingStyle') || 'authoritative',
        familyBackground: searchParams.get('familyBackground') || 'middle-class',
      },
    },
    child: {
      age: 8,
      mood: 0,
      academicPerformance: 0,
      socialLife: 0,
      culturalConnection: 0,
    },
  });
  const [currentScene, setCurrentScene] = useState<Scene | null>(null);
  const [actionResult, setActionResult] = useState<ActionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [diceRoll, setDiceRoll] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

  // Styling from first page
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
      maxWidth: '1000px',
      margin: '0 auto',
      position: 'relative',
      zIndex: 10,
    },
    card: {
      background: 'rgba(30, 30, 30, 0.7)',
      backdropFilter: 'blur(10px)',
      borderRadius: '1rem',
      boxShadow: '0 15px 40px rgba(0, 0, 0, 0.3)',
      padding: '2rem',
      border: '1px solid rgba(255, 255, 255, 0.05)',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem',
    },
    title: {
      fontSize: '1.75rem',
      fontWeight: 'bold',
      color: '#BB86FC',
      letterSpacing: '-0.025em',
    },
    buttonContainer: {
      display: 'flex',
      gap: '1rem',
    },
    primaryButton: {
      background: 'linear-gradient(135deg, #8E24AA 0%, #BB86FC 100%)',
      color: 'white',
      padding: '0.75rem 1rem',
      borderRadius: '0.5rem',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 10px rgba(187, 134, 252, 0.3)',
    },
    secondaryButton: {
      background: 'linear-gradient(135deg, #00897B 0%, #03DAC6 100%)',
      color: 'white',
      padding: '0.75rem 1rem',
      borderRadius: '0.5rem',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 10px rgba(3, 218, 198, 0.3)',
    },
    dangerButton: {
      background: '#CF6679',
      color: 'white',
      padding: '0.75rem 1rem',
      borderRadius: '0.5rem',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    },
    infoPanel: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1rem',
      marginBottom: '1.5rem',
    },
    characterPanel: {
      background: 'rgba(187, 134, 252, 0.1)',
      borderRadius: '0.75rem',
      padding: '1rem',
      border: '1px solid rgba(187, 134, 252, 0.2)',
    },
    childPanel: {
      background: 'rgba(3, 218, 198, 0.1)',
      borderRadius: '0.75rem',
      padding: '1rem',
      border: '1px solid rgba(3, 218, 198, 0.2)',
    },
    panelTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      marginBottom: '0.5rem',
      color: '#BB86FC',
    },
    panelText: {
      color: 'rgba(255, 255, 255, 0.8)',
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '1rem',
      marginBottom: '1.5rem',
    },
    statContainer: {
      background: 'rgba(30, 30, 30, 0.5)',
      borderRadius: '0.75rem',
      padding: '1rem',
      border: '1px solid rgba(255, 255, 255, 0.05)',
    },
    statTitle: {
      fontSize: '0.875rem',
      fontWeight: '600',
      marginBottom: '0.5rem',
    },
    statBarContainer: {
      width: '100%',
      height: '0.5rem',
      background: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '0.25rem',
      overflow: 'hidden',
      marginBottom: '0.25rem',
    },
    statFlexDisplay: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    sceneContainer: {
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '0.75rem',
      padding: '1.5rem',
      marginBottom: '1.5rem',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    },
    sceneDescription: {
      marginBottom: '1.5rem',
      lineHeight: '1.6',
    },
    actionsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1rem',
    },
    actionButton: {
      background: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '0.75rem',
      padding: '1rem',
      textAlign: 'left',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    },
    resultContainer: {
      background: 'rgba(3, 218, 198, 0.1)',
      borderRadius: '0.75rem',
      padding: '1.5rem',
      marginBottom: '1.5rem',
      border: '1px solid rgba(3, 218, 198, 0.2)',
    },
    effectsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '0.75rem',
      marginBottom: '1.5rem',
    },
    effectItem: {
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '0.5rem',
      padding: '0.75rem',
      textAlign: 'center',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    },
    buttonShine: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
      transform: 'translateX(-100%)',
    },
    loadingSpinner: {
      width: '2rem',
      height: '2rem',
      borderRadius: '50%',
      border: '2px solid rgba(187, 134, 252, 0.3)',
      borderTopColor: '#BB86FC',
      animation: 'spin 1s linear infinite',
    },
    continueButton: {
      background: 'linear-gradient(135deg, #8E24AA 0%, #BB86FC 100%)', 
      color: 'white',
      padding: '0.75rem 1.5rem',
      borderRadius: '0.5rem',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'block',
      margin: '0 auto',
      boxShadow: '0 4px 10px rgba(187, 134, 252, 0.3)',
    },
    errorContainer: {
      background: 'rgba(207, 102, 121, 0.1)',
      borderRadius: '0.75rem',
      padding: '1.5rem',
      border: '1px solid rgba(207, 102, 121, 0.3)',
      textAlign: 'center',
    },
    errorMessage: {
      color: '#CF6679',
      marginBottom: '1rem',
    },
    statusMessage: {
      position: 'absolute',
      top: '100%',
      left: 0,
      marginTop: '0.5rem',
      padding: '0.5rem 0.75rem',
      borderRadius: '0.25rem',
      fontSize: '0.875rem',
      zIndex: 20,
    },
    successMessage: {
      background: 'rgba(3, 218, 198, 0.2)',
      color: '#03DAC6',
      border: '1px solid rgba(3, 218, 198, 0.4)',
    },
    errorStatusMessage: {
      background: 'rgba(207, 102, 121, 0.2)',
      color: '#CF6679',
      border: '1px solid rgba(207, 102, 121, 0.4)',
    },
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      const shouldLoadGame = searchParams.get('load') === 'true';
      if (shouldLoadGame) {
        loadSavedGame();
      } else {
        loadInitialScene();
      }
    }
  }, [user]);

  const checkAuth = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      router.push('/login');
    }
  };

  const loadSavedGame = async () => {
    try {
      const saveId = searchParams.get('saveId');
      if (!saveId) {
        router.push('/saves');
        return;
      }

      const { data: save, error } = await supabase
        .from('game_saves')
        .select('*')
        .eq('id', saveId)
        .single();

      if (error || !save) {
        throw new Error('Save not found');
      }

      setGameState(save.game_state);
      loadInitialScene();
    } catch (error) {
      console.error('Error loading saved game:', error);
      router.push('/saves');
    }
  };

  const handleSaveGame = async () => {
    try {
      setIsLoading(true);
      await saveGame(gameState);
      setSaveStatus({ type: 'success', message: 'Game saved successfully!' });
      setTimeout(() => {
        setSaveStatus({ type: null, message: '' });
      }, 3000);
    } catch (error) {
      console.error('Error saving game:', error);
      setSaveStatus({ type: 'error', message: 'Failed to save game. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    loadInitialScene();
  }, []);

  const loadInitialScene = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Loading scene with game state:', gameState);
      const scene = await generateScene(gameState);
      console.log('Received scene:', scene);
      setCurrentScene(scene);
    } catch (error) {
      console.error('Error loading scene:', error);
      setError(`Failed to load scene: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const rollD20 = () => {
    return Math.floor(Math.random() * 20) + 1;
  };

  const handleAction = async (action: Scene['actions'][0]) => {
    try {
      setIsRolling(true);
      setDiceRoll(null);
      
      const rollInterval = setInterval(() => {
        setDiceRoll(rollD20());
      }, 100);

      setTimeout(() => {
        clearInterval(rollInterval);
        const finalRoll = rollD20();
        setDiceRoll(finalRoll);
        setIsRolling(false);
        
        processActionResult(action, finalRoll);
      }, 1000);
    } catch (error) {
      console.error('Error handling action:', error);
      setIsRolling(false);
    }
  };

  const processActionResult = async (action: Scene['actions'][0], roll: number) => {
    try {
      setIsLoading(true);
      console.log('Processing action result:', { action, roll, gameState });
      const result = await generateActionResult(action, gameState, roll);
      console.log('Received action result:', result);
      setActionResult(result);
      
      setGameState(prev => ({
        ...prev,
        child: {
          ...prev.child,
          mood: Math.max(-100, Math.min(100, prev.child.mood + result.effects.mood)),
          academicPerformance: Math.max(
            -100,
            Math.min(100, prev.child.academicPerformance + result.effects.academicPerformance)
          ),
          socialLife: Math.max(-100, Math.min(100, prev.child.socialLife + result.effects.socialLife)),
          culturalConnection: Math.max(
            -100,
            Math.min(100, prev.child.culturalConnection + result.effects.culturalConnection)
          ),
        },
      }));
    } catch (error) {
      console.error('Error processing action result:', error);
      setError(`Failed to process action: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextScene = async () => {
    setIsLoading(true);
    setActionResult(null);
    try {
      const scene = await generateScene(gameState);
      setCurrentScene(scene);
    } catch (error) {
      setError('Failed to load the next scene. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to calculate progress bar percentage
  const calculateProgressPercentage = (value: number) => {
    // 直接使用数值作为百分比
    return Math.max(0, Math.min(100, value));
  };

  // Helper function to get progress bar color
  const getProgressBarColor = (value: number) => {
    if (value > 50) {
      return 'linear-gradient(90deg, #4CAF50, #8BC34A)';
    } else if (value > 0) {
      return 'linear-gradient(90deg, #FFC107, #FFEB3B)';
    }
    return 'linear-gradient(90deg, #9E9E9E, #BDBDBD)';
  };

  // Helper function to get progress bar background
  const getProgressBarBackground = (value: number) => {
    if (value > 50) {
      return 'rgba(76, 175, 80, 0.1)';
    } else if (value > 0) {
      return 'rgba(255, 193, 7, 0.1)';
    }
    return 'rgba(158, 158, 158, 0.1)';
  };

  if (error) {
    return (
      <div style={styles.container}>
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
          <motion.div variants={fadeIn('up', 'tween', 0.2, 1)} style={styles.card}>
            <div style={styles.errorContainer}>
              <p style={styles.errorMessage}>{error}</p>
              <button
                onClick={loadInitialScene}
                style={styles.primaryButton}
              >
                Try Again
              </button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (isLoading && !currentScene) {
    return (
      <div style={{
        ...styles.container,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={styles.backgroundElements}>
          <div style={styles.purpleGlow}></div>
          <div style={styles.tealGlow}></div>
        </div>
        <div style={styles.loadingSpinner}></div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
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
        <motion.div variants={fadeIn('up', 'tween', 0.2, 1)} style={styles.card}>
          {/* Header */}
          <motion.div variants={fadeIn('up', 'tween', 0.3, 1)} style={styles.header}>
            <h1 style={styles.title}>Parenting Adventure</h1>
            <div style={styles.buttonContainer}>
              <div style={{ position: 'relative' }}>
                <motion.button
                  onClick={handleSaveGame}
                  disabled={isLoading}
                  style={{
                    ...styles.primaryButton,
                    opacity: isLoading ? 0.7 : 1,
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  whileHover={!isLoading ? { y: -2, boxShadow: '0 6px 15px rgba(187, 134, 252, 0.4)' } : {}}
                  whileTap={!isLoading ? { scale: 0.98 } : {}}
                >
                  Save Game
                  <motion.div
                    style={styles.buttonShine}
                    animate={{ 
                      x: ['100%', '200%'],
                      transition: { repeat: Infinity, duration: 3, ease: 'linear' }
                    }}
                  />
                </motion.button>
                {saveStatus.type && (
                  <div style={{
                    ...styles.statusMessage,
                    ...(saveStatus.type === 'success' ? styles.successMessage : styles.errorStatusMessage)
                  }}>
                    {saveStatus.message}
                  </div>
                )}
              </div>
              <motion.button
                onClick={handleSignOut}
                style={{
                  ...styles.dangerButton,
                  position: 'relative',
                  overflow: 'hidden'
                }}
                whileHover={{ y: -2, boxShadow: '0 6px 15px rgba(207, 102, 121, 0.4)' }}
                whileTap={{ scale: 0.98 }}
              >
                Sign Out
                <motion.div
                  style={styles.buttonShine}
                  animate={{ 
                    x: ['100%', '200%'],
                    transition: { repeat: Infinity, duration: 3, ease: 'linear', delay: 1.5 }
                  }}
                />
              </motion.button>
            </div>
          </motion.div>
          
          {/* Character Info */}
          <motion.div variants={fadeIn('up', 'tween', 0.4, 1)} style={styles.infoPanel}>
            <div style={styles.characterPanel}>
              <h2 style={{ ...styles.panelTitle, color: '#BB86FC' }}>Character</h2>
              <p style={styles.panelText}>Style: {gameState.character.stats.parentingStyle}</p>
              <p style={styles.panelText}>Background: {gameState.character.stats.familyBackground}</p>
            </div>
            <div style={styles.childPanel}>
              <h2 style={{ ...styles.panelTitle, color: '#03DAC6' }}>Child</h2>
              <p style={styles.panelText}>Age: {gameState.child.age}</p>
            </div>
          </motion.div>

          {/* Stats Display */}
          <motion.div 
            variants={fadeIn('up', 'tween', 0.5, 1)} 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '1rem',
              marginBottom: '1.5rem'
            }}
          >
            <div style={styles.statContainer}>
              <h3 style={{ ...styles.statTitle, color: '#FFC107' }}>Mood</h3>
              <div style={styles.statFlexDisplay}>
                <div style={{
                  ...styles.statBarContainer,
                  width: '85%',
                  background: getProgressBarBackground(gameState.child.mood)
                }}>
                  <div 
                    style={{
                      height: '100%',
                      width: `${calculateProgressPercentage(gameState.child.mood)}%`,
                      background: getProgressBarColor(gameState.child.mood),
                      borderRadius: '0.25rem',
                      transition: 'width 0.3s ease, background 0.3s ease'
                    }}
                  ></div>
                </div>
                <span style={{ 
                  color: gameState.child.mood > 0 ? '#4CAF50' : gameState.child.mood < 0 ? '#F44336' : '#9E9E9E',
                  marginLeft: '0.5rem',
                  fontWeight: '500'
                }}>{gameState.child.mood}</span>
              </div>
            </div>
            <div style={styles.statContainer}>
              <h3 style={{ ...styles.statTitle, color: '#BB86FC' }}>Academic</h3>
              <div style={styles.statFlexDisplay}>
                <div style={{...styles.statBarContainer, width: '85%'}}>
                  <div 
                    style={{
                      height: '100%',
                      width: `${calculateProgressPercentage(gameState.child.academicPerformance)}%`,
                      background: 'linear-gradient(90deg, #9C27B0, #BB86FC)',
                      borderRadius: '0.25rem'
                    }}
                  ></div>
                </div>
                <span style={{ color: '#BB86FC', marginLeft: '0.5rem' }}>{gameState.child.academicPerformance}</span>
              </div>
            </div>
            <div style={styles.statContainer}>
              <h3 style={{ ...styles.statTitle, color: '#FF4081' }}>Social</h3>
              <div style={styles.statFlexDisplay}>
                <div style={{...styles.statBarContainer, width: '85%'}}>
                  <div 
                    style={{
                      height: '100%',
                      width: `${calculateProgressPercentage(gameState.child.socialLife)}%`,
                      background: 'linear-gradient(90deg, #FF4081, #FF80AB)',
                      borderRadius: '0.25rem'
                    }}
                  ></div>
                </div>
                <span style={{ color: '#FF4081', marginLeft: '0.5rem' }}>{gameState.child.socialLife}</span>
              </div>
            </div>
            <div style={styles.statContainer}>
              <h3 style={{ ...styles.statTitle, color: '#03DAC6' }}>Cultural</h3>
              <div style={styles.statFlexDisplay}>
                <div style={{...styles.statBarContainer, width: '85%'}}>
                  <div 
                    style={{
                      height: '100%',
                      width: `${calculateProgressPercentage(gameState.child.culturalConnection)}%`,
                      background: 'linear-gradient(90deg, #00BCD4, #03DAC6)',
                      borderRadius: '0.25rem'
                    }}
                  ></div>
                </div>
                <span style={{ color: '#03DAC6', marginLeft: '0.5rem' }}>{gameState.child.culturalConnection}</span>
              </div>
            </div>
          </motion.div>

          {/* Scene Display */}
          <motion.div variants={fadeIn('up', 'tween', 0.6, 1)} style={styles.sceneContainer}>
            {isLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '120px' }}>
                <div style={styles.loadingSpinner}></div>
              </div>
            ) : error ? (
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: '#CF6679', marginBottom: '1rem' }}>{error}</p>
                <button
                  onClick={loadInitialScene}
                  style={styles.primaryButton}
                >
                  Retry
                </button>
              </div>
            ) : (
              <>
                <p style={styles.sceneDescription}>{currentScene?.description}</p>
                {!actionResult && (
                  <div style={styles.actionsGrid}>
                    {currentScene?.actions.map((action) => (
                      <motion.button
                        key={action.id}
                        onClick={() => handleAction(action)}
                        disabled={isLoading}
                        style={styles.actionButton}
                        whileHover={{
                          y: -3,
                          boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)',
                          background: 'rgba(255, 255, 255, 0.15)'
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <p style={{ 
                          fontWeight: '500', 
                          color: '#ffffff',
                          marginBottom: action.requiredAttribute ? '0.5rem' : 0
                        }}>
                          {action.description}
                        </p>
                        {action.requiredAttribute && (
                          <p style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                            Requires: {action.requiredAttribute}
                          </p>
                        )}
                      </motion.button>
                    ))}
                  </div>
                )}
              </>
            )}
          </motion.div>

          {/* Action Result Display */}
          {actionResult && (
            <motion.div 
              variants={fadeIn('up', 'tween', 0.7, 1)} 
              style={styles.resultContainer}
            >
              <p style={{ marginBottom: '1.5rem', lineHeight: '1.6' }}>{actionResult.description}</p>
              <div style={styles.effectsGrid}>
                <div style={{ ...styles.effectItem, borderColor: actionResult.effects.mood >= 0 ? 'rgba(255, 193, 7, 0.3)' : 'rgba(255, 193, 7, 0.2)', background: 'rgba(255, 193, 7, 0.1)' }}>
                  <p style={{ color: '#FFC107' }}>Mood: {actionResult.effects.mood > 0 ? '+' : ''}{actionResult.effects.mood}</p>
                </div>
                <div style={{ ...styles.effectItem, borderColor: actionResult.effects.academicPerformance >= 0 ? 'rgba(187, 134, 252, 0.3)' : 'rgba(187, 134, 252, 0.2)', background: 'rgba(187, 134, 252, 0.1)' }}>
                  <p style={{ color: '#BB86FC' }}>Academic: {actionResult.effects.academicPerformance > 0 ? '+' : ''}{actionResult.effects.academicPerformance}</p>
                </div>
                <div style={{ ...styles.effectItem, borderColor: actionResult.effects.socialLife >= 0 ? 'rgba(255, 64, 129, 0.3)' : 'rgba(255, 64, 129, 0.2)', background: 'rgba(255, 64, 129, 0.1)' }}>
                  <p style={{ color: '#FF4081' }}>Social: {actionResult.effects.socialLife > 0 ? '+' : ''}{actionResult.effects.socialLife}</p>
                </div>
                <div style={{ ...styles.effectItem, borderColor: actionResult.effects.culturalConnection >= 0 ? 'rgba(3, 218, 198, 0.3)' : 'rgba(3, 218, 198, 0.2)', background: 'rgba(3, 218, 198, 0.1)' }}>
                  <p style={{ color: '#03DAC6' }}>Cultural: {actionResult.effects.culturalConnection > 0 ? '+' : ''}{actionResult.effects.culturalConnection}</p>
                </div>
              </div>
              <motion.div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  marginTop: '1.5rem'
                }}
              >
                <motion.button
                  onClick={handleNextScene}
                  style={{
                    ...styles.continueButton,
                    opacity: isLoading ? 0.7 : 1,
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                  }}
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoading ? (
                    <div style={styles.loadingSpinner} />
                  ) : (
                    'Continue to Next Scene'
                  )}
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}

