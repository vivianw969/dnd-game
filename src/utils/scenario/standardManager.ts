import { StandardScenario, StandardGameState, StandardAction } from '@/types/scenario/standard';

export class StandardScenarioManager {
  private static instance: StandardScenarioManager;
  private scenarios: Map<string, StandardScenario> = new Map();

  private constructor() {}

  public static getInstance(): StandardScenarioManager {
    if (!StandardScenarioManager.instance) {
      StandardScenarioManager.instance = new StandardScenarioManager();
    }
    return StandardScenarioManager.instance;
  }

  public async loadScenario(scenarioId: string): Promise<StandardScenario> {
    if (this.scenarios.has(scenarioId)) {
      return this.scenarios.get(scenarioId)!;
    }

    try {
      const response = await fetch(`/examples/${scenarioId}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load scenario: ${response.statusText}`);
      }

      const scenario: StandardScenario = await response.json();
      this.scenarios.set(scenarioId, scenario);
      return scenario;
    } catch (error) {
      console.error('Error loading scenario:', error);
      throw error;
    }
  }

  public getScenario(scenarioId: string): StandardScenario | undefined {
    return this.scenarios.get(scenarioId);
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

  public getInitialState(scenario: StandardScenario): StandardGameState {
    const initialState: StandardGameState = {
      attributes: {},
      skills: {},
      customizations: {},
      currentScene: scenario.startingPoint,
      flags: {}
    };

    // Initialize attributes
    for (const [attrName] of Object.entries(scenario.attributes)) {
      initialState.attributes[attrName] = 0;
    }

    // Initialize skills
    for (const [skillName, skill] of Object.entries(scenario.baseSkills)) {
      initialState.skills[skillName] = {
        level: 0,
        attribute: skill.attribute
      };
    }

    return initialState;
  }

  public generateAvailableActions(scenario: StandardScenario, gameState: StandardGameState): StandardAction[] {
    const actions: StandardAction[] = [];
    
    // Generate actions based on available skills
    for (const [skillName, skill] of Object.entries(scenario.baseSkills)) {
      if (gameState.skills[skillName]) {
        actions.push({
          id: `action_${skillName}`,
          skill: skillName,
          description: skill.description,
          requirements: {
            attributes: {
              [skill.attribute]: 0
            }
          },
          outcomes: {
            success: {
              text: `Successfully performed ${skillName}`,
              effects: {
                attributes: {
                  [skill.attribute]: 1
                }
              }
            },
            failure: {
              text: `Failed to perform ${skillName}`,
              effects: {
                attributes: {
                  [skill.attribute]: -1
                }
              }
            }
          }
        });
      }
    }

    return actions;
  }
} 