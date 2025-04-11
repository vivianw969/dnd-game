import { StandardScenario, StandardGameState, StandardAction } from '@/types/scenario/standard';

export class StandardPromptManager {
  private static instance: StandardPromptManager;

  private constructor() {}

  public static getInstance(): StandardPromptManager {
    if (!StandardPromptManager.instance) {
      StandardPromptManager.instance = new StandardPromptManager();
    }
    return StandardPromptManager.instance;
  }

  public generateScenePrompt(scenario: StandardScenario, gameState: StandardGameState): string {
    const basePrompt = this.getBasePrompt(scenario);
    const scenePrompt = this.getScenePrompt(scenario, gameState);
    const contextPrompt = this.getContextPrompt(scenario, gameState);

    return `${basePrompt}\n\n${scenePrompt}\n\n${contextPrompt}`;
  }

  private getBasePrompt(scenario: StandardScenario): string {
    return `You are a Game Master for a scenario titled "${scenario["Dnd-Scenario"]}". 

Key aspects of this scenario:
${scenario.startingPoint}

Available Attributes:
${Object.entries(scenario.attributes)
  .map(([attr, desc]) => `- ${attr}: ${desc}`)
  .join('\n')}`;
  }

  private getScenePrompt(scenario: StandardScenario, gameState: StandardGameState): string {
    return `Current Scene: ${gameState.currentScene}

Your character's current state:
${Object.entries(gameState.attributes)
  .map(([attr, value]) => `- ${attr}: ${value}`)
  .join('\n')}

Available Skills:
${Object.entries(gameState.skills)
  .map(([skill, details]) => `- ${skill} (${details.attribute}): Level ${details.level}`)
  .join('\n')}`;
  }

  private getContextPrompt(scenario: StandardScenario, gameState: StandardGameState): string {
    let prompt = 'Context and Requirements:\n';

    // Add customization context
    if (Object.keys(gameState.customizations).length > 0) {
      prompt += '\nYour Character Background:\n';
      for (const [category, choice] of Object.entries(gameState.customizations)) {
        const customization = scenario.playerCustomizations[category];
        if (customization && customization.content[choice]) {
          prompt += `- ${category}: ${choice}\n`;
          prompt += `  ${customization.content[choice].description}\n`;
        }
      }
    }

    // Add active flags
    if (Object.keys(gameState.flags).length > 0) {
      prompt += '\nActive Flags:\n';
      for (const [flag, value] of Object.entries(gameState.flags)) {
        prompt += `- ${flag}: ${value}\n`;
      }
    }

    return prompt;
  }

  public generateActionPrompt(scenario: StandardScenario, gameState: StandardGameState, action: StandardAction): string {
    const basePrompt = this.getBasePrompt(scenario);
    const actionPrompt = this.getActionPrompt(action);
    const outcomePrompt = this.getOutcomePrompt(action);

    return `${basePrompt}\n\n${actionPrompt}\n${outcomePrompt}`;
  }

  private getActionPrompt(action: StandardAction): string {
    let prompt = `Attempting Action: ${action.description}\n`;
    prompt += `Required Skill: ${action.skill}\n`;

    if (action.requirements) {
      prompt += '\nRequirements:\n';
      if (action.requirements.attributes) {
        prompt += 'Attributes:\n';
        for (const [attr, value] of Object.entries(action.requirements.attributes)) {
          prompt += `- ${attr}: ${value}\n`;
        }
      }
      if (action.requirements.skills) {
        prompt += 'Skills:\n';
        for (const [skill, value] of Object.entries(action.requirements.skills)) {
          prompt += `- ${skill}: ${value}\n`;
        }
      }
      if (action.requirements.flags) {
        prompt += 'Required Flags:\n';
        action.requirements.flags.forEach(flag => {
          prompt += `- ${flag}\n`;
        });
      }
    }

    return prompt;
  }

  private getOutcomePrompt(action: StandardAction): string {
    let prompt = 'Possible Outcomes:\n\n';

    prompt += 'Success:\n';
    prompt += `${action.outcomes.success.text}\n`;
    if (action.outcomes.success.effects.attributes) {
      prompt += 'Attribute Effects:\n';
      for (const [attr, value] of Object.entries(action.outcomes.success.effects.attributes)) {
        prompt += `- ${attr}: ${value > 0 ? '+' : ''}${value}\n`;
      }
    }
    if (action.outcomes.success.effects.flags) {
      prompt += 'Flag Effects:\n';
      for (const [flag, value] of Object.entries(action.outcomes.success.effects.flags)) {
        prompt += `- ${flag}: ${value}\n`;
      }
    }

    prompt += '\nFailure:\n';
    prompt += `${action.outcomes.failure.text}\n`;
    if (action.outcomes.failure.effects.attributes) {
      prompt += 'Attribute Effects:\n';
      for (const [attr, value] of Object.entries(action.outcomes.failure.effects.attributes)) {
        prompt += `- ${attr}: ${value > 0 ? '+' : ''}${value}\n`;
      }
    }
    if (action.outcomes.failure.effects.flags) {
      prompt += 'Flag Effects:\n';
      for (const [flag, value] of Object.entries(action.outcomes.failure.effects.flags)) {
        prompt += `- ${flag}: ${value}\n`;
      }
    }

    return prompt;
  }
} 