// Common types used throughout the application

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  state: string;
  district: string;
  city: string;
  pincode: string;
  profileImage?: string;
  roleId: number; // 3 = influencer, 4 = student (mobile app only)
  role: 'influencer' | 'student';
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface OTPResponse {
  message: string;
  mobile: string;
  expiresIn: number;
  otpMessage: string;
  smsHash?: string; // SMS hash for Android auto-read
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  statusCode: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
  canUpload: boolean;
  uploadStartDate: string;
  uploadEndDate: string;
  createdAt: string;
  allowedRoles?: number[]; // Array of role IDs that can access this event
}

export interface InfluencerEvent {
  id: string;
  title: string;
  description: string;
  type: 'school_registration' | 'history';
  isActive: boolean;
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  category: string;
}

export interface QuizResult {
  id: string;
  userId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: number;
  completedAt: string;
}

export interface AppConfig {
  apiUrl: string;
  environment: 'development' | 'staging' | 'production';
  version: string;
  buildNumber: string;
}

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean;
  type: string;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  success: string;
  warning: string;
  info: string;
}

export interface AppState {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: User | null;
  networkStatus: NetworkStatus;
  location: LocationData | null;
  theme: 'light' | 'dark';
  language: string;
}

export interface NavigationParams {
  [key: string]: any;
}

export type RootStackParamList = {
  Loading: undefined;
  Auth: undefined;
  App: undefined;
};

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Registration: undefined;
  ForgotPassword: undefined;
  OTPVerification: { email: string; type: 'login' | 'reset' };
};

export type AppStackParamList = {
  MainTabs: undefined;
  Quiz: { eventId: string };
  Results: { quizId: string };
  Profile: undefined;
  Settings: undefined;
  AboutUs: undefined;
  Subscription: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Events: undefined;
  Profile: undefined;
  Settings: undefined;
};

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export interface AsyncStorageKeys {
  AUTH_TOKENS: 'auth_tokens';
  USER_DATA: 'user_data';
  APP_SETTINGS: 'app_settings';
  CACHED_DATA: 'cached_data';
  THEME: 'theme';
  LANGUAGE: 'language';
}

export interface SecureStorageKeys {
  BIOMETRIC_ENABLED: 'biometric_enabled';
  PIN_CODE: 'pin_code';
  ENCRYPTION_KEY: 'encryption_key';
}

export interface SchoolInvitation {
  id: string;
  schoolId: string;
  invitationCode: string;
  studentEmail: string;
  parentEmail?: string;
  grade: string;
  section: string;
  isUsed: boolean;
  expiresAt: Date;
  createdAt: Date;
}

export interface School {
  id: string;
  name: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  logo?: string;
}

export interface VideoSubmission {
  id: string;
  userId: string;
  eventId: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration: number;
  title?: string;
  description?: string;
  uploadedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface DashboardData {
  user: User;
  events: Event[] | InfluencerEvent[];
  subscription?: Subscription; // Optional for influencers
  stats: {
    totalVideos: number;
    totalEvents: number;
    unreadNotifications: number;
    activeEvents: number;
    eventsWithOpenUploads: number;
  };
}

export interface Subscription {
  id: string;
  userId: string;
  plan: 'free' | 'premium';
  amount: number;
  paymentMethod: 'razorpay' | 'cash' | 'cheque';
  status: 'active' | 'expired' | 'pending' | 'cancelled';
  startDate: string;
  endDate: string;
  transactionId?: string;
  canUploadVideos: boolean;
  maxVideosPerMonth: number;
  videosUploadedThisMonth: number;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'event' | 'quiz' | 'result' | 'subscription' | 'general';
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  scheduledAt?: Date;
  createdAt: Date;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  isSubscribedOnly: boolean;
  adVideoUrl?: string; // Pre-quiz ad for subscribed users
  schoolBookletReference: string;
  teaserContent?: string; // For non-subscribed users
  subscriptionPrompt: boolean;
  questions: QuizQuestion[];
  timeLimit: number;
  passingScore: number;
  isActive: boolean;
  scheduledAt: Date;
  expiresAt: Date;
}

export interface PaymentMethod {
  id: string;
  type: 'cash' | 'cheque' | 'razorpay' | 'stripe' | 'paytm';
  name: string;
  isEnabled: boolean;
  config?: any;
}
