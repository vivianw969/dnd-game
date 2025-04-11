import { StandardGameState } from '@/types/scenario/standard';
import { ScenarioAdapter } from '../scenario/adapter';

export class GameStateManager {
  private static instance: GameStateManager;
  private adapter: ScenarioAdapter;
  private currentState: StandardGameState;

  private constructor() {
    this.adapter = ScenarioAdapter.getInstance();
    this.currentState = {
      attributes: {},
      skills: {},
      customizations: {},
      currentScene: "starting",
      flags: {}
    };
  }

  public static getInstance(): GameStateManager {
    if (!GameStateManager.instance) {
      GameStateManager.instance = new GameStateManager();
    }
    return GameStateManager.instance;
  }

  public initializeState(oldState: any): StandardGameState {
    this.currentState = this.adapter.convertGameState(oldState);
    return this.currentState;
  }

  public getState(): StandardGameState {
    return this.currentState;
  }

  public updateState(updates: Partial<StandardGameState>): StandardGameState {
    this.currentState = {
      ...this.currentState,
      ...updates,
      attributes: {
        ...this.currentState.attributes,
        ...updates.attributes
      },
      skills: {
        ...this.currentState.skills,
        ...updates.skills
      },
      customizations: {
        ...this.currentState.customizations,
        ...updates.customizations
      },
      flags: {
        ...this.currentState.flags,
        ...updates.flags
      }
    };
    return this.currentState;
  }

  public applyActionEffects(actionId: string, success: boolean): StandardGameState {
    const action = this.findAction(actionId);
    if (!action) {
      return this.currentState;
    }

    const effects = success ? action.outcomes.success.effects : action.outcomes.failure.effects;
    
    const updates: Partial<StandardGameState> = {
      attributes: {},
      flags: {}
    };

    // Apply attribute effects
    if (effects.attributes) {
      updates.attributes = { ...effects.attributes };
    }

    // Apply flag effects
    if (effects.flags) {
      updates.flags = { ...effects.flags };
    }

    return this.updateState(updates);
  }

  private findAction(actionId: string): any {
    // This is a placeholder - in a real implementation, you would look up the action
    // from your scenario data
    return {
      id: actionId,
      outcomes: {
        success: {
          effects: {
            attributes: {},
            flags: {}
          }
        },
        failure: {
          effects: {
            attributes: {},
            flags: {}
          }
        }
      }
    };
  }
} 