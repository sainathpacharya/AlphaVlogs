# 🚀 Jack Marvels Mock API System

## 📋 Overview

This document describes the complete mock API system for the Jack Marvels application. The system provides **25 optimized APIs** with realistic mock data, allowing you to develop and test the application without a backend server.

## 🎯 Key Features

- ✅ **25 Optimized APIs** (47% reduction from original 47 APIs)
- ✅ **Realistic Mock Data** with proper relationships
- ✅ **Network Delay Simulation** for realistic testing
- ✅ **Error Handling** and edge cases
- ✅ **Easy Switching** between mock and real APIs
- ✅ **Comprehensive Test Suite** for all APIs

## 🔧 Configuration

### API Mode Selection

```typescript
// src/config/api-config.ts
export const API_CONFIG = {
  MODE: 'mock' as 'mock' | 'real', // Change this to switch modes
  
  MOCK: {
    ENABLE_DELAY: true,        // Simulate network delays
    DEFAULT_DELAY: 500,        // Default delay in milliseconds
    UPLOAD_DELAY: 2000,       // Video upload delay
    PAYMENT_DELAY: 1500,      // Payment processing delay
  },
  
  REAL: {
    BASE_URL: 'https://api.jackmarvels.com',
    TIMEOUT: 30000,
  }
};
```

### Switching Between Modes

```typescript
// To use mock APIs (default)
API_CONFIG.MODE = 'mock';

// To use real APIs
API_CONFIG.MODE = 'real';
```

## 📱 API Endpoints

### 1. **Authentication & User (4 APIs)**

| Endpoint | Method | Purpose | Mock Data |
|----------|--------|---------|-----------|
| `/auth/login` | POST | Login with mobile/OTP | ✅ Mock user: 9876543210, OTP: 123456 |
| `/auth/register` | POST | User registration | ✅ Creates new mock user |
| `/auth/refresh` | POST | Token refresh | ✅ Mock token refresh |
| `/user/profile` | GET/PUT | Profile CRUD | ✅ Mock user profiles |

### 2. **Events & Content (3 APIs)**

| Endpoint | Method | Purpose | Mock Data |
|----------|--------|---------|-----------|
| `/events` | GET | List/search/filter events | ✅ 15 talent events with categories |
| `/events/:id` | GET | Event details + guidelines | ✅ Event info + upload guidelines |
| `/events/categories` | GET | Event categories | ✅ 8 event categories |

### 3. **Video & Upload (2 APIs)**

| Endpoint | Method | Purpose | Mock Data |
|----------|--------|---------|-----------|
| `/video/upload` | POST | Complete video upload flow | ✅ Simulates upload with progress |
| `/video/submissions` | GET | User submissions + management | ✅ Mock video submissions |

### 4. **Subscription & Payments (3 APIs)**

| Endpoint | Method | Purpose | Mock Data |
|----------|--------|---------|-----------|
| `/subscription` | GET/POST | CRUD operations | ✅ Mock subscription data |
| `/subscription/payment` | POST | Process all payment types | ✅ Simulates payment processing |
| `/subscription/methods` | GET | Payment methods | ✅ Razorpay, Cash, Cheque |

### 5. **Quiz System (2 APIs)**

| Endpoint | Method | Purpose | Mock Data |
|----------|--------|---------|-----------|
| `/quiz/:id` | GET | Quiz + questions | ✅ Mock quiz with questions |
| `/quiz/:id/submit` | POST | Submit + get results | ✅ Calculates scores and results |

### 6. **School & Notifications (3 APIs)**

| Endpoint | Method | Purpose | Mock Data |
|----------|--------|---------|-----------|
| `/school/invitation` | POST/GET | Invitation management | ✅ Mock school invitations |
| `/notifications` | GET/POST | All notification operations | ✅ Mock notifications |
| `/push/register` | POST | Device registration | ✅ Push notification setup |

### 7. **Search & Analytics (2 APIs)**

| Endpoint | Method | Purpose | Mock Data |
|----------|--------|---------|-----------|
| `/search` | GET | Global search across all content | ✅ Search events, users, videos |
| `/analytics` | GET | User + event analytics | ✅ Mock analytics data |

### 8. **Admin & Utilities (2 APIs)**

| Endpoint | Method | Purpose | Mock Data |
|----------|--------|---------|-----------|
| `/admin` | GET/POST | Admin operations | ✅ Mock admin functions |
| `/utils/config` | GET | App configuration | ✅ App settings and limits |

## 🧪 Testing the Mock APIs

### Access Test Suite

1. **Navigate to Dashboard** in the app
2. **Click "Test APIs" button** (green button next to profile icon)
3. **Use the MockTest screen** to test all APIs individually or run all tests

### Test Credentials

```typescript
// Default test credentials
Mobile: 9876543210
OTP: 123456
```

### Individual Tests

- **Login**: Test authentication with mock credentials
- **Events**: Test event listing and filtering
- **Events+**: Test events with include parameters
- **Event ID**: Test single event with guidelines
- **Subscription**: Test subscription management
- **Create Sub**: Test subscription creation
- **Payment**: Test payment processing
- **Video**: Test video upload simulation
- **Quiz**: Test quiz loading
- **Submit Quiz**: Test quiz submission and scoring
- **Search**: Test global search functionality
- **Analytics**: Test user and event analytics

