'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { generateScene, generateActionResult } from '@/utils/openai/client';
import { saveGame, loadGame, getCurrentUser, signOut } from '@/utils/supabase/client';
import { GameState } from '@/types/game';
import { supabase } from '@/utils/supabase/client';
import { fadeIn, staggerContainer } from '@/utils/motion';
import DiceRoll from '@/components/DiceRoll';
import { ACHIEVEMENTS } from '@/constants/achievements';
import { AchievementManager } from '@/utils/achievementManager';
import AudioManager from '@/utils/audio/audioManager';
import AudioControls from '@/components/AudioControls';

// Import Space Grotesk font
import { Space_Grotesk } from 'next/font/google';

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  display: 'swap',
});

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [gameState, setGameState] = useState<GameState>(() => {
    // Only initialize if we have parentingStyle in URL params (indicating new game)
    if (!searchParams.get('parentingStyle')) {
      return {
        character: {
          stats: {
            parentingStyle: '',
            familyBackground: '',
            attributes: {
              academicPressure: 0,
              tigerDiscipline: 0,
              socialEngineering: 0,
              familyHonor: 0,
              resourceManagement: 0,
              emotionalTactics: 0,
            }
          },
        },
        child: {
          age: 0,
          mood: 0,
          academicPerformance: 0,
          socialLife: 0,
          culturalConnection: 0,
        },
      };
    }

    const initialAttributes = {
      academicPressure: getInitialAttributeValue(searchParams.get('parentingStyle'), 'academicPressure'),
      tigerDiscipline: getInitialAttributeValue(searchParams.get('parentingStyle'), 'tigerDiscipline'),
      socialEngineering: getInitialAttributeValue(searchParams.get('parentingStyle'), 'socialEngineering'),
      familyHonor: getInitialAttributeValue(searchParams.get('parentingStyle'), 'familyHonor'),
      resourceManagement: getInitialAttributeValue(searchParams.get('parentingStyle'), 'resourceManagement'),
      emotionalTactics: getInitialAttributeValue(searchParams.get('parentingStyle'), 'emotionalTactics'),
    };
    
    return {
      character: {
        stats: {
          parentingStyle: searchParams.get('parentingStyle') || 'authoritative',
          familyBackground: searchParams.get('familyBackground') || 'middle-class',
          attributes: initialAttributes
        },
      },
      child: {
        age: 8,
        mood: getInitialChildValue('mood', initialAttributes),
        academicPerformance: getInitialChildValue('academicPerformance', initialAttributes),
        socialLife: getInitialChildValue('socialLife', initialAttributes),
        culturalConnection: getInitialChildValue('culturalConnection', initialAttributes),
      },
    };
  });
  const [currentScene, setCurrentScene] = useState<Scene | null>(null);
  const [actionResult, setActionResult] = useState<ActionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  const [achievements, setAchievements] = useState<Set<string>>(new Set());
  const [showAchievement, setShowAchievement] = useState<{
    title: string;
    description: string;
    icon: string;
  } | null>(null);

  // Styling from first page
  const styles = {
    container: {
      minHeight: '100vh',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #121212 0%, #2D1F3D 50%, #1E1E1E 100%)',
      color: '#ffffff',
      fontFamily: spaceGrotesk.style.fontFamily,
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
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#BB86FC',
      letterSpacing: '0.02em',
      fontFamily: spaceGrotesk.style.fontFamily,
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
      background: 'linear-gradient(135deg, #CF6679 0%, #FF4081 100%)',
      color: 'white',
      padding: '0.75rem 1rem',
      borderRadius: '0.5rem',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 10px rgba(207, 102, 121, 0.3)',
    },
    infoPanel: {
      display: 'flex',
      gap: '0.5rem',
      marginBottom: '0.75rem',
    },
    characterPanel: {
      flex: '0 0 30%',
      background: 'rgba(187, 134, 252, 0.1)',
      borderRadius: '0.5rem',
      padding: '0.5rem',
      fontSize: '0.7rem',
    },
    childPanel: {
      flex: '1',
      background: 'rgba(3, 218, 198, 0.1)',
      borderRadius: '0.5rem',
      padding: '0.5rem',
      fontSize: '0.7rem',
    },
    panelTitle: {
      fontSize: '1rem',
      fontWeight: '600',
      marginBottom: '0.25rem',
      color: '#BB86FC',
      letterSpacing: '0.02em',
      fontFamily: spaceGrotesk.style.fontFamily,
    },
    panelText: {
      color: 'rgba(255, 255, 255, 0.8)',
      marginBottom: '0.25rem',
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '0.75rem',
      marginBottom: '1rem',
    },
    statContainer: {
      background: 'rgba(30, 30, 30, 0.5)',
      borderRadius: '0.75rem',
      padding: '0.75rem',
      border: '1px solid rgba(255, 255, 255, 0.05)',
    },
    statTitle: {
      fontSize: '0.75rem',
      fontWeight: '600',
      marginBottom: '0.25rem',
    },
    statBarContainer: {
      width: '100%',
      height: '0.4rem',
      background: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '0.25rem',
      overflow: 'hidden',
      marginBottom: '0.2rem',
    },
    statFlexDisplay: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    sceneContainer: {
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '0.5rem',
      padding: '0.75rem',
      marginBottom: '0.75rem',
    },
    sceneDescription: {
      marginBottom: '0.75rem',
      lineHeight: '1.3',
      fontSize: '1rem',
      fontFamily: spaceGrotesk.style.fontFamily,
      letterSpacing: '0.01em',
    },
    actionsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: '0.4rem',
    },
    actionButton: {
      padding: '0.5rem',
      fontSize: '0.85rem',
      borderRadius: '0.5rem',
      minHeight: '2.5rem',
      background: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontFamily: spaceGrotesk.style.fontFamily,
      letterSpacing: '0.01em',
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
    actionResult: {
      padding: '0.75rem',
      marginBottom: '0.75rem',
      fontSize: '0.9rem',
    },
    resultTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      marginBottom: '0.5rem',
      color: '#BB86FC',
      letterSpacing: '0.02em',
      fontFamily: spaceGrotesk.style.fontFamily,
    },
    resultDescription: {
      marginBottom: '1.5rem',
      lineHeight: '1.6',
      fontSize: '1.2rem',
      fontFamily: spaceGrotesk.style.fontFamily,
      letterSpacing: '0.01em',
    },
    effectsContainer: {
      marginBottom: '1.5rem',
    },
    effectsTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      marginBottom: '0.5rem',
      color: '#BB86FC',
      letterSpacing: '0.02em',
      fontFamily: spaceGrotesk.style.fontFamily,
    },
    effectsList: {
      listStyle: 'none',
      padding: 0,
    },
    effectItemList: {
      marginBottom: '0.5rem',
    },
    effectName: {
      fontWeight: '600',
    },
    effectValue: {
      marginLeft: '0.5rem',
    },
  };

  // Add audio manager initialization
  const audioManager = AudioManager.getInstance();

  useEffect(() => {
  const checkAuth = async () => {
    try {
        const user = await getCurrentUser();
        if (!user) {
      router.push('/login');
          return;
        }
        setIsAuthenticated(true);
        setUser(user);

        // Load saved game if saveId is present
        if (searchParams.get('saveId')) {
          await loadSavedGame();
        } else if (searchParams.get('parentingStyle')) {
          // Initialize new game with user's choices
        await loadInitialScene();
        } else {
          router.push('/mode');
      }
    } catch (error) {
        console.error('Error checking authentication:', error);
        router.push('/login');
    }
  };

    checkAuth();
  }, [router, searchParams]);

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

  // Modify rollDice to include sound effects
  const rollDice = () => {
    audioManager.playEffect('dice');
    const newValue = Math.floor(Math.random() * 20) + 1;
    return newValue;
  };

  // Modify handleAction to include sound effects
  const handleAction = async (action: Scene['actions'][0]) => {
    try {
      audioManager.playEffect('button');
      // Check if specific attribute is required
      if (action.requiredAttribute && action.requiredAttribute !== 'none') {
        const attributeValue = gameState.character.stats.attributes[action.requiredAttribute as keyof typeof gameState.character.stats.attributes];
        if (attributeValue < 10) {
          setError(`You need ${action.requiredAttribute} attribute to reach 10 points to choose this option.`);
          return;
        }
      }

      setIsRolling(true);
      setDiceValue(null);
      
      const rollInterval = setInterval(() => {
        setDiceValue(rollDice());
      }, 100);

      setTimeout(async () => {
        clearInterval(rollInterval);
        const finalRoll = rollDice();
        setDiceValue(finalRoll);
        setIsRolling(false);
        
        // Call processActionResult to handle action result
        await processActionResult(action, finalRoll);
      }, 1000);
    } catch (error) {
      console.error('Error handling action:', error);
      setError('An error occurred while processing your action.');
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
      
      // Update game state and check achievements
      setGameState(prev => {
        const newState = {
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
        };

        // Check achievements
        const achievementManager = AchievementManager.getInstance();
        const newAcademicPerformance = newState.child.academicPerformance;
        if (newAcademicPerformance >= 15 && !achievementManager.hasAchievement('HARD_WORKER')) {
          console.log('Achievement unlocked: Hard Worker');
          if (achievementManager.unlockAchievement('HARD_WORKER')) {
            setShowAchievement(ACHIEVEMENTS.HARD_WORKER);
            setTimeout(() => setShowAchievement(null), 3000);
          }
        }

        return newState;
      });
    } catch (error) {
      console.error('Error processing action result:', error);
      setError(`Failed to process action: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextScene = async () => {
    try {
      setIsLoading(true);
      setActionResult(null);
      // Reset dice value
      setDiceValue(null);
      setIsRolling(false);
      
      const scene = await generateScene(gameState);
      setCurrentScene(scene);
    } catch (error) {
      console.error('Error loading next scene:', error);
      setError('Failed to load the next scene. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to calculate progress bar
  const calculateProgressPercentage = (value: number) => {

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

  // Helper function to get initial attribute values based on parenting style
  function getInitialAttributeValue(parentingStyle: string | null, attribute: string): number {
    const baseValue = 10;
    const styleBonus = {
      'authoritative': {
        academicPressure: 2,
        tigerDiscipline: 1,
        socialEngineering: 2,
        familyHonor: 1,
        resourceManagement: 2,
        emotionalTactics: 2,
      },
      'authoritarian': {
        academicPressure: 3,
        tigerDiscipline: 3,
        socialEngineering: 1,
        familyHonor: 2,
        resourceManagement: 1,
        emotionalTactics: 0,
      },
      'permissive': {
        academicPressure: 0,
        tigerDiscipline: 0,
        socialEngineering: 2,
        familyHonor: 1,
        resourceManagement: 1,
        emotionalTactics: 3,
      },
      'uninvolved': {
        academicPressure: 0,
        tigerDiscipline: 0,
        socialEngineering: 0,
        familyHonor: 0,
        resourceManagement: 0,
        emotionalTactics: 0,
      },
    } as const;

    const backgroundBonus = {
      'middle-class': {
        academicPressure: 1,
        tigerDiscipline: 1,
        socialEngineering: 1,
        familyHonor: 1,
        resourceManagement: 1,
        emotionalTactics: 1,
      },
      'working-class': {
        academicPressure: 1,
        tigerDiscipline: 2,
        socialEngineering: 0,
        familyHonor: 2,
        resourceManagement: 1,
        emotionalTactics: 1,
      },
      'upper-class': {
        academicPressure: 2,
        tigerDiscipline: 1,
        socialEngineering: 2,
        familyHonor: 1,
        resourceManagement: 2,
        emotionalTactics: 1,
      },
      'immigrant': {
        academicPressure: 2,
        tigerDiscipline: 2,
        socialEngineering: 0,
        familyHonor: 3,
        resourceManagement: 1,
        emotionalTactics: 1,
      },
    } as const;

    // Ensure we have valid values
    const selectedStyle = parentingStyle || 'authoritative';
    const selectedBackground = searchParams.get('familyBackground') || 'middle-class';

    // Calculate the total value
    const styleValue = styleBonus[selectedStyle as keyof typeof styleBonus]?.[attribute as keyof typeof styleBonus.authoritative] || 0;
    const backgroundValue = backgroundBonus[selectedBackground as keyof typeof backgroundBonus]?.[attribute as keyof typeof backgroundBonus['middle-class']] || 0;

    return baseValue + styleValue + backgroundValue;
  }

  // Helper function to get initial child values based on character attributes
  function getInitialChildValue(stat: string, attributes: GameState['character']['stats']['attributes']): number {
    switch (stat) {
      case 'mood':
        // Mood is affected by emotionalTactics and tigerDiscipline (inverse)
        return Math.max(0, Math.min(100, 
          (attributes.emotionalTactics - 10) * 2 - (attributes.tigerDiscipline - 10)
        ));
      case 'academicPerformance':
        // Academic performance is affected by academicPressure and resourceManagement
        return Math.max(0, Math.min(100, 
          (attributes.academicPressure - 10) * 3 + (attributes.resourceManagement - 10)
        ));
      case 'socialLife':
        // Social life is affected by socialEngineering and emotionalTactics
        return Math.max(0, Math.min(100, 
          (attributes.socialEngineering - 10) * 2 + (attributes.emotionalTactics - 10)
        ));
      case 'culturalConnection':
        // Cultural connection is affected by familyHonor and socialEngineering
        return Math.max(0, Math.min(100, 
          (attributes.familyHonor - 10) * 2 + (attributes.socialEngineering - 10)
        ));
      default:
        return 0;
    }
  }

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
      await loadInitialScene();
    } catch (error) {
      console.error('Error loading saved game:', error);
      router.push('/saves');
    }
  };

  // Add useEffect for background music
  useEffect(() => {
    audioManager.playBackgroundMusic();
    return () => {
      audioManager.pauseBackgroundMusic();
    };
  }, []);

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
        <AudioControls />
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

          {/* Dice Roll Animation - Move below scene description */}
          {isRolling && <DiceRoll isRolling={isRolling} diceValue={diceValue} />}

          {/* Character Info */}
          <motion.div variants={fadeIn('up', 'tween', 0.4, 1)} style={styles.infoPanel}>
            <div style={styles.characterPanel}>
              <h2 style={{ ...styles.panelTitle, color: '#BB86FC' }}>Character</h2>
              <p style={styles.panelText}>Style: {gameState.character.stats.parentingStyle}</p>
              <p style={styles.panelText}>Background: {gameState.character.stats.familyBackground}</p>
              <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(187, 134, 252, 0.2)', paddingTop: '0.75rem' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: '600', color: '#03DAC6', marginBottom: '0.5rem' }}>Child</h3>
                <p style={styles.panelText}>Age: {gameState.child.age}</p>
              </div>
            </div>
            
            {/* Attribute Value Display Panel */}
            <div style={styles.childPanel}>
              <h2 style={{ ...styles.panelTitle, color: '#03DAC6' }}>Attributes</h2>
              
              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.875rem', color: '#FFC107' }}>Mood</span>
                  <span style={{ fontSize: '0.875rem', color: gameState.child.mood > 0 ? '#4CAF50' : gameState.child.mood < 0 ? '#F44336' : '#9E9E9E' }}>
                    {gameState.child.mood}
                  </span>
                </div>
                <div style={{ width: '100%', height: '0.5rem', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '0.25rem', overflow: 'hidden' }}>
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
              </div>
              
              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.875rem', color: '#BB86FC' }}>Academic</span>
                  <span style={{ fontSize: '0.875rem', color: '#BB86FC' }}>
                    {gameState.child.academicPerformance}
                  </span>
                </div>
                <div style={{ width: '100%', height: '0.5rem', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '0.25rem', overflow: 'hidden' }}>
                  <div 
                    style={{
                      height: '100%',
                      width: `${calculateProgressPercentage(gameState.child.academicPerformance)}%`,
                      background: 'linear-gradient(90deg, #9C27B0, #BB86FC)',
                      borderRadius: '0.25rem'
                    }}
                  ></div>
                </div>
              </div>
              
              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.875rem', color: '#FF4081' }}>Social</span>
                  <span style={{ fontSize: '0.875rem', color: '#FF4081' }}>
                    {gameState.child.socialLife}
                  </span>
                </div>
                <div style={{ width: '100%', height: '0.5rem', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '0.25rem', overflow: 'hidden' }}>
                  <div 
                    style={{
                      height: '100%',
                      width: `${calculateProgressPercentage(gameState.child.socialLife)}%`,
                      background: 'linear-gradient(90deg, #FF4081, #FF80AB)',
                      borderRadius: '0.25rem'
                    }}
                  ></div>
                </div>
              </div>
              
              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.875rem', color: '#03DAC6' }}>Cultural</span>
                  <span style={{ fontSize: '0.875rem', color: '#03DAC6' }}>
                    {gameState.child.culturalConnection}
                  </span>
                </div>
                <div style={{ width: '100%', height: '0.5rem', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '0.25rem', overflow: 'hidden' }}>
                  <div 
                    style={{
                      height: '100%',
                      width: `${calculateProgressPercentage(gameState.child.culturalConnection)}%`,
                      background: 'linear-gradient(90deg, #00BCD4, #03DAC6)',
                      borderRadius: '0.25rem'
                    }}
                  ></div>
                </div>
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
                <DiceRoll isRolling={isRolling} diceValue={diceValue} />
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

          {/* Action Result */}
          {actionResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              style={styles.actionResult}
            >
              <h3 style={styles.resultTitle}>Result</h3>
              <p style={styles.resultDescription}>
                {actionResult.description.startsWith("Yes!") ? (
                  <>
                    <span style={{ color: '#03DAC6', fontWeight: 'bold', fontSize: '1.2rem' }}>Yes! </span>
                    {actionResult.description.substring(5)}
                  </>
                ) : actionResult.description.startsWith("Oh no!") ? (
                  <>
                    <span style={{ color: '#CF6679', fontWeight: 'bold', fontSize: '1.2rem' }}>Oh no! </span>
                    {actionResult.description.substring(7)}
                  </>
                ) : (
                  actionResult.description
                )}
              </p>
              <div style={styles.effectsContainer}>
                <h4 style={styles.effectsTitle}>Effects:</h4>
                <ul style={styles.effectsList}>
                  {Object.entries(actionResult.effects).map(([key, value]) => (
                    <li key={key} style={styles.effectItemList}>
                      <span style={styles.effectName}>{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                      <span style={{
                        ...styles.effectValue,
                        color: value > 0 ? '#03DAC6' : '#CF6679'
                      }}>
                        {value > 0 ? `+${value}` : value}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <motion.button
                onClick={handleNextScene}
                style={styles.primaryButton}
                whileHover={{ y: -2, boxShadow: '0 6px 15px rgba(187, 134, 252, 0.4)' }}
                whileTap={{ scale: 0.98 }}
              >
                Continue
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {/* Achievement Notification */}
      {showAchievement && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: 'rgba(30, 30, 30, 0.9)',
            borderRadius: '0.5rem',
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(187, 134, 252, 0.3)',
            zIndex: 1000,
            animation: 'slideIn 0.3s ease-out'
          }}
        >
          <div style={{ fontSize: '2rem' }}>{showAchievement.icon}</div>
          <div>
            <div style={{ color: '#BB86FC', fontWeight: 'bold', marginBottom: '0.25rem' }}>
              Achievement Unlocked!
            </div>
            <div style={{ color: '#ffffff', fontWeight: 'bold' }}>{showAchievement.title}</div>
            <div style={{ color: '#ffffff', opacity: 0.8, fontSize: '0.875rem' }}>
              {showAchievement.description}
            </div>
          </div>
        </div>
      )}
      <AudioControls />
    </div>
  );
}

