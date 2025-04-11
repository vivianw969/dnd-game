'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

interface CharacterAttributes {
  academicPressure: number;
  tigerDiscipline: number;
  socialEngineering: number;
  familyHonor: number;
  resourceManagement: number;
  emotionalTactics: number;
}

interface CharacterStats {
  attributes: CharacterAttributes;
  parentingStyle: string;
  familyBackground: string;
  availableSkills: string[];
}

const parentingStyles = {
  'Academic Taskmaster': {
    description: 'You are singularly focused on grades, test scores, and academic rankings. Nothing matters more than perfect report cards and admission to elite universities.',
    attributeBonus: { academicPressure: 2, emotionalTactics: 1 }
  },
  'Prestige Climber': {
    description: 'You obsessively collect status symbols and connections. Every activity must enhance your child\'s resume and your family\'s standing in the community.',
    attributeBonus: { socialEngineering: 2, resourceManagement: 1 }
  },
  'Cultural Purist': {
    description: 'You emphasize cultural heritage above all else. Your child must be fluent in your native language, respect traditions, and never become \'too Westernized.\'',
    attributeBonus: { familyHonor: 2, tigerDiscipline: 1 }
  },
  'Future Planner': {
    description: 'You\'ve mapped out your child\'s entire life through retirement. Every decision from elementary school to career choice has already been determined.',
    attributeBonus: { resourceManagement: 2, academicPressure: 1 }
  },
  'Talent Maximizer': {
    description: 'You\'re determined that your child will master multiple skills to perfection. Piano, violin, competitive math, and Olympic swimming are just the beginning.',
    attributeBonus: { tigerDiscipline: 2, socialEngineering: 1 }
  }
};

const familyBackgrounds = {
  'Traditional Immigrant': {
    description: 'First-generation immigrant who sacrificed everything for a better life. Your child must achieve success to justify the hardships you endured.',
    attributeBonus: { familyHonor: 2, emotionalTactics: 1 }
  },
  'Elite Professional': {
    description: 'Doctor, lawyer, or engineer with prestigious credentials. Your child must meet or exceed your professional success to maintain family standards.',
    attributeBonus: { academicPressure: 2, resourceManagement: 1 }
  },
  'Academic Legacy': {
    description: 'Family with generations of scholarly achievement and elite university attendance. Anything less than continuing this tradition is unthinkable.',
    attributeBonus: { familyHonor: 1, academicPressure: 2 }
  },
  'Entrepreneurial Success': {
    description: 'Self-made business achiever who built success through relentless hard work. Your child must demonstrate similar drive and results-oriented thinking.',
    attributeBonus: { tigerDiscipline: 2, resourceManagement: 1 }
  },
  'Competitive Community': {
    description: 'Living in an area where all parents are intensely involved and comparing children. Your parenting is constantly observed and judged by peers.',
    attributeBonus: { socialEngineering: 2, emotionalTactics: 1 }
  }
};

const baseSkills = {
  'Test Prep Drilling': { attribute: 'academicPressure', description: 'Conducting intensive study sessions and practice tests to ensure top scores on every examination.' },
  'Grade Negotiation': { attribute: 'academicPressure', description: 'Confronting teachers about marks and assignments, ensuring your child receives every possible point.' },
  'Strict Scheduling': { attribute: 'tigerDiscipline', description: 'Creating and enforcing a regimented timetable with minimal free time to maximize productivity.' },
  'Punishment System': { attribute: 'tigerDiscipline', description: 'Implementing appropriate consequences for any performance below expectations or rule violations.' },
  'Playdate Vetting': { attribute: 'socialEngineering', description: 'Carefully selecting acceptable friends based on their academic performance and parental occupation.' },
  'Activity Monitoring': { attribute: 'socialEngineering', description: 'Maintaining surveillance on all social interactions and swiftly intervening when necessary.' },
  'Relative Comparison': { attribute: 'familyHonor', description: 'Motivating your child through direct comparisons to cousins and other family members\' achievements.' },
  'Cultural Tradition Enforcement': { attribute: 'familyHonor', description: 'Ensuring rigorous participation in cultural practices, language learning, and family obligations.' },
  'Educational Investment': { attribute: 'resourceManagement', description: 'Allocating financial resources to the optimal combination of schools, programs, and educational materials.' },
  'Schedule Optimization': { attribute: 'resourceManagement', description: 'Maximizing each day\'s productive hours through careful planning and elimination of time-wasting activities.' },
  'Guilt Induction': { attribute: 'emotionalTactics', description: 'Reminding your child of family sacrifices made for their benefit to motivate greater effort and performance.' },
  'Conditional Approval': { attribute: 'emotionalTactics', description: 'Strategically providing love and praise only when expectations are met or exceeded.' }
};

type CreationStep = 'name' | 'parentingStyle' | 'familyBackground' | 'attributes' | 'skills';