### Run All Tests

Click **"🚀 Run All Tests"** to execute all API tests sequentially and see results in real-time.

## 📊 Mock Data Structure

### Users
```typescript
{
  id: 'user_001',
  firstName: 'Rahul',
  lastName: 'Sharma',
  email: 'rahul.sharma@example.com',
  mobile: '9876543210',
  state: 'Maharashtra',
  district: 'Mumbai',
  city: 'Mumbai',
  pincode: '400001',
  isVerified: true
}
```

### Events
```typescript
{
  id: 'event_001',
  title: 'National Anthem',
  description: 'Sing the national anthem with pride and patriotism',
  category: 'Singing',
  isActive: true
}
```

### Subscriptions
```typescript
{
  id: 'sub_001',
  userId: 'user_001',
  plan: 'premium',
  amount: 100,
  paymentMethod: 'razorpay',
  status: 'active',
  startDate: '2024-01-01',
  endDate: '2024-12-31'
}
```

## 🔄 API Response Format

### Success Response
```typescript
{
  success: true,
  data: { /* response data */ },
  statusCode: 200,
  timestamp: '2024-01-25T10:00:00.000Z'
}
```

### Error Response
```typescript
{
  success: false,
  error: 'Error message',
  statusCode: 400,
  timestamp: '2024-01-25T10:00:00.000Z'
}
```

## 🚀 Advanced Features

### Query Parameters
```typescript
// Get events with categories and guidelines
GET /events?include=categories,guidelines&category=Singing&search=anthem

// Get subscription with payment methods and history
GET /subscription?include=methods,history
```

### Batch Operations
```typescript
// Multiple notification actions
POST /notifications {
  actions: ['mark-read', 'update-settings', 'subscribe'],
  data: { /* action data */ }
}
```

### Smart Consolidation
```typescript
// Single endpoint for multiple operations
POST /subscription {
  action: 'create' | 'cancel' | 'update',
  data: { /* operation data */ }
}
```

## 📱 Integration with App

### Service Layer
```typescript
import { MockWrapperService } from '@/services/mock-wrapper';

// Check if mock mode is enabled
if (MockWrapperService.isMockMode()) {
  // Use mock API
  const response = await MockWrapperService.getMockService().login(data);
} else {
  // Use real API
  const response = await apiService.post('/auth/login', data);
}
```

### Response Conversion
```typescript
// Convert mock response to standard format
const standardResponse = MockWrapperService.convertMockResponse(mockResponse);
```

## 🎨 Customization

### Adding New Mock Data
```typescript
// In src/services/mock-api.ts
private users: User[] = [
  // Add new mock users here
  {
    id: 'user_003',
    firstName: 'New',
    lastName: 'User',
    // ... other properties
  }
];
```

### Modifying Response Delays
```typescript
// In src/config/api-config.ts
MOCK: {
  DEFAULT_DELAY: 1000,    // Increase delay to 1 second
  UPLOAD_DELAY: 5000,     // Increase upload delay to 5 seconds
}
```

### Adding New API Endpoints
```typescript
// In MockApiService class
async newEndpoint(data: any) {
  await this.delay();
  // Your mock logic here
  return this.createResponse({ /* mock data */ });
}
```

## 🔍 Debugging

### Enable Logging
```typescript
// In src/config/api-config.ts
DEV: {
  LOG_API_CALLS: true,        // Log all API calls
  LOG_MOCK_DATA: true,        // Log mock data responses
  ENABLE_MOCK_ERRORS: true,   // Simulate network errors
  MOCK_ERROR_RATE: 0.1        // 10% chance of error
}
```

### Network Error Simulation
```typescript
// Randomly simulate network failures
if (Math.random() < API_CONFIG.DEV.MOCK_ERROR_RATE) {
  throw new Error('Simulated network error');
}
```

## 📚 Best Practices

### 1. **Use Mock Mode for Development**
- Faster development cycles
- No backend dependencies
- Consistent test data

### 2. **Test All Scenarios**
- Success cases
- Error cases
- Edge cases
- Network failures

### 3. **Keep Mock Data Realistic**
- Use realistic user data
- Maintain data relationships
- Simulate real-world scenarios

### 4. **Easy Mode Switching**
- Use configuration file
- Environment-based switching
- Feature flag support

## 🎉 Benefits

- **🚀 47% Fewer APIs**: From 47 to 25 optimized endpoints
- **⚡ Faster Development**: No backend setup required
- **🧪 Better Testing**: Comprehensive test coverage
- **🔄 Easy Switching**: Toggle between mock and real APIs
- **📱 Full Functionality**: All app features work with mock data
- **🎨 Realistic Experience**: Proper delays and error handling

## 🔗 Quick Start

1. **Set API mode to 'mock'** in `src/config/api-config.ts`
2. **Run the app** - all APIs will use mock data
3. **Navigate to Dashboard** and click "Test APIs"
4. **Run individual tests** or execute all tests
5. **Verify functionality** across all app features

## 📞 Support

For questions or issues with the mock API system:
- Check the test results in the MockTest screen
- Review the console logs for detailed information
- Verify API configuration settings
- Test individual endpoints for specific issues

---

**🎯 The Jack Marvels Mock API System provides a complete, production-ready development environment with 25 optimized APIs and comprehensive testing capabilities!**
