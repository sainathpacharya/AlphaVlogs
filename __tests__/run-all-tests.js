#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🧪 JackMarvelsApp Comprehensive Test Suite');
console.log('==========================================\n');

// Test categories and their patterns
const testCategories = {
  'Screens': {
    pattern: '__tests__/screens/**/*.test.{ts,tsx}',
    description: 'Screen component tests (Registration, Dashboard, etc.)',
    priority: 'high'
  },
  'Services': {
    pattern: '__tests__/services/**/*.test.{ts,tsx}',
    description: 'Service layer tests (auth, API, mock services)',
    priority: 'high'
  },
  'Hooks': {
    pattern: '__tests__/hooks/**/*.test.{ts,tsx}',
    description: 'Custom React hooks tests (useAuth, useTranslation, etc.)',
    priority: 'high'
  },
  'Stores': {
    pattern: '__tests__/stores/**/*.test.{ts,tsx}',
    description: 'State management tests (Zustand stores)',
    priority: 'medium'
  },
  'Utils': {
    pattern: '__tests__/utils/**/*.test.{ts,tsx}',
    description: 'Utility function tests (colors, navigation, platform)',
    priority: 'medium'
  },
  'Integration': {
    pattern: '__tests__/integration/**/*.test.{ts,tsx}',
    description: 'Integration tests (end-to-end workflows)',
    priority: 'low'
  }
};

// Test execution modes
const testModes = {
  'all': {
    command: 'npm test',
    description: 'Run all tests with coverage',
    flags: ['--coverage', '--verbose']
  },
  'watch': {
    command: 'npm run test:watch',
    description: 'Run tests in watch mode',
    flags: []
  },
  'ci': {
    command: 'npm run test:ci',
    description: 'Run tests for CI/CD pipeline',
    flags: ['--ci', '--coverage', '--watchAll=false']
  },
  'debug': {
    command: 'npm test',
    description: 'Run tests with debug output',
    flags: ['--verbose', '--no-coverage', '--runInBand']
  }
};

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

function printHeader(title) {
  console.log(colorize(`\n${'='.repeat(50)}`, 'cyan'));
  console.log(colorize(title, 'bright'));
  console.log(colorize(`${'='.repeat(50)}`, 'cyan'));
}

function printSection(title, content) {
  console.log(colorize(`\n📋 ${title}`, 'yellow'));
  console.log(colorize('─'.repeat(30), 'blue'));
  console.log(content);
}

function runCommand(command, description, options = {}) {
  const { silent = false, timeout = 30000 } = options;
  
  console.log(colorize(`\n💻 ${description}`, 'magenta'));
  console.log(colorize(`Command: ${command}`, 'gray'));
  
  try {
    const startTime = Date.now();
    const result = execSync(command, { 
      stdio: silent ? 'pipe' : 'inherit',
      cwd: process.cwd(),
      timeout
    });
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log(colorize(`✅ Completed in ${duration}s`, 'green'));
    return { success: true, duration: parseFloat(duration) };
  } catch (error) {
    console.error(colorize(`❌ Failed: ${error.message}`, 'red'));
    return { success: false, error: error.message };
  }
}

function checkTestFiles() {
  printHeader('Test File Analysis');
  
  let totalTests = 0;
  let totalFiles = 0;
  
  Object.entries(testCategories).forEach(([category, config]) => {
    const testFiles = findTestFiles(config.pattern);
    const fileCount = testFiles.length;
    const testCount = countTestsInFiles(testFiles);
    
    totalFiles += fileCount;
    totalTests += testCount;
    
    const status = fileCount > 0 ? colorize('✓', 'green') : colorize('✗', 'red');
    const priority = config.priority === 'high' ? colorize('HIGH', 'red') : 
                    config.priority === 'medium' ? colorize('MED', 'yellow') : 
                    colorize('LOW', 'blue');
    
    console.log(`${status} ${category.padEnd(12)} | ${fileCount.toString().padStart(3)} files | ${testCount.toString().padStart(3)} tests | ${priority}`);
  });
  
  console.log(colorize('\n' + '─'.repeat(50), 'blue'));
  console.log(colorize(`Total: ${totalFiles} files, ${totalTests} tests`, 'bright'));
  
  return { totalFiles, totalTests };
}

function findTestFiles(pattern) {
  try {
    const result = execSync(`find . -name "${pattern.replace('**', '*')}" -type f`, { 
      stdio: 'pipe',
      cwd: process.cwd()
    });
    return result.toString().trim().split('\n').filter(Boolean);
  } catch {
    return [];
  }
}

