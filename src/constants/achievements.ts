export const ACHIEVEMENTS = {
  HARD_WORKER: {
    id: 'hard_worker',
    title: 'Hard Worker',
    description: 'Reached academic performance of 15',
    icon: '📚',
    color: '#BB86FC'
  },
  RAT_RACER_KING: {
    id: 'rat_racer_king',
    title: 'Rat Racer King',
    description: 'Master of the corporate ladder',
    icon: '👑',
    color: '#BB86FC'
  },
  OFFER_CLAIMER: {
    id: 'offer_claimer',
    title: 'Offer Claimer',
    description: 'Successfully turned your skills into a dream offer',
    icon: '📝',
    color: '#03DAC6'
  },
  MENTOR_MASTER: {
    id: 'mentor_master',
    title: 'Mentor Master',
    description: 'Guided others to success',
    icon: '🎓',
    color: '#FFD54F'
  },
  WORK_LIFE_HERO: {
    id: 'work_life_hero',
    title: 'Work-Life Hero',
    description: 'Achieved perfect balance in career and life',
    icon: '⚖️',
    color: '#CF6679'
  }
};

export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
};

export type AchievementId = keyof typeof ACHIEVEMENTS; 