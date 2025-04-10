import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export interface SceneResponse {
  description: string;
  actions: {
    id: string;
    description: string;
    requiredAttribute?: string;
    requiredSkill?: string;
    successText: string;
    failureText: string;
  }[];
}

export interface ActionResultResponse {
  description: string;
  effects: {
    mood: number;
    academicPerformance: number;
    socialLife: number;
    culturalConnection: number;
  };
}

export async function generateScene(gameState: any): Promise<SceneResponse> {
  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: `You are a game master for a parenting simulation game. 
        Create engaging scenes that reflect the player's parenting style and family background.
        Each scene must have 3-5 possible actions that the player can take.
        The actions should be meaningful and have different potential outcomes.
        Make sure the actions are diverse and cover different aspects of parenting.
        
        IMPORTANT: You must respond with a valid JSON object in the following format:
        {
          "description": "A detailed description of the scene",
          "actions": [
            {
              "id": "action1",
              "description": "Description of the first action",
              "requiredAttribute": "optional",
              "requiredSkill": "optional",
              "successText": "What happens on success",
              "failureText": "What happens on failure"
            },
            {
              "id": "action2",
              "description": "Description of the second action",
              "requiredAttribute": "optional",
              "requiredSkill": "optional",
              "successText": "What happens on success",
              "failureText": "What happens on failure"
            },
            {
              "id": "action3",
              "description": "Description of the third action",
              "requiredAttribute": "optional",
              "requiredSkill": "optional",
              "successText": "What happens on success",
              "failureText": "What happens on failure"
            },
            {
              "id": "action4",
              "description": "Description of the fourth action",
              "requiredAttribute": "optional",
              "requiredSkill": "optional",
              "successText": "What happens on success",
              "failureText": "What happens on failure"
            },
            {
              "id": "action5",
              "description": "Description of the fifth action",
              "requiredAttribute": "optional",
              "requiredSkill": "optional",
              "successText": "What happens on success",
              "failureText": "What happens on failure"
            }
          ]
        }`
      },
      {
        role: "user",
        content: `Generate a scene for a parent with:
        - Parenting Style: ${gameState.character.stats.parentingStyle}
        - Family Background: ${gameState.character.stats.familyBackground}
        - Child's Age: ${gameState.child.age}
        - Current Stats:
          * Mood: ${gameState.child.mood}
          * Academic Performance: ${gameState.child.academicPerformance}
          * Social Life: ${gameState.child.socialLife}
          * Cultural Connection: ${gameState.child.culturalConnection}`
      }
    ]
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No content in response');
  }

  try {
    const parsed = JSON.parse(content);
    // Validate the response structure
    if (!parsed.description || !Array.isArray(parsed.actions)) {
      throw new Error('Invalid response structure');
    }
    // Validate number of actions
    if (parsed.actions.length < 3 || parsed.actions.length > 5) {
      throw new Error('Invalid number of actions. Must be between 3 and 5.');
    }
    return parsed;
  } catch (error) {
    console.error('Error parsing scene response:', content);
    throw error;
  }
}

export async function generateActionResult(
  action: any,
  gameState: any,
  roll: number
): Promise<ActionResultResponse> {
  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: `You are a game master for a parenting simulation game.
        Determine the outcome of the player's action based on their roll and current game state.
        The roll is out of 20, where higher is better.
        Consider the player's parenting style and family background when determining the outcome.
        
        IMPORTANT: You must respond with a valid JSON object in the following format:
        {
          "description": "A detailed description of what happens",
          "effects": {
            "mood": number between -10 and 10,
            "academicPerformance": number between -10 and 10,
            "socialLife": number between -10 and 10,
            "culturalConnection": number between -10 and 10
          }
        }`
      },
      {
        role: "user",
        content: `Action: ${action.description}
        Roll: ${roll}/20
        Parenting Style: ${gameState.character.stats.parentingStyle}
        Family Background: ${gameState.character.stats.familyBackground}
        Current Stats:
          * Mood: ${gameState.child.mood}
          * Academic Performance: ${gameState.child.academicPerformance}
          * Social Life: ${gameState.child.socialLife}
          * Cultural Connection: ${gameState.child.culturalConnection}`
      }
    ]
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No content in response');
  }

  try {
    const parsed = JSON.parse(content);
    // Validate the response structure
    if (!parsed.description || !parsed.effects) {
      throw new Error('Invalid response structure');
    }
    return parsed;
  } catch (error) {
    console.error('Error parsing action result:', content);
    throw error;
  }
} 