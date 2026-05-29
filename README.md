# JackMarvelsApp

A React Native talent show application for kids, built with a modern, scalable architecture.

## 🏗️ Architecture Overview

This project follows a comprehensive architecture designed for scalability, maintainability, and performance:

### 📁 Project Structure

```
src/
├── components/          # Reusable UI components
├── navigation/          # Navigation configuration
├── screens/            # Screen components
├── services/           # API and external services
├── stores/             # State management (Zustand)
├── context/            # React Context providers
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
├── constants/          # App-wide constants
└── assets/             # Images, fonts, etc.
```

### 🎯 Key Features

- **State Management**: Zustand for global state with persistent storage
- **API Layer**: Axios with interceptors, JWT refresh, and error handling
- **Navigation**: React Navigation with type-safe routing
- **UI Framework**: Gluestack UI with custom theming
- **Authentication**: JWT-based with biometric support
- **Caching**: React Query for server state management
- **TypeScript**: Strict typing throughout the application
- **Testing**: Jest and React Native Testing Library
- **Code Quality**: ESLint, Prettier, and TypeScript

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- React Native CLI
- Xcode (for iOS)
- Android Studio (for Android)
- CocoaPods (for iOS)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd JackMarvelsApp
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **iOS Setup**

   ```bash
   cd ios && pod install && cd ..
   ```

4. **Start the development server**

   ```bash
   npm start
   ```

5. **Run the app**

   ```bash
   # iOS
   npm run ios

   # Android
   npm run android
   ```

## 📱 Available Scripts

- `npm start` - Start Metro bundler
- `npm run ios` - Run on iOS simulator
- `npm run android` - Run on Android emulator
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage
- `npm run type-check` - Run TypeScript type checking
- `npm run clean` - Clean and reinstall dependencies
- `npm run clean:metro` - Clear Metro cache

## 🏛️ Architecture Components

### State Management

#### Runtime Store (`user-store.ts`)

- UI state (loading, authentication status)
- Network status
- Location data
- Theme and language preferences

#### Persistent Store (`user-cached-store.ts`)

- Authentication tokens (secure storage)
- User data
- App settings
- Cached data

### API Layer

#### Base API Service (`api.ts`)

- Axios configuration with interceptors
- Automatic JWT token refresh
- Network connectivity checks
- Error handling and retry logic
- Request/response logging

#### Service Modules

- `auth-service.ts` - Authentication operations
- `events-service.ts` - Event management
- `quiz-service.ts` - Quiz functionality

### Navigation

#### Stack Structure

```
RootNavigator
├── LoadingStack (App initialization)
├── AuthStack (Authentication flow)
│   ├── Welcome
│   ├── Login
│   ├── Registration
│   └── OTPVerification
└── AppStack (Main app)
    ├── MainTabs
    │   ├── Dashboard
    │   ├── Events
    │   ├── Profile
    │   └── Settings
    ├── Quiz
    ├── Results
    └── Modal screens
```

### Custom Hooks

- `useAuth` - Authentication management
- `useNetwork` - Network status monitoring
- `useEvents` - Event data management
- `useQuiz` - Quiz functionality

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
API_URL=https://api.alphavlogs.com
ENVIRONMENT=development
```

### TypeScript Configuration

The project uses strict TypeScript configuration with:

- Path mapping for clean imports
- Strict type checking
- No implicit any
- Strict null checks

### ESLint Configuration

Custom ESLint rules for:

- React Native best practices
- TypeScript compliance
- Code formatting consistency

## 🧪 Testing

### Test Structure

```
__tests__/
├── components/     # Component tests
├── screens/        # Screen tests
├── services/       # Service tests
└── utils/          # Utility tests
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📦 Build & Deployment

### Android

```bash
# Build release APK
npm run build:android
```

### iOS

```bash
# Build release archive
npm run build:ios
```

## 🔐 Security Features

- Secure token storage using React Native Keychain
- Biometric authentication support
- SSL public key pinning for `api.alphavlogs.com` in release builds ([docs/SSL_PINNING.md](docs/SSL_PINNING.md))
- Input validation and sanitization
- JWT token refresh mechanism

## 🎨 UI/UX Features

- Gluestack UI design system
- Custom theme configuration
- Responsive design
- Accessibility support
- Dark/Light mode support
- Internationalization (i18next)

## 📊 Performance Optimizations

- React Query for efficient caching
- Lazy loading for screens
- Image optimization
- Bundle optimization
- Memory management
- Network request optimization

## 🔄 Development Workflow

1. **Feature Development**
   - Create feature branch
   - Implement with TypeScript
   - Add tests
   - Update documentation

2. **Code Quality**
   - Run linting: `npm run lint`
   - Fix issues: `npm run lint:fix`
   - Type checking: `npm run type-check`

3. **Testing**
   - Unit tests for utilities
   - Component tests
   - Integration tests for API calls

4. **Review & Merge**
   - Code review
   - Performance testing
   - Merge to main branch

## 🐛 Troubleshooting

### Common Issues

1. **Metro Cache Issues**

   ```bash
   npm run clean:metro
   ```

2. **iOS Build Issues**

   ```bash
   cd ios && pod install && cd ..
   ```

3. **Android Build Issues**

   ```bash
   cd android && ./gradlew clean && cd ..
   ```

4. **TypeScript Errors**
   ```bash
   npm run type-check
   ```

## 📚 Additional Resources

- [React Native Documentation](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Zustand](https://github.com/pmndrs/zustand)
- [React Query](https://tanstack.com/query)
- [Gluestack UI](https://ui.gluestack.io/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
