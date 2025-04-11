// This is a browser-compatible test script that can be run in the console
// without modifying any existing code

async function testTrumpScenario() {
  try {
    console.log('Starting Trump Scenario Test...');
    
    // Fetch the trump.json file
    const response = await fetch('/examples/trump.json');
    if (!response.ok) {
      throw new Error(`Failed to load trump.json: ${response.statusText}`);
    }
    
    const scenario = await response.json();
    console.log('Successfully loaded trump.json');
    console.log('Scenario Structure:', JSON.stringify(scenario, null, 2));
    
    // Analyze the structure
    console.log('\nStructure Analysis:');
    console.log('- Has Dnd-Scenario:', 'Dnd-Scenario' in scenario);
    console.log('- Has attributes:', 'attributes' in scenario);
    console.log('- Has baseSkills:', 'baseSkills' in scenario);
    console.log('- Has startingPoint:', 'startingPoint' in scenario);
    console.log('- Has playerCustomizations:', 'playerCustomizations' in scenario);
    
    // Check if it matches our expected structure
    const expectedStructure = {
      hasScenes: false,
      hasActions: false,
      hasOutcomes: false
    };
    
    // Log the result
    return {
      success: true,
      message: 'Test completed successfully',
      scenario: scenario,
      structureAnalysis: expectedStructure
    };
  } catch (error) {
    console.error('Test failed:', error);
    return {
      success: false,
      message: error.message,
      error: error
    };
  }
}

// Function to run the test
function runTest() {
  console.log('Running Trump Scenario Test...');
  testTrumpScenario()
    .then(result => {
      console.log('Test Result:', result);
    })
    .catch(error => {
      console.error('Test failed with error:', error);
    });
}

// Export the function for browser console use
window.runTrumpTest = runTest;

console.log('Trump Scenario Test loaded. Run with: runTrumpTest()'); 