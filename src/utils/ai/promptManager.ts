import { ScenarioTemplate } from '@/types/scenario';

export class PromptManager {
  private static instance: PromptManager;

  private constructor() {}

  public static getInstance(): PromptManager {
    if (!PromptManager.instance) {
      PromptManager.instance = new PromptManager();
    }
    return PromptManager.instance;
  }

  public generateScenePrompt(scenario: ScenarioTemplate, sceneId: string): string {
    const scene = scenario.scenes[sceneId];
    if (!scene) {
      throw new Error(`Scene ${sceneId} not found in scenario`);
    }

    const basePrompt = this.getBasePrompt(scenario);
    const scenePrompt = this.getSceneSpecificPrompt(scene);
    const contextPrompt = this.getContextPrompt(scenario, scene);

    return `${basePrompt}\n\n${scenePrompt}\n\n${contextPrompt}`;
  }

  private getBasePrompt(scenario: ScenarioTemplate): string {
    return `You are a Dungeon Master for a scenario titled "${scenario.name}". 
This is a ${scenario.metadata.difficulty} difficulty scenario designed for level ${scenario.metadata.recommendedLevel} characters.
The scenario is written by ${scenario.author} and is version ${scenario.version}.

Key aspects of this scenario:
${scenario.description}

Tags: ${scenario.metadata.tags.join(', ')}
Estimated duration: ${scenario.metadata.estimatedDuration}`;
  }

  private getSceneSpecificPrompt(scene: ScenarioTemplate['scenes'][string]): string {
    let prompt = `Current Scene: ${scene.title}\n${scene.description}\n\n`;

    if (scene.type === 'story') {
      prompt += 'As the DM, narrate this story scene vividly and engagingly.';
    } else if (scene.type === 'choice') {
      prompt += 'Present the choices to the players and guide them through their decision-making process.';
    } else if (scene.type === 'combat') {
      prompt += 'Manage this combat encounter, describing the environment, enemies, and combat actions.';
    } else if (scene.type === 'skill-check') {
      prompt += 'Guide the players through this skill check, describing the challenge and potential outcomes.';
    }

    return prompt;
  }

  private getContextPrompt(scenario: ScenarioTemplate, scene: ScenarioTemplate['scenes'][string]): string {
    let prompt = 'Context and Requirements:\n';

    if (scene.requirements) {
      if (scene.requirements.attributes) {
        prompt += 'Required Attributes:\n';
        Object.entries(scene.requirements.attributes).forEach(([attr, value]) => {
          prompt += `- ${attr}: ${value}\n`;
        });
      }

      if (scene.requirements.flags) {
        prompt += 'Required Flags:\n';
        scene.requirements.flags.forEach(flag => {
          prompt += `- ${flag}\n`;
        });
      }
    }

    prompt += '\nAvailable Actions:\n';
    scene.actions.forEach(action => {
      prompt += `- ${action.text} (${action.type})\n`;
      if (action.requirements) {
        prompt += '  Requirements:\n';
        if (action.requirements.attributes) {
          Object.entries(action.requirements.attributes).forEach(([attr, value]) => {
            prompt += `    - ${attr}: ${value}\n`;
          });
        }
        if (action.requirements.flags) {
          action.requirements.flags.forEach(flag => {
            prompt += `    - Flag: ${flag}\n`;
          });
        }
      }
    });

    return prompt;
  }

  public generateActionPrompt(scenario: ScenarioTemplate, sceneId: string, actionId: string): string {
    const scene = scenario.scenes[sceneId];
    const action = scene.actions.find(a => a.id === actionId);
    
    if (!action) {
      throw new Error(`Action ${actionId} not found in scene ${sceneId}`);
    }

    const basePrompt = this.getBasePrompt(scenario);
    const actionPrompt = `Processing action: ${action.text}\nType: ${action.type}\n\n`;
    const outcomePrompt = this.getOutcomePrompt(action);

    return `${basePrompt}\n\n${actionPrompt}\n${outcomePrompt}`;
  }

  private getOutcomePrompt(action: ScenarioTemplate['scenes'][string]['actions'][0]): string {
    let prompt = 'Possible Outcomes:\n\n';

    prompt += 'Success:\n';
    prompt += `${action.outcomes.success.text}\n`;
    prompt += 'Effects:\n';
    Object.entries(action.outcomes.success.effects).forEach(([attr, value]) => {
      prompt += `- ${attr}: ${value}\n`;
    });

    prompt += '\nFailure:\n';
    prompt += `${action.outcomes.failure.text}\n`;
    prompt += 'Effects:\n';
    Object.entries(action.outcomes.failure.effects).forEach(([attr, value]) => {
      prompt += `- ${attr}: ${value}\n`;
    });

    return prompt;
  }
} 