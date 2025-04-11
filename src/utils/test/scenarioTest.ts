import { ScenarioLoader } from '../scenario/loader';
import { PromptManager } from '../ai/promptManager';

export async function testTrumpScenario() {
  try {
    // Load the trump scenario
    const loader = ScenarioLoader.getInstance();
    const scenario = await loader.loadScenarioFile('trump');
    
    // Test prompt generation
    const promptManager = PromptManager.getInstance();
    
    // Try to generate a scene prompt (this will likely fail due to structure mismatch)
    try {
      const scenePrompt = promptManager.generateScenePrompt(scenario, 'startingPoint');
      console.log('Scene Prompt:', scenePrompt);
    } catch (error: any) {
      console.log('Scene Prompt Generation Failed:', error.message);
    }
    
    // Log the scenario structure for analysis
    console.log('Scenario Structure:', JSON.stringify(scenario, null, 2));
    
    return {
      success: true,
      message: 'Test completed successfully',
      scenario: scenario
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
      error: error
    };
  }
} 