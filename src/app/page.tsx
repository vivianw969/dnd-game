'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-8 max-w-2xl">
        <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 animate-fade-in-up">
          AI Parenting Simulator
        </h1>
        <p className="text-xl text-gray-400 animate-fade-in-up animation-delay-200">
          Experience the challenges and joys of parenting in a unique AI-powered simulation game
        </p>
        <div className="animate-fade-in-up animation-delay-400">
          <Link
            href="/mode"
            className="inline-flex items-center px-8 py-4 text-lg font-medium text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
          >
            Let&apos;s Go
          </Link>
        </div>
      </div>
    </main>
  );
}
