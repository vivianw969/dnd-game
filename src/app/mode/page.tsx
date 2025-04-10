'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/utils/supabase/client';

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Choose Your Adventure</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <button
              onClick={handleStartNewGame}
              disabled={isLoading}
              className="bg-blue-500 text-white p-6 rounded-lg shadow-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              <h2 className="text-xl font-semibold mb-2">Start New Game</h2>
              <p className="text-blue-100">Begin a new parenting journey</p>
            </button>

            <button
              onClick={handleLoadGame}
              disabled={isLoading}
              className="bg-green-500 text-white p-6 rounded-lg shadow-lg hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              <h2 className="text-xl font-semibold mb-2">Load Game</h2>
              <p className="text-green-100">Continue your previous adventure</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 