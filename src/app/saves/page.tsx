'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getGameSaves, GameSave } from '@/utils/supabase/client';

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Your Game Saves</h1>

          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={loadSaves}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Retry
              </button>
            </div>
          ) : saves.length === 0 ? (
            <div className="text-center">
              <p className="text-gray-600 mb-4">No saved games found.</p>
              <button
                onClick={() => router.push('/mode')}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Start New Game
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {saves.map((save) => (
                <div
                  key={save.id}
                  className="bg-gray-50 p-6 rounded-lg shadow hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800">
                        Save from {formatDate(save.created_at)}
                      </h2>
                      <p className="text-sm text-gray-500">
                        Last updated: {formatDate(save.updated_at)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleLoadSave(save.id)}
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                      Load Game
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-yellow-50 p-3 rounded">
                      <p className="text-sm text-yellow-800">Mood: {save.game_state.child.mood}</p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded">
                      <p className="text-sm text-purple-800">Academic: {save.game_state.child.academicPerformance}</p>
                    </div>
                    <div className="bg-pink-50 p-3 rounded">
                      <p className="text-sm text-pink-800">Social: {save.game_state.child.socialLife}</p>
                    </div>
                    <div className="bg-indigo-50 p-3 rounded">
                      <p className="text-sm text-indigo-800">Cultural: {save.game_state.child.culturalConnection}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 