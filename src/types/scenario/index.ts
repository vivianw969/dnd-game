export interface ScenarioTemplate {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  metadata: {
    tags: string[];
    difficulty: 'easy' | 'medium' | 'hard';
    recommendedLevel: number;
    estimatedDuration: string;
  };
  settings: {
    initialAttributes: {
      [key: string]: {
        base: number;
        min: number;
        max: number;
        description: string;
      };
    };
    childAttributes: {
      [key: string]: {
        base: number;
        min: number;
        max: number;
        description: string;
      };
    };
    customAttributes?: {
      [key: string]: {
        type: 'number' | 'boolean' | 'string';
        default: any;
        description: string;
      };
    };
  };
  scenes: {
    [key: string]: {
      id: string;
      title: string;
      description: string;
      type: 'story' | 'choice' | 'combat' | 'skill-check';
      requirements?: {
        attributes?: {
          [key: string]: number;
        };
        flags?: string[];
      };
      actions: {
        id: string;
        text: string;
        type: 'success' | 'failure' | 'neutral';
        requirements?: {
          attributes?: {
            [key: string]: number;
          };
          flags?: string[];
        };
        outcomes: {
          success: {
            text: string;
            effects: {
              [key: string]: number;
            };
            nextScene?: string;
            flags?: string[];
          };
          failure: {
            text: string;
            effects: {
              [key: string]: number;
            };
            nextScene?: string;
            flags?: string[];
          };
        };
      }[];
      nextScene?: string;
    };
  };
  flags?: {
    [key: string]: {
      description: string;
      type: 'boolean' | 'number' | 'string';
      default: any;
    };
  };
  events?: {
    [key: string]: {
      trigger: {
        type: 'attribute' | 'flag' | 'scene';
        condition: string;
      };
      action: {
        type: 'setFlag' | 'modifyAttribute' | 'changeScene';
        value: any;
      };
    };
  };
} 