# JackMarvelsApp Comprehensive Test Suite

This directory contains comprehensive unit tests for the JackMarvelsApp React Native application, covering all non-component files including services, hooks, stores, utilities, and screens.

## 📁 Test Structure

```
__tests__/
├── setup.ts                          # Jest configuration and global mocks
├── run-tests.js                      # Basic test runner script
├── run-all-tests.js                  # Comprehensive test runner with categories
├── README.md                         # This documentation
├── utils/
│   └── test-utils.tsx                # Test utilities and helpers
├── __mocks__/                        # Mock files for external dependencies
│   ├── react-native.js
│   ├── moti.js
│   ├── lucide-react-native.js
│   ├── react-native-reanimated.js
│   ├── gluestack-ui.js
│   ├── gluestack-style.js
│   ├── gluestack-ui-themed.js
│   ├── gluestack-ui-config.js
│   └── lottie-react-native.js
├── screens/                          # Screen component tests
│   ├── Registration.test.tsx         # Comprehensive Registration screen tests
│   ├── Registration.focused.test.tsx # Focused tests for specific bugs/features
│   └── Registration.simple.test.tsx  # Simplified test approach
├── services/                         # Service layer tests
│   ├── auth-service.test.ts          # Authentication service tests
│   ├── mock-api.test.ts              # Mock API service tests
│   └── [other services].test.ts      # Other service tests
├── hooks/                            # Custom hooks tests
│   ├── useAuth.test.tsx              # Authentication hook tests
│   ├── useTranslation.test.tsx       # Translation hook tests
│   └── [other hooks].test.tsx        # Other hook tests
├── stores/                           # State management tests
│   ├── user-store.test.ts            # User store tests
│   └── [other stores].test.ts        # Other store tests
└── utils/                            # Utility function tests
    ├── colors.test.tsx               # Theme colors tests
    ├── navigation.test.tsx           # Navigation utility tests
    ├── platform.test.ts              # Platform utility tests
    └── [other utils].test.ts         # Other utility tests
```

## 🚀 Running Tests

### Quick Start

```bash
# Run all tests
npm test

# Run specific test file
npm test Registration.test.tsx

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Using Comprehensive Test Runner

```bash
# Run all tests with coverage
node __tests__/run-all-tests.js all

# Run tests in watch mode
node __tests__/run-all-tests.js watch

# Run tests for CI/CD
node __tests__/run-all-tests.js ci

# Run tests with debug output
node __tests__/run-all-tests.js debug

# Check test files and statistics
node __tests__/run-all-tests.js check

# Run specific category tests
node __tests__/run-all-tests.js screens
node __tests__/run-all-tests.js services
node __tests__/run-all-tests.js hooks
node __tests__/run-all-tests.js stores
node __tests__/run-all-tests.js utils

# Show help
node __tests__/run-all-tests.js help
```

### Using Basic Test Runner Script

```bash
# Run all tests
node __tests__/run-tests.js all

# Run Registration screen tests only
node __tests__/run-tests.js registration

# Run tests in watch mode
node __tests__/run-tests.js watch

