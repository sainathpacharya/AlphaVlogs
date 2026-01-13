import { User, AuthTokens } from '@/types';
import { validateRegistrationData } from '@/utils/validation';
import { MockDataStore } from './mock-data-store';

export class MockAuthService {
  constructor(private store: MockDataStore) {}

  // Simulate network delay
  private async delay(ms: number = 500) {
    return new Promise<void>(resolve => setTimeout(() => resolve(), ms));
  }

  // Generic response wrapper
  private createResponse<T>(data: T, success: boolean = true, message?: string) {
    return {
      success,
      data,
      message,
      statusCode: success ? 200 : 400,
      timestamp: new Date().toISOString(),
    };
  }

  // Generic error response
  private createErrorResponse(message: string, statusCode: number = 400) {
    return {
      success: false,
      error: message,
      statusCode,
      timestamp: new Date().toISOString(),
    };
  }

  async sendOTP(data: { mobile: string; type: string }) {
    await this.delay();

    if (data.mobile === '9876543210' || data.mobile === '8765432109') {
      // Generate SMS hash for Android auto-read
      const smsHash = 'ABCD1234'; // Mock hash for demo
      const otpMessage = `Jack Marvels: Your OTP is 123456. Valid for 3 minutes. Do not share this code with anyone. ${smsHash}`;

      return this.createResponse({
        message: 'OTP sent successfully',
        mobile: data.mobile,
        expiresIn: 300,
        otpMessage,
        smsHash, // Include hash for backend to use in actual SMS
      });
    }

    return this.createErrorResponse('Invalid mobile number', 400);
  }

  async verifyOTP(data: { mobile: string; otp: string }) {
    await this.delay();

    if (data.mobile === '9876543210' && data.otp === '123456') {
      const user = this.store.findUserById('user_001');
      return this.createResponse({
        user,
        tokens: {
          accessToken: 'mock_access_token_123',
          refreshToken: 'mock_refresh_token_456',
          expiresIn: 3600,
        },
      });
    }

    if (data.mobile === '8765432109' && data.otp === '123456') {
      const user = this.store.findUserById('user_002');
      return this.createResponse({
        user,
        tokens: {
          accessToken: 'mock_access_token_456',
          refreshToken: 'mock_refresh_token_789',
          expiresIn: 3600,
        },
      });
    }

    return this.createErrorResponse('Invalid mobile number or OTP', 401);
  }

  async login(data: { mobile: string; otp: string }) {
    return this.verifyOTP(data);
  }

  async register(data: any) {
    await this.delay();

    // Validate required fields
    const validation = validateRegistrationData(data);
    if (!validation.isValid) {
      return this.createErrorResponse(validation.errors.join(', '), 400);
    }

    // Check if user already exists by email
    const existingUserByEmail = this.store.getUsers().find(user =>
      user.email.toLowerCase() === (data.email ?? data.emailId)?.toLowerCase()
    );
    if (existingUserByEmail) {
      return this.createErrorResponse('An account with this email already exists. Please use a different email or try logging in.', 400);
    }

    // Check if user already exists by mobile number
    const existingUserByMobile = this.store.getUsers().find(user =>
      user.mobile === data.mobileNumber || user.mobile === data.mobile
    );
    if (existingUserByMobile) {
      return this.createErrorResponse('An account with this mobile number already exists. Please use a different number or try logging in.', 400);
    }

    // Create new user
    const newUser: User = {
      id: `user_${Date.now()}`,
      firstName: data.firstName?.trim(),
      lastName: data.lastName?.trim(),
      email: (data.email ?? data.emailId)?.toLowerCase().trim(),
      mobile: data.mobileNumber || data.mobile,
      state: data.state?.trim(),
      district: data.district?.trim(),
      city: data.city?.trim(),
      pincode: data.pincode?.trim(),
      profileImage: undefined,
      roleId: 4, // Mobile app registration is only for students
      role: 'student',
      isVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.store.getUsers().push(newUser);

    // Add welcome notification
    this.store.addNotification({
      userId: newUser.id,
      type: 'general',
      title: 'Welcome to Jack Marvels!',
      message: 'Your account has been created successfully. Start exploring events and competitions!',
      data: { userId: newUser.id },
      isRead: false,
    });

    return this.createResponse(newUser, true, 'Registration successful! Welcome to Jack Marvels!');
  }

  async refreshToken(refreshToken: string) {
    await this.delay();

    if (refreshToken === 'mock_refresh_token_456') {
      return this.createResponse({
        accessToken: 'new_mock_access_token_789',
        refreshToken: 'new_mock_refresh_token_012',
        expiresIn: 3600,
      });
    }

    return this.createErrorResponse('Invalid refresh token', 401);
  }

  async logout() {
    await this.delay();
    return this.createResponse({ message: 'Logged out successfully' });
  }

  async updateProfile(userId: string, updates: Partial<User>) {
    await this.delay();

    // Profile updates work for both Influencers and Students
    const updatedUser = this.store.updateUser(userId, updates);
    if (updatedUser) {
      return this.createResponse(updatedUser);
    }

    return this.createErrorResponse('User not found', 404);
  }

  async getProfile(userId: string) {
    await this.delay();

    const user = this.store.findUserById(userId);
    if (user) {
      return this.createResponse(user);
    }

    return this.createErrorResponse('User not found', 404);
  }

  async uploadAvatar(userId: string, file: any) {
    await this.delay();

    const avatarUrl = `https://example.com/avatars/${userId}_${Date.now()}.jpg`;
    const updatedUser = this.store.updateUser(userId, { profileImage: avatarUrl });

    if (updatedUser) {
      return this.createResponse({ avatarUrl });
    }

    return this.createErrorResponse('User not found', 404);
  }
}

export default MockAuthService;

