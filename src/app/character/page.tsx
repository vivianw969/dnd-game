'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const parentingStyles = [
  { id: 'authoritative', name: 'Authoritative', description: 'High responsiveness, high demands. Sets clear rules and expectations while being warm and supportive.' },
  { id: 'authoritarian', name: 'Authoritarian', description: 'High demands, low responsiveness. Strict rules with little room for negotiation.' },
  { id: 'permissive', name: 'Permissive', description: 'High responsiveness, low demands. Few rules and high warmth.' },
  { id: 'uninvolved', name: 'Uninvolved', description: 'Low responsiveness, low demands. Minimal interaction and few rules.' },
];

const familyBackgrounds = [
  { id: 'middle-class', name: 'Middle Class', description: 'Stable income, comfortable lifestyle, emphasis on education and personal development.' },
  { id: 'working-class', name: 'Working Class', description: 'Modest income, practical values, emphasis on hard work and responsibility.' },
  { id: 'upper-class', name: 'Upper Class', description: 'Wealthy background, access to resources, emphasis on achievement and status.' },
  { id: 'immigrant', name: 'Immigrant Family', description: 'Cultural diversity, strong family ties, emphasis on tradition and adaptation.' },
];

export default function CharacterInit() {
  const router = useRouter();
  const [step, setStep] = useState<'parenting' | 'background'>('parenting');
  const [selectedParenting, setSelectedParenting] = useState<string>('');
  const [selectedBackground, setSelectedBackground] = useState<string>('');

  const handleParentingSelect = (style: string) => {
    setSelectedParenting(style);
    setStep('background');
  };

  const handleBackgroundSelect = (background: string) => {
    setSelectedBackground(background);
    // 构建查询参数并导航到游戏页面
    const queryParams = new URLSearchParams({
      parentingStyle: selectedParenting,
      familyBackground: background
    });
    router.push(`/game?${queryParams.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {step === 'parenting' ? 'Choose Your Parenting Style' : 'Select Your Family Background'}
          </h1>
          <p className="text-gray-600">
            {step === 'parenting' 
              ? 'Your parenting style will influence how you interact with your child and the outcomes of your decisions.'
              : 'Your family background will shape your character\'s values and available resources.'}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {(step === 'parenting' ? parentingStyles : familyBackgrounds).map((item) => (
            <button
              key={item.id}
              onClick={() => step === 'parenting' ? handleParentingSelect(item.id) : handleBackgroundSelect(item.id)}
              className={`p-6 rounded-lg border-2 transition-all ${
                (step === 'parenting' ? selectedParenting : selectedBackground) === item.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
              }`}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.name}</h3>
              <p className="text-gray-600 text-sm">{item.description}</p>
            </button>
          ))}
        </div>

        {step === 'background' && (
          <div className="mt-8 text-center">
            <button
              onClick={() => setStep('parenting')}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Parenting Style
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 