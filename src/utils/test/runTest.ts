import { testTrumpScenario } from './scenarioTest';

async function runTest() {
  console.log('Starting Trump Scenario Test...');
  const result = await testTrumpScenario();
  console.log('Test Result:', result);
}

// Run the test
runTest().catch(console.error); 