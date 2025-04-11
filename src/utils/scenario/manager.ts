import { ScenarioTemplate } from '@/types/scenario';

export class ScenarioManager {
  private static instance: ScenarioManager;
  private scenarios: Map<string, ScenarioTemplate> = new Map();

  private constructor() {}

  public static getInstance(): ScenarioManager {
    if (!ScenarioManager.instance) {
      ScenarioManager.instance = new ScenarioManager();
    }
    return ScenarioManager.instance;
  }

  public async loadScenario(scenarioId: string): Promise<ScenarioTemplate> {
    if (this.scenarios.has(scenarioId)) {
      return this.scenarios.get(scenarioId)!;
    }

    try {
      const response = await fetch(`/api/scenarios/${scenarioId}`);
      if (!response.ok) {
        throw new Error(`Failed to load scenario: ${response.statusText}`);
      }

      const scenario: ScenarioTemplate = await response.json();
      this.scenarios.set(scenarioId, scenario);
      return scenario;
    } catch (error) {
      console.error('Error loading scenario:', error);
      throw error;
    }
  }

  public getScenario(scenarioId: string): ScenarioTemplate | undefined {
    return this.scenarios.get(scenarioId);
  }

  public validateScenario(scenario: ScenarioTemplate): boolean {
    try {
      // Check required fields
      if (!scenario.id || !scenario.name || !scenario.version) {
        return false;
      }

      // Validate settings
      if (!scenario.settings?.initialAttributes || !scenario.settings?.childAttributes) {
        return false;
      }

      // Validate scenes
      if (!scenario.scenes || Object.keys(scenario.scenes).length === 0) {
        return false;
      }

      // Validate each scene
      for (const [sceneId, scene] of Object.entries(scenario.scenes)) {
        if (!scene.id || !scene.title || !scene.description || !scene.actions) {
          return false;
        }

        // Validate actions
        for (const action of scene.actions) {
          if (!action.id || !action.text || !action.outcomes) {
            return false;
          }

          // Validate outcomes
          if (!action.outcomes.success || !action.outcomes.failure) {
            return false;
          }
        }
      }

      return true;
    } catch (error) {
      console.error('Error validating scenario:', error);
      return false;
    }
  }

  public getInitialState(scenario: ScenarioTemplate) {
    const initialState: any = {
      attributes: {},
      childAttributes: {},
      flags: {},
    };

    // Set initial attributes
    for (const [key, attr] of Object.entries(scenario.settings.initialAttributes)) {
      initialState.attributes[key] = attr.base;
    }

    // Set child attributes
    for (const [key, attr] of Object.entries(scenario.settings.childAttributes)) {
      initialState.childAttributes[key] = attr.base;
    }

    // Set custom attributes
    if (scenario.settings.customAttributes) {
      for (const [key, attr] of Object.entries(scenario.settings.customAttributes)) {
        initialState[key] = attr.default;
      }
    }

    // Set flags
    if (scenario.flags) {
      for (const [key, flag] of Object.entries(scenario.flags)) {
        initialState.flags[key] = flag.default;
      }
    }

    return initialState;
  }
} 