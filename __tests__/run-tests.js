#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🧪 Running JackMarvelsApp Test Suite...\n');

const testCommands = [
  {
    name: 'All Tests',
    command: 'npm test',
    description: 'Run all tests with coverage',
  },
  {
    name: 'Registration Screen Tests',
    command: 'npm test -- __tests__/screens/Registration',
    description: 'Run Registration screen specific tests',
  },
  {
    name: 'Watch Mode',
    command: 'npm run test:watch',
    description: 'Run tests in watch mode',
  },
  {
    name: 'Coverage Report',
    command: 'npm run test:coverage',
    description: 'Generate detailed coverage report',
  },
];

function runCommand(command, description) {
  console.log(`\n📋 ${description}`);
  console.log(`💻 Command: ${command}`);
  console.log('─'.repeat(50));

  try {
    execSync(command, {
      stdio: 'inherit',
      cwd: process.cwd(),
    });
    console.log(`✅ ${description} - Completed successfully\n`);
  } catch (error) {
    console.error(`❌ ${description} - Failed with error:`, error.message);
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const testType = args[0] || 'all';

switch (testType) {
  case 'all':
    runCommand(testCommands[0].command, testCommands[0].description);
    break;
  case 'registration':
    runCommand(testCommands[1].command, testCommands[1].description);
    break;
  case 'watch':
    runCommand(testCommands[2].command, testCommands[2].description);
    break;
  case 'coverage':
    runCommand(testCommands[3].command, testCommands[3].description);
    break;
  default:
    console.log('Available test commands:');
    testCommands.forEach((cmd, index) => {
      console.log(`  ${index + 1}. ${cmd.name}: ${cmd.description}`);
    });
    console.log('\nUsage: node __tests__/run-tests.js [all|registration|watch|coverage]');
    break;
}
