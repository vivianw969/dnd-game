import { ScenarioTemplate } from '@/types/scenario';
import { StandardScenario, StandardGameState, StandardAction } from '@/types/scenario/standard';

export class ScenarioAdapter {
  private static instance: ScenarioAdapter;

  private constructor() {}

  public static getInstance(): ScenarioAdapter {
    if (!ScenarioAdapter.instance) {
      ScenarioAdapter.instance = new ScenarioAdapter();
    }
    return ScenarioAdapter.instance;
  }

  public convertToStandardFormat(oldScenario: ScenarioTemplate): StandardScenario {
    // Create a new standard scenario without modifying the original
    const standardScenario: StandardScenario = {
      "Dnd-Scenario": oldScenario.name,
      attributes: {},
      baseSkills: {},
      startingPoint: Object.values(oldScenario.scenes)[0]?.title || "Starting Scene",
      playerCustomizations: {}
    };

    // Convert attributes
    for (const [key, attr] of Object.entries(oldScenario.settings.initialAttributes)) {
      standardScenario.attributes[key] = attr.description;
    }

    // Convert skills from actions
    for (const [sceneId, scene] of Object.entries(oldScenario.scenes)) {
      for (const action of scene.actions) {
        if (!standardScenario.baseSkills[action.id]) {
          standardScenario.baseSkills[action.id] = {
            attribute: Object.keys(oldScenario.settings.initialAttributes)[0],
            description: action.text
          };
        }
      }
    }

    // Convert customizations
    if (oldScenario.settings.customAttributes) {
      standardScenario.playerCustomizations = {
        customAttributes: {
          description: "Custom Attributes",
          content: {}
        }
      };
    }

    return standardScenario;
  }

  public convertGameState(oldState: any): StandardGameState {
    const standardState: StandardGameState = {
      attributes: {},
      skills: {},
      customizations: {},
      currentScene: oldState.currentScene || "starting",
      flags: {}
    };

    // Convert attributes
    if (oldState.character?.stats?.attributes) {
      standardState.attributes = { ...oldState.character.stats.attributes };
    }

    // Convert skills
    if (oldState.character?.stats?.availableSkills) {
      for (const skill of oldState.character.stats.availableSkills) {
        standardState.skills[skill] = {
          level: 1,
          attribute: Object.keys(standardState.attributes)[0]
        };
      }
    }

    // Convert customizations
    if (oldState.character?.stats?.parentingStyle) {
      standardState.customizations.parentingStyle = oldState.character.stats.parentingStyle;
    }

    return standardState;
  }

  public convertAction(oldAction: any): StandardAction {
    return {
      id: oldAction.id,
      skill: oldAction.requiredSkill || oldAction.id,
      description: oldAction.description,
      requirements: {
        attributes: oldAction.requiredAttribute ? {
          [oldAction.requiredAttribute]: 0
        } : undefined
      },
      outcomes: {
        success: {
          text: oldAction.successText,
          effects: {
            attributes: {}
          }
        },
        failure: {
          text: oldAction.failureText,
          effects: {
            attributes: {}
          }
        }
      }
    };
  }
} 