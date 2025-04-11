export interface StandardScenario {
  "Dnd-Scenario": string;
  attributes: {
    [key: string]: string;
  };
  baseSkills: {
    [key: string]: {
      attribute: string;
      description: string;
    };
  };
  startingPoint: string;
  playerCustomizations: {
    [key: string]: {
      description: string;
      content: {
        [key: string]: {
          description: string;
          attributeBonus: {
            [key: string]: number;
          };
        };
      };
    };
  };
}

export interface StandardGameState {
  attributes: {
    [key: string]: number;
  };
  skills: {
    [key: string]: {
      level: number;
      attribute: string;
    };
  };
  customizations: {
    [key: string]: string;
  };
  currentScene: string;
  flags: {
    [key: string]: boolean | number | string;
  };
}

export interface StandardAction {
  id: string;
  skill: string;
  description: string;
  requirements?: {
    attributes?: {
      [key: string]: number;
    };
    skills?: {
      [key: string]: number;
    };
    flags?: string[];
  };
  outcomes: {
    success: {
      text: string;
      effects: {
        attributes?: {
          [key: string]: number;
        };
        flags?: {
          [key: string]: boolean | number | string;
        };
      };
    };
    failure: {
      text: string;
      effects: {
        attributes?: {
          [key: string]: number;
        };
        flags?: {
          [key: string]: boolean | number | string;
        };
      };
    };
  };
} 