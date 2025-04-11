import { ScenarioTemplate } from '@/types/scenario';
import { StandardScenario } from '@/types/scenario/standard';
import { ScenarioAdapter } from './adapter';

export class ScenarioLoader {
  private static instance: ScenarioLoader;
  private adapter: ScenarioAdapter;

  private constructor() {
    this.adapter = ScenarioAdapter.getInstance();
  }

  public static getInstance(): ScenarioLoader {
    if (!ScenarioLoader.instance) {
      ScenarioLoader.instance = new ScenarioLoader();
    }
    return ScenarioLoader.instance;
  }

  public async loadScenario(scenarioId: string): Promise<StandardScenario> {
    try {
      // Try to load as standard format first
      const response = await fetch(`/examples/${scenarioId}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load scenario: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Check if it's already in standard format
      if (this.isStandardFormat(data)) {
        return data as StandardScenario;
      }

      // If not, convert from old format
      return this.adapter.convertToStandardFormat(data as ScenarioTemplate);
    } catch (error) {
      console.error('Error loading scenario:', error);
      throw error;
    }
  }

  private isStandardFormat(data: any): boolean {
    return (
      data["Dnd-Scenario"] !== undefined &&
      data.attributes !== undefined &&
      data.baseSkills !== undefined &&
      data.startingPoint !== undefined &&
      data.playerCustomizations !== undefined
    );
  }

  public validateScenario(scenario: StandardScenario): boolean {
    try {
      // Check required fields
      if (!scenario["Dnd-Scenario"] || !scenario.attributes || !scenario.baseSkills || !scenario.startingPoint || !scenario.playerCustomizations) {
        return false;
      }

      // Validate attributes
      if (Object.keys(scenario.attributes).length === 0) {
        return false;
      }

      // Validate baseSkills
      for (const [skillName, skill] of Object.entries(scenario.baseSkills)) {
        if (!skill.attribute || !skill.description) {
          return false;
        }
        if (!scenario.attributes[skill.attribute]) {
          return false;
        }
      }

      // Validate playerCustomizations
      for (const [category, customization] of Object.entries(scenario.playerCustomizations)) {
        if (!customization.description || !customization.content) {
          return false;
        }
        for (const [option, details] of Object.entries(customization.content)) {
          if (!details.description || !details.attributeBonus) {
            return false;
          }
          for (const [attr, bonus] of Object.entries(details.attributeBonus)) {
            if (!scenario.attributes[attr]) {
              return false;
            }
          }
        }
      }

      return true;
    } catch (error) {
      console.error('Error validating scenario:', error);
      return false;
    }
  }
} 