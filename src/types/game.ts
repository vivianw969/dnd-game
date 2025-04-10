export interface GameState {
  character: {
    stats: {
      parentingStyle: string;
      familyBackground: string;
    };
  };
  child: {
    age: number;
    mood: number;
    academicPerformance: number;
    socialLife: number;
    culturalConnection: number;
  };
}

export interface GameSave {
  id: string;
  user_id: string;
  game_state: GameState;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  created_at: string;
} 