export default function CharacterCreation() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<CreationStep>('name');
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [parentingStyle, setParentingStyle] = useState('');
  const [familyBackground, setFamilyBackground] = useState('');
  const [attributes, setAttributes] = useState<CharacterAttributes>({
    academicPressure: 10,
    tigerDiscipline: 10,
    socialEngineering: 10,
    familyHonor: 10,
    resourceManagement: 10,
    emotionalTactics: 10,
  });
  const [availablePoints, setAvailablePoints] = useState(20);
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);

  useEffect(() => {
    if (parentingStyle && familyBackground) {
      // Apply attribute bonuses from parenting style and family background
      const styleBonus = parentingStyles[parentingStyle as keyof typeof parentingStyles].attributeBonus;
      const backgroundBonus = familyBackgrounds[familyBackground as keyof typeof familyBackgrounds].attributeBonus;
      
      setAttributes(prev => {
        const newAttributes = { ...prev };
        Object.entries(styleBonus).forEach(([attr, bonus]) => {
          newAttributes[attr as keyof CharacterAttributes] += bonus;
        });
        Object.entries(backgroundBonus).forEach(([attr, bonus]) => {
          newAttributes[attr as keyof CharacterAttributes] += bonus;
        });
        return newAttributes;
      });
    }
  }, [parentingStyle, familyBackground]);

  useEffect(() => {
    // Calculate available skills based on attributes
    const skills = Object.entries(baseSkills)
      .filter(([_, skill]) => attributes[skill.attribute as keyof CharacterAttributes] >= 12)
      .map(([skillName]) => skillName);
    setAvailableSkills(skills);
  }, [attributes]);

  const handleAttributeChange = (attribute: keyof CharacterAttributes, value: number) => {
    const currentValue = attributes[attribute];
    const newValue = Math.max(1, Math.min(20, value));
    const pointDifference = newValue - currentValue;

    if (pointDifference > 0 && availablePoints < pointDifference) {
      return; // Not enough points
    }

    setAttributes(prev => ({
      ...prev,
      [attribute]: newValue
    }));
    setAvailablePoints(prev => prev - pointDifference);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      const characterStats: CharacterStats = {
        attributes,
        parentingStyle,
        familyBackground,
        availableSkills,
      };

      const { error } = await supabase
        .from('characters')
        .insert({
          user_id: user.id,
          name,
          stats: characterStats,
          created_at: new Date().toISOString(),
        });

      if (error) throw error;

      router.push('/game');
    } catch (error) {
      console.error('Error creating character:', error);
      // TODO: Add error message UI
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'name':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-rajdhani">What's your name?</h3>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="button"
              onClick={() => setCurrentStep('parentingStyle')}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-rajdhani text-lg transition-colors"
              disabled={!name}
            >
              Next
            </button>
          </div>
        );

      case 'parentingStyle':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-rajdhani">Choose Your Parenting Style</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(parentingStyles).map(([style, details]) => (
                <div
                  key={style}
                  className={`p-4 rounded-lg cursor-pointer transition-colors ${
                    parentingStyle === style ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                  onClick={() => setParentingStyle(style)}
                >
                  <h4 className="font-rajdhani font-bold">{style}</h4>
                  <p className="text-sm text-gray-300">{details.description}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setCurrentStep('name')}
                className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-rajdhani text-lg transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep('familyBackground')}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-rajdhani text-lg transition-colors"
                disabled={!parentingStyle}
              >
                Next
              </button>
            </div>
          </div>
        );

      case 'familyBackground':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-rajdhani">Choose Your Family Background</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(familyBackgrounds).map(([background, details]) => (
                <div
                  key={background}
                  className={`p-4 rounded-lg cursor-pointer transition-colors ${
                    familyBackground === background ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                  onClick={() => setFamilyBackground(background)}
                >
                  <h4 className="font-rajdhani font-bold">{background}</h4>
                  <p className="text-sm text-gray-300">{details.description}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setCurrentStep('parentingStyle')}
                className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-rajdhani text-lg transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep('attributes')}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-rajdhani text-lg transition-colors"
                disabled={!familyBackground}
              >
                Next
              </button>
            </div>
          </div>
        );

      case 'attributes':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-rajdhani">Distribute Your Attribute Points</h3>
            <p className="text-sm text-gray-400">Available points: {availablePoints}</p>
            {Object.entries(attributes).map(([attribute, value]) => (
              <div key={attribute} className="flex items-center justify-between">
                <label className="text-sm font-rajdhani capitalize">{attribute.replace(/([A-Z])/g, ' $1').trim()}</label>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleAttributeChange(attribute as keyof CharacterAttributes, value - 1)}
                    className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50"
                    disabled={value <= 1}
                  >
                    -
                  </button>
                  <span className="w-8 text-center">{value}</span>
                  <button
                    type="button"
                    onClick={() => handleAttributeChange(attribute as keyof CharacterAttributes, value + 1)}
                    className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50"
                    disabled={availablePoints <= 0}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setCurrentStep('familyBackground')}
                className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-rajdhani text-lg transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep('skills')}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-rajdhani text-lg transition-colors"
                disabled={availablePoints > 0}
              >
                Next
              </button>
            </div>
          </div>
        );

      case 'skills':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-rajdhani">Available Skills</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableSkills.map(skillName => {
                const skill = baseSkills[skillName as keyof typeof baseSkills];
                return (
                  <div key={skillName} className="p-4 bg-gray-700 rounded-lg">
                    <h4 className="font-rajdhani font-bold">{skillName}</h4>
                    <p className="text-sm text-gray-300">{skill.description}</p>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setCurrentStep('attributes')}
                className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-rajdhani text-lg transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-rajdhani text-lg transition-colors"
                disabled={isLoading}
              >
                {isLoading ? 'Creating...' : 'Start Parenting'}
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-3xl font-orbitron mb-6 text-center">Create Your Parenting Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-8">
        {renderStep()}
      </form>
    </div>
  );
} 