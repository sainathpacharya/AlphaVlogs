import { AppConfig, AsyncStorageKeys, SecureStorageKeys } from '@/types';

// App Configuration
export const APP_CONFIG: AppConfig = {
  apiUrl: __DEV__ ? 'http://98.93.175.154:8080/jackmarvels/api' : 'https://api.jackmarvels.com',
  environment: __DEV__ ? 'development' : 'production',
  version: '1.0.0',
  buildNumber: '1',
};

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    SEND_OTP: '/students/send-otp',
    VERIFY_OTP: '/students/verify-otp',
    REGISTER: '/students/register',
    LOGOUT: '/auth/logout',
  },
  SCHOOLS: {
    GET: '/students/schools',
  },
  DASHBOARD: {
    GET: '/dashboard',
  },
  USER: {
    PROFILE: '/students/profile',
    UPDATE_PROFILE: '/students/profile',
  },
  VIDEO: {
    UPLOAD: '/video/upload',
  },
  YOUTUBE: {
    VIDEOS: '/youtube/videos',
    VIDEO_DETAILS: '/youtube/video',
    SEARCH: '/youtube/search',
    UPLOAD: '/youtube/upload',
    UPLOAD_STATUS: '/youtube/upload-status',
    PLAYLISTS: '/youtube/playlists',
  },
  GIF: {
    GIFS: '/gifs',
    GIF_DETAILS: '/gifs',
    SEARCH: '/gifs/search',
    UPLOAD: '/gifs/upload',
    TRENDING: '/gifs/trending',
    CATEGORIES: '/gifs/categories',
  },
  SUBSCRIPTION: {
    UPDATE: '/subscription/update',
  },
} as const;

// Storage Keys
export const STORAGE_KEYS: AsyncStorageKeys = {
  AUTH_TOKENS: 'auth_tokens',
  USER_DATA: 'user_data',
  APP_SETTINGS: 'app_settings',
  CACHED_DATA: 'cached_data',
  THEME: 'theme',
  LANGUAGE: 'language',
};

export const SECURE_STORAGE_KEYS: SecureStorageKeys = {
  BIOMETRIC_ENABLED: 'biometric_enabled',
  PIN_CODE: 'pin_code',
  ENCRYPTION_KEY: 'encryption_key',
};

// Theme Colors
export const COLORS = {
  LIGHT: {
    primary: '#007AFF',
    secondary: '#5856D6',
    background: '#FFFFFF',
    surface: '#F2F2F7',
    text: '#000000',
    textSecondary: '#8E8E93',
    border: '#C6C6C8',
    error: '#FF3B30',
    success: '#34C759',
    warning: '#FF9500',
    info: '#007AFF',
  },
  DARK: {
    primary: '#0A84FF',
    secondary: '#5E5CE6',
    background: '#000000',
    surface: '#1C1C1E',
    text: '#FFFFFF',
    textSecondary: '#8E8E93',
    border: '#38383A',
    error: '#FF453A',
    success: '#32D74B',
    warning: '#FF9F0A',
    info: '#0A84FF',
  },
} as const;

// Event Categories
export const EVENT_CATEGORIES = [
  'National Anthem',
  'Tongue Twister',
  'Singing',
  'Dancing',
  'Movie dialogues',
  'Comedy Act / Skit',
  'Shayari',
  'Rhymes',
  'Poems',
  'Cooking',
  'Twins Act',
  'Any special Talent',
  'Mom and Kid Act',
  'Craft Making',
  'Kids group performance with teacher',
] as const;

// Navigation Constants
export const NAVIGATION = {
  ANIMATION_DURATION: 300,
  HEADER_HEIGHT: 56,
  TAB_BAR_HEIGHT: 83,
} as const;

// API Constants
export const API = {
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  CACHE_TIME: 5 * 60 * 1000, // 5 minutes
  STALE_TIME: 2 * 60 * 1000, // 2 minutes
} as const;

// Validation Constants
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^\d{10}$/,
  PINCODE_REGEX: /^\d{6}$/,
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'Resource not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  UNKNOWN_ERROR: 'An unknown error occurred.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful!',
  REGISTRATION_SUCCESS: 'Registration successful!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  PASSWORD_CHANGED: 'Password changed successfully!',
  LOGOUT_SUCCESS: 'Logged out successfully!',
} as const;

// Localization
export const SUPPORTED_LANGUAGES = {
  EN: 'en',
  HI: 'hi',
  TE: 'te',
} as const;

export const DEFAULT_LANGUAGE = SUPPORTED_LANGUAGES.EN;

// Biometric Types
export const BIOMETRIC_TYPES = {
  FACE_ID: 'FaceID',
  TOUCH_ID: 'TouchID',
  FINGERPRINT: 'Fingerprint',
} as const;

// Quiz Constants
export const QUIZ = {
  TIME_LIMIT: 30, // seconds per question
  PASSING_SCORE: 70, // percentage
  MAX_QUESTIONS: 10,
} as const;

// Animation Constants
export const ANIMATION = {
  DURATION: {
    FAST: 200,
    NORMAL: 300,
    SLOW: 500,
  },
  EASING: {
    EASE_IN: 'ease-in',
    EASE_OUT: 'ease-out',
    EASE_IN_OUT: 'ease-in-out',
  },
} as const;

// Subscription Constants
export const SUBSCRIPTION = {
  PLANS: {
    FREE: 'free',
    PREMIUM: 'premium',
  },
  PRICING: {
    PREMIUM_ANNUAL: 100,
  },
  FEATURES: {
    FREE: ['Basic quiz access', 'Event browsing'],
    PREMIUM: ['Full quiz access', 'Ad-free experience', 'Priority support'],
  },
} as const;

// Payment Methods
export const PAYMENT_METHODS = {
  CASH: 'cash',
  CHEQUE: 'cheque',
  RAZORPAY: 'razorpay',
  STRIPE: 'stripe',
  PAYTM: 'paytm',
} as const;

// Video Upload Constants
export const VIDEO_UPLOAD = {
  MIN_DURATION: 30, // seconds
  MAX_DURATION: 180, // 3 minutes
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
  SUPPORTED_FORMATS: ['mp4', 'mov', 'avi'],
  QUALITY: {
    COMPRESSION: 0.8,
    RESOLUTION: '720p',
  },
} as const;

// Notification Types
export const NOTIFICATION_TYPES = {
  EVENT: 'event',
  QUIZ: 'quiz',
  RESULT: 'result',
  SUBSCRIPTION: 'subscription',
  GENERAL: 'general',
} as const;

// School Constants
export const SCHOOL = {
  INVITATION_EXPIRY_DAYS: 7,
  MAX_STUDENTS_PER_SCHOOL: 1000,
  SUPPORTED_GRADES: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
} as const;
