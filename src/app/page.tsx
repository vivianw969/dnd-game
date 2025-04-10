'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from "next/image";

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleStartNewGame = () => {
    setIsLoading(true);
    router.push('/character');
  };

  const handleLoadGame = () => {
    setIsLoading(true);
    // TODO: Implement load game functionality
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
       


        <div className="text-center animate-fade-in-up">
          <h1 className="text-6xl font-orbitron mb-8">D&D AI Game</h1>
          <p className="text-xl font-rajdhani mb-12">Choose your adventure</p>
          
          <div className="space-y-4">
            <button
              onClick={handleStartNewGame}
              disabled={isLoading}
              className="w-64 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-rajdhani text-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Start New Game'}
            </button>
            
            <button
              onClick={handleLoadGame}
              disabled={isLoading}
              className="w-64 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-rajdhani text-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Load Game'}
            </button>
          </div>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