# Generate coverage report
node __tests__/run-tests.js coverage
```

## 🧪 Test Coverage

The test suite covers:

### Registration Screen Tests

- **Form Rendering**: All input fields, buttons, and UI components
- **Form Validation**: Email, mobile number, pincode, and required field validation
- **State Management**: Form state updates and error handling
- **School Selection**: Dropdown selection and custom school input
- **Registration Process**: Success and error scenarios
- **Button States**: Disabled/enabled states based on form completion
- **Accessibility**: Proper labels and keyboard handling

### Bug Fixes Validated

- ✅ Mobile number keyboard type (`mobile` → `mobileNumber`)
- ✅ Mobile number maxLength validation
- ✅ Pincode keyboard type and maxLength
- ✅ Email format validation
- ✅ School selection validation

## 📊 Comprehensive Test Coverage

The test suite covers all non-component files in the application:

### 🔴 High Priority Tests

#### **Services Layer** (`__tests__/services/`)

- **AuthService**: Authentication, registration, OTP verification, profile updates
- **MockApiService**: All mock API endpoints, data consistency, error handling
- **API Services**: Request/response handling, error scenarios, network simulation

#### **Custom Hooks** (`__tests__/hooks/`)

- **useAuth**: Login, registration, logout, profile management with React Query
- **useTranslation**: i18n integration, language switching, key validation
- **useNetwork**: Network status monitoring and handling
- **usePermissions**: Device permissions management

#### **Screen Components** (`__tests__/screens/`)

- **Registration Screen**: Form validation, state management, user interactions
- **Dashboard Screen**: Data loading, user interface, navigation
- **Profile Screen**: User data display, editing capabilities

### 🟡 Medium Priority Tests

#### **State Management** (`__tests__/stores/`)

- **UserStore**: Authentication state, user data, theme, language persistence
- **UserCachedStore**: Token management, data caching, secure storage

#### **Utility Functions** (`__tests__/utils/`)

- **Colors**: Theme switching, color consistency, accessibility
- **Navigation**: Route handling, parameter passing, deep linking
- **Platform**: Device detection, version information, OS-specific logic

### 🟢 Low Priority Tests

#### **Integration Tests** (`__tests__/integration/`)

- **End-to-End Workflows**: Complete user journeys across multiple screens
- **API Integration**: Real API calls with mocked responses
- **Cross-Component Communication**: Data flow between different parts of the app

## 🔧 Test Configuration

### Jest Configuration

- **Preset**: `react-native`
- **Test Environment**: `node`
- **Setup Files**: `__tests__/setup.ts`
- **Coverage Threshold**: 70% (branches, functions, lines, statements)
- **Test Timeout**: 30 seconds

### Mocked Dependencies

- React Native components and modules
- Navigation libraries
- UI component libraries (Gluestack UI)
- Animation libraries (Moti, Reanimated)
- Icon libraries (Lucide React Native)
- Services and utilities

## 📝 Writing Tests

### Test File Structure

```typescript
import React from 'react';
import {render, fireEvent, waitFor, act} from '@testing-library/react-native';
import {ComponentName} from '../../src/path/to/component';

// Mock dependencies
jest.mock('../../src/services/service-name');

describe('ComponentName', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Setup mocks
  });

  describe('Feature Group', () => {
    it('should test specific behavior', () => {
      // Test implementation
    });
  });
});
```

### Best Practices

1. **Clear Test Names**: Use descriptive test names that explain the expected behavior
2. **Arrange-Act-Assert**: Structure tests with clear setup, action, and verification
3. **Mock External Dependencies**: Mock all external services and components
4. **Test Edge Cases**: Include tests for error conditions and edge cases
5. **Clean Up**: Use `beforeEach` to reset mocks and state
6. **Async Testing**: Use `waitFor` and `act` for async operations

### Test Utilities

Use the provided test utilities in `__tests__/utils/test-utils.tsx`:

- `mockFormData`: Pre-filled form data for testing
- `mockNavigation`: Mock navigation object
- `mockThemeColors`: Mock theme colors
- `fillRegistrationForm()`: Helper to fill form fields
- `createMockAuthResponse()`: Helper to create mock API responses

## 🐛 Debugging Tests

### Common Issues

1. **Mock Not Working**: Ensure mocks are defined before imports
2. **Async Operations**: Use `waitFor` for async state updates
3. **Component Not Found**: Check if component is properly rendered
4. **State Updates**: Use `act` to wrap state-changing operations

### Debug Commands

```bash
# Run tests with verbose output
npm test -- --verbose

# Run specific test with debug info
npm test -- --testNamePattern="specific test name" --verbose

# Run tests and keep console output
npm test -- --silent=false
```

## 📊 Coverage Reports

Coverage reports are generated in the `coverage/` directory:

- **HTML Report**: `coverage/lcov-report/index.html`
- **JSON Report**: `coverage/coverage-final.json`
- **LCOV Report**: `coverage/lcov.info`

### Coverage Targets

- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

## 🔄 Continuous Integration

Tests are configured to run in CI environments with:

- No watch mode (`--ci`)
- Coverage reporting
- Fail on coverage threshold breach
- Timeout handling for slow tests

## 📚 Additional Resources

- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing React Native Apps](https://reactnative.dev/docs/testing-overview)

## 🤝 Contributing

When adding new tests:

1. Follow the existing test structure
2. Add appropriate mocks for new dependencies
3. Update this documentation if needed
4. Ensure tests pass before submitting
5. Maintain or improve coverage thresholds
