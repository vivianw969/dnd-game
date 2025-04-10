'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { generateScene, generateActionResult } from '@/utils/openai/client';
import type { SceneResponse, ActionResultResponse } from '@/utils/openai/client';

interface GameState {
  currentScene: string;
  character: {
    name: string;
    stats: {
      attributes: {
        academicPressure: number;
        tigerDiscipline: number;
        socialEngineering: number;
        familyHonor: number;
        resourceManagement: number;
        emotionalTactics: number;
      };
      parentingStyle: string;
      familyBackground: string;
      availableSkills: string[];
    };
  };
  child: {
    name: string;
    age: number;
    mood: number;
    academicPerformance: number;
    socialLife: number;
    culturalConnection: number;
  };
}

interface GameAction {
  id: string;
  description: string;
  requiredAttribute?: string;
  requiredSkill?: string;
  successText: string;
  failureText: string;
}

interface Scene {
  id: string;
  description: string;
  actions: GameAction[];
}

export default function GameScene() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentScene, setCurrentScene] = useState<SceneResponse | null>(null);
  const [actionResult, setActionResult] = useState<ActionResultResponse | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadGameState = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          throw new Error('User not authenticated');
        }

        const { data: character, error } = await supabase
          .from('characters')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;

        const initialState: GameState = {
          currentScene: 'firstParentTeacherConference',
          character: {
            name: character.name,
            stats: character.stats,
          },
          child: {
            name: 'Alex',
            age: 10,
            mood: 50,
            academicPerformance: 50,
            socialLife: 50,
            culturalConnection: 50,
          },
        };

        setGameState(initialState);
        const scene = await generateScene(initialState);
        setCurrentScene(scene);
      } catch (error) {
        console.error('Error loading game state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadGameState();
  }, []);

  const rollD20 = () => {
    return Math.floor(Math.random() * 20) + 1;
  };

  const handleAction = async (action: GameAction) => {
    if (!gameState || !currentScene) return;

    setIsRolling(true);
    setActionResult(null);

    try {
      const roll = rollD20();
      const attributeValue = action.requiredAttribute 
        ? gameState.character.stats.attributes[action.requiredAttribute as keyof typeof gameState.character.stats.attributes] || 0
        : 0;
      
      const total = roll + attributeValue;
      const result = await generateActionResult(action, gameState, total);

      setActionResult(result);

      // Update child's stats based on action result
      setGameState(prev => {
        if (!prev) return null;
        return {
          ...prev,
          child: {
            ...prev.child,
            mood: Math.max(0, Math.min(100, prev.child.mood + result.effects.mood)),
            academicPerformance: Math.max(0, Math.min(100, prev.child.academicPerformance + result.effects.academicPerformance)),
            socialLife: Math.max(0, Math.min(100, prev.child.socialLife + result.effects.socialLife)),
            culturalConnection: Math.max(0, Math.min(100, prev.child.culturalConnection + result.effects.culturalConnection)),
          },
        };
      });

      // Generate new scene after a short delay
      setTimeout(async () => {
        const newScene = await generateScene(gameState);
        setCurrentScene(newScene);
        setActionResult(null);
      }, 3000);
    } catch (error) {
      console.error('Error handling action:', error);
      setError(error instanceof Error ? error.message : 'Failed to process action');
    } finally {
      setIsRolling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!gameState || !currentScene) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-orbitron mb-2">Parenting Adventure</h1>
          <p className="text-xl font-rajdhani text-gray-400">
            Welcome, {gameState.character.name}
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 shadow-lg mb-6">
          <h2 className="text-2xl font-orbitron mb-4">Current Scene</h2>
          <p className="text-lg font-rajdhani mb-6">
            {currentScene.description}
          </p>

          {actionResult && (
            <div className="mb-6 p-4 bg-gray-700 rounded-lg">
              <p className="text-lg font-rajdhani">{actionResult.description}</p>
            </div>
          )}

          <div className="space-y-4">
            {currentScene.actions.map(action => (
              <button
                key={action.id}
                onClick={() => handleAction(action)}
                disabled={isRolling}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-rajdhani text-lg transition-colors disabled:opacity-50"
              >
                {isRolling ? 'Rolling...' : action.description}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <h3 className="text-xl font-rajdhani mb-4">Your Child's Status</h3>
            <div className="space-y-2">
              <div>
                <label className="text-sm font-rajdhani">Mood</label>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${gameState.child.mood}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <label className="text-sm font-rajdhani">Academic Performance</label>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${gameState.child.academicPerformance}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <label className="text-sm font-rajdhani">Social Life</label>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${gameState.child.socialLife}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <label className="text-sm font-rajdhani">Cultural Connection</label>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${gameState.child.culturalConnection}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <h3 className="text-xl font-rajdhani mb-4">Your Parenting Profile</h3>
            <div className="space-y-2">
              {Object.entries(gameState.character.stats.attributes).map(([attribute, value]) => (
                <div key={attribute}>
                  <label className="text-sm font-rajdhani capitalize">
                    {attribute.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                  <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${(value / 20) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 