'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { generateScene, generateActionResult } from '@/utils/openai/client';
import { saveGame, loadGame, getCurrentUser, signOut } from '@/utils/supabase/client';
import { GameState } from '@/types/game';
import { supabase } from '@/utils/supabase/client';

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
      // 3秒后清除提示
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
      
      // Roll the dice with animation
      const rollInterval = setInterval(() => {
        setDiceRoll(rollD20());
      }, 100);

      // Stop rolling after 1 second
      setTimeout(() => {
        clearInterval(rollInterval);
        const finalRoll = rollD20();
        setDiceRoll(finalRoll);
        setIsRolling(false);
        
        // Process the action result
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
      
      // Update game state with new values
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
            <button
              onClick={loadInitialScene}
              className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading && !currentScene) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Parenting Adventure</h1>
            <div className="flex gap-4">
              <div className="relative">
                <button
                  onClick={handleSaveGame}
                  disabled={isLoading}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
                >
                  Save Game
                </button>
                {saveStatus.type && (
                  <div className={`absolute top-full left-0 mt-2 p-2 rounded ${
                    saveStatus.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {saveStatus.message}
                  </div>
                )}
              </div>
              <button
                onClick={handleSignOut}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Sign Out
              </button>
            </div>
          </div>
          
          {/* Character Info */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-blue-800 mb-2">Character</h2>
              <p className="text-gray-700">Style: {gameState.character.stats.parentingStyle}</p>
              <p className="text-gray-700">Background: {gameState.character.stats.familyBackground}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-green-800 mb-2">Child</h2>
              <p className="text-gray-700">Age: {gameState.child.age}</p>
            </div>
          </div>

          {/* Stats Display */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="text-sm font-semibold text-yellow-800 mb-1">Mood</h3>
              <div className="flex items-center">
                <div className="w-full bg-yellow-200 rounded-full h-2.5">
                  <div 
                    className="bg-yellow-500 h-2.5 rounded-full" 
                    style={{ width: `${((gameState.child.mood + 100) / 200) * 100}%` }}
                  ></div>
                </div>
                <span className="ml-2 text-sm font-medium text-yellow-800">{gameState.child.mood}</span>
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-sm font-semibold text-purple-800 mb-1">Academic</h3>
              <div className="flex items-center">
                <div className="w-full bg-purple-200 rounded-full h-2.5">
                  <div 
                    className="bg-purple-500 h-2.5 rounded-full" 
                    style={{ width: `${((gameState.child.academicPerformance + 100) / 200) * 100}%` }}
                  ></div>
                </div>
                <span className="ml-2 text-sm font-medium text-purple-800">{gameState.child.academicPerformance}</span>
              </div>
            </div>
            <div className="bg-pink-50 p-4 rounded-lg">
              <h3 className="text-sm font-semibold text-pink-800 mb-1">Social</h3>
              <div className="flex items-center">
                <div className="w-full bg-pink-200 rounded-full h-2.5">
                  <div 
                    className="bg-pink-500 h-2.5 rounded-full" 
                    style={{ width: `${((gameState.child.socialLife + 100) / 200) * 100}%` }}
                  ></div>
                </div>
                <span className="ml-2 text-sm font-medium text-pink-800">{gameState.child.socialLife}</span>
              </div>
            </div>
            <div className="bg-indigo-50 p-4 rounded-lg">
              <h3 className="text-sm font-semibold text-indigo-800 mb-1">Cultural</h3>
              <div className="flex items-center">
                <div className="w-full bg-indigo-200 rounded-full h-2.5">
                  <div 
                    className="bg-indigo-500 h-2.5 rounded-full" 
                    style={{ width: `${((gameState.child.culturalConnection + 100) / 200) * 100}%` }}
                  ></div>
                </div>
                <span className="ml-2 text-sm font-medium text-indigo-800">{gameState.child.culturalConnection}</span>
              </div>
            </div>
          </div>

          {/* Scene Display */}
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="text-center">
                <p className="text-red-500 mb-4">{error}</p>
                <button
                  onClick={loadInitialScene}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Retry
                </button>
              </div>
            ) : (
              <>
                <p className="text-gray-700 mb-4">{currentScene?.description}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentScene?.actions.map((action) => (
                    <button
                      key={action.id}
                      onClick={() => handleAction(action)}
                      disabled={isLoading}
                      className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow text-left"
                    >
                      <p className="font-medium text-gray-800">{action.description}</p>
                      {action.requiredAttribute && (
                        <p className="text-sm text-gray-500 mt-1">
                          Requires: {action.requiredAttribute}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Action Result Display */}
          {actionResult && (
            <div className="bg-green-50 p-6 rounded-lg mb-6">
              <p className="text-gray-700 mb-4">{actionResult.description}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <p className="text-sm text-yellow-800">Mood: {actionResult.effects.mood > 0 ? '+' : ''}{actionResult.effects.mood}</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="text-sm text-purple-800">Academic: {actionResult.effects.academicPerformance > 0 ? '+' : ''}{actionResult.effects.academicPerformance}</p>
                </div>
                <div className="bg-pink-50 p-3 rounded-lg">
                  <p className="text-sm text-pink-800">Social: {actionResult.effects.socialLife > 0 ? '+' : ''}{actionResult.effects.socialLife}</p>
                </div>
                <div className="bg-indigo-50 p-3 rounded-lg">
                  <p className="text-sm text-indigo-800">Cultural: {actionResult.effects.culturalConnection > 0 ? '+' : ''}{actionResult.effects.culturalConnection}</p>
                </div>
              </div>
              <div className="mt-4 flex justify-center">
                <button
                  onClick={handleNextScene}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
                >
                  Continue
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 