function countTestsInFiles(files) {
  let totalTests = 0;
  files.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const testMatches = content.match(/(it\(|test\(|describe\()/g);
      if (testMatches) {
        totalTests += testMatches.length;
      }
    } catch {
      // Ignore files that can't be read
    }
  });
  return totalTests;
}

function runCategoryTests(category, config) {
  printSection(`${category} Tests`, config.description);
  
  const testFiles = findTestFiles(config.pattern);
  if (testFiles.length === 0) {
    console.log(colorize('No test files found', 'yellow'));
    return { success: true, tests: 0 };
  }
  
  const command = `npm test -- ${testFiles.join(' ')}`;
  const result = runCommand(command, `Running ${category} tests`);
  
  return { ...result, tests: testFiles.length };
}

function runAllTests() {
  printHeader('Running All Tests');
  
  const mode = process.argv[2] || 'all';
  const modeConfig = testModes[mode];
  
  if (!modeConfig) {
    console.error(colorize(`❌ Unknown test mode: ${mode}`, 'red'));
    console.log(colorize('\nAvailable modes:', 'yellow'));
    Object.keys(testModes).forEach(mode => {
      console.log(`  ${mode.padEnd(8)} - ${testModes[mode].description}`);
    });
    process.exit(1);
  }
  
  const command = modeConfig.flags.length > 0 ? 
    `${modeConfig.command} ${modeConfig.flags.join(' ')}` : 
    modeConfig.command;
  
  const result = runCommand(command, modeConfig.description);
  
  if (result.success) {
    console.log(colorize('\n🎉 All tests completed successfully!', 'green'));
  } else {
    console.log(colorize('\n💥 Some tests failed!', 'red'));
    process.exit(1);
  }
}

function runSpecificCategory(category) {
  const config = testCategories[category];
  if (!config) {
    console.error(colorize(`❌ Unknown category: ${category}`, 'red'));
    console.log(colorize('\nAvailable categories:', 'yellow'));
    Object.keys(testCategories).forEach(cat => {
      console.log(`  ${cat.padEnd(12)} - ${testCategories[cat].description}`);
    });
    process.exit(1);
  }
  
  printHeader(`Running ${category} Tests`);
  const result = runCategoryTests(category, config);
  
  if (result.success) {
    console.log(colorize(`\n✅ ${category} tests completed!`, 'green'));
  } else {
    console.log(colorize(`\n❌ ${category} tests failed!`, 'red'));
    process.exit(1);
  }
}

function showHelp() {
  printHeader('Test Runner Help');
  
  console.log(colorize('\nUsage:', 'bright'));
  console.log('  node __tests__/run-all-tests.js [command] [options]');
  
  console.log(colorize('\nCommands:', 'bright'));
  console.log('  all                    Run all tests with coverage');
  console.log('  watch                  Run tests in watch mode');
  console.log('  ci                     Run tests for CI/CD');
  console.log('  debug                  Run tests with debug output');
  console.log('  check                  Check test files and show statistics');
  console.log('  [category]             Run tests for specific category');
  console.log('  help                   Show this help message');
  
  console.log(colorize('\nCategories:', 'bright'));
  Object.entries(testCategories).forEach(([category, config]) => {
    const priority = config.priority === 'high' ? '🔴' : 
                    config.priority === 'medium' ? '🟡' : '🟢';
    console.log(`  ${priority} ${category.padEnd(12)} - ${config.description}`);
  });
  
  console.log(colorize('\nExamples:', 'bright'));
  console.log('  node __tests__/run-all-tests.js all');
  console.log('  node __tests__/run-all-tests.js watch');
  console.log('  node __tests__/run-all-tests.js screens');
  console.log('  node __tests__/run-all-tests.js services');
  console.log('  node __tests__/run-all-tests.js check');
}

// Main execution
const command = process.argv[2] || 'all';

switch (command) {
  case 'help':
  case '--help':
  case '-h':
    showHelp();
    break;
  case 'check':
    checkTestFiles();
    break;
  case 'all':
  case 'watch':
  case 'ci':
  case 'debug':
    runAllTests();
    break;
  default:
    if (testCategories[command]) {
      runSpecificCategory(command);
    } else {
      console.error(colorize(`❌ Unknown command: ${command}`, 'red'));
      showHelp();
      process.exit(1);
    }
}
