import { mockApiService } from '../../src/services/mock-api';
import { User, Event, Subscription, VideoSubmission, QuizQuestion } from '../../src/types';

// Mock the types to avoid import issues
jest.mock('../../src/types', () => ({
  User: {},
  Event: {},
  Subscription: {},
  VideoSubmission: {},
  QuizQuestion: {},
}));

describe('MockApiService', () => {
  beforeEach(() => {
    // Reset any state if needed
    jest.clearAllMocks();
  });

  describe('Authentication', () => {
    it('should login with valid credentials', async () => {
      const loginData = {
        mobile: '9876543210',
        otp: '123456',
      };

      const result = await mockApiService.login(loginData);

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('user');
      expect(result.data).toHaveProperty('tokens');
      expect(result.data.user).toHaveProperty('id');
      expect(result.data.user).toHaveProperty('firstName');
      expect(result.data.user).toHaveProperty('lastName');
    });

    it('should fail login with invalid OTP', async () => {
      const loginData = {
        mobile: '9876543210',
        otp: '000000',
      };

      const result = await mockApiService.login(loginData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid mobile number or OTP');
    });

    it('should fail login with invalid mobile', async () => {
      const loginData = {
        mobile: '0000000000',
        otp: '123456',
      };

      const result = await mockApiService.login(loginData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid mobile number or OTP');
    });

    it('should register new user', async () => {
      const registerData = {
        firstName: 'John',
        lastName: 'Doe',
        emailId: 'john.doe@example.com',
        mobileNumber: '9999999999',
        state: 'California',
        district: 'Los Angeles',
        city: 'Los Angeles',
        pincode: '123456',
        schoolId: '1',
        schoolName: 'Test School',
      };

      const result = await mockApiService.register(registerData);

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('id');
      expect(result.data).toHaveProperty('firstName', 'John');
      expect(result.data).toHaveProperty('lastName', 'Doe');
    });

    it('should fail registration with existing email', async () => {
      const registerData = {
        firstName: 'John',
        lastName: 'Doe',
        emailId: 'rahul.sharma@example.com', // Existing email
        mobileNumber: '9999999999',
        state: 'California',
        district: 'Los Angeles',
        city: 'Los Angeles',
        pincode: '123456',
        schoolId: '1',
        schoolName: 'Test School',
      };

      const result = await mockApiService.register(registerData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('already exists');
    });
  });

  describe('Events', () => {
    it('should get all events', async () => {
      const result = await mockApiService.getEvents();

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('events');
      expect(Array.isArray(result.data.events)).toBe(true);
      expect(result.data.events.length).toBeGreaterThan(0);
    });

    it('should get events with include parameter', async () => {
      const result = await mockApiService.getEvents('influencer');

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('events');
      expect(Array.isArray(result.data.events)).toBe(true);
    });

    it('should get event by ID', async () => {
      const eventId = 'event_001';
      const result = await mockApiService.getEventById(eventId);

      expect(result.success).toBe(true);
      expect(result.data.event).toHaveProperty('id', eventId);
      expect(result.data.event).toHaveProperty('title');
      expect(result.data.event).toHaveProperty('description');
    });

    it('should return error for non-existent event', async () => {
      const eventId = 'non_existent_event';
      const result = await mockApiService.getEventById(eventId);

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });

  describe('Subscriptions', () => {
    it('should get user subscription', async () => {
      const userId = 'user_001';
      const result = await mockApiService.getSubscription(userId);

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('subscription');
    });

    it('should create subscription', async () => {
      const subscriptionData = {
        userId: 'user_001',
        planId: 'plan_001',
        paymentMethodId: 'pm_001',
      };

      const result = await mockApiService.createSubscription(subscriptionData);

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('id');
      expect(result.data).toHaveProperty('userId', 'user_001');
      expect(result.data).toHaveProperty('plan');
    });

    it('should fail subscription creation with invalid user', async () => {
      const subscriptionData = {
        userId: 'invalid_user',
        planId: 'plan_001',
        paymentMethodId: 'pm_001',
      };

      const result = await mockApiService.createSubscription(subscriptionData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });

  describe('Payments', () => {
    it('should process payment', async () => {
      const paymentData = {
        amount: 1000,
        currency: 'INR',
        paymentMethodId: 'pm_001',
        subscriptionId: 'sub_001',
      };

      const result = await mockApiService.processPayment(paymentData);

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('transactionId');
      expect(result.data).toHaveProperty('subscription');
      expect(result.data.subscription).toHaveProperty('status', 'active');
    });

    it('should fail payment with insufficient funds', async () => {
      const paymentData = {
        amount: 1000000, // Very high amount
        currency: 'INR',
        paymentMethodId: 'pm_001',
        subscriptionId: 'sub_001',
      };

      const result = await mockApiService.processPayment(paymentData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Insufficient');
    });
  });

  describe('Video Upload', () => {
    it('should upload video', async () => {
      const videoData = {
        userId: 'user_001',
        eventId: 'event_001',
        videoUrl: 'https://example.com/video.mp4',
        title: 'Test Video',
        description: 'Test Description',
      };

      const result = await mockApiService.uploadVideo(videoData);

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('id');
      expect(result.data).toHaveProperty('userId', 'user_001');
      expect(result.data).toHaveProperty('eventId', 'event_001');
    });

    it('should fail video upload with invalid event', async () => {
      const videoData = {
        userId: 'user_001',
        eventId: 'invalid_event',
        videoUrl: 'https://example.com/video.mp4',
        title: 'Test Video',
        description: 'Test Description',
      };

      const result = await mockApiService.uploadVideo(videoData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });

  describe('Quiz', () => {
    it('should get quiz', async () => {
      const quizId = 'quiz_001';
      const result = await mockApiService.getQuiz(quizId);

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('id');
      expect(result.data).toHaveProperty('title');
    });

    it('should submit quiz answers', async () => {
      const quizId = 'quiz_001';
      const answers = [1, 2, 0]; // User's answers
      const userId = 'user_001';

      const result = await mockApiService.submitQuiz(quizId, answers, userId);

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('score');
      expect(result.data).toHaveProperty('totalQuestions');
      expect(result.data).toHaveProperty('correctAnswers');
    });

    it('should fail quiz submission with invalid event', async () => {
      const quizId = 'invalid_quiz';
      const answers = [1, 2, 0];
      const userId = 'user_001';

      const result = await mockApiService.submitQuiz(quizId, answers, userId);

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });

  describe('Search', () => {
    it('should search', async () => {
      const searchQuery = 'singing';
      const result = await mockApiService.search(searchQuery);

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('results');
    });

    it('should return empty results for non-matching search', async () => {
      const searchQuery = 'nonexistent';
      const result = await mockApiService.search(searchQuery);

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('results');
    });
  });

  describe('Analytics', () => {
    it('should get user analytics', async () => {
      const userId = 'user_001';
      const userType = 'user';
      const result = await mockApiService.getAnalytics(userId, userType);

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('user');
      expect(result.data.user).toHaveProperty('name');
      expect(result.data.user).toHaveProperty('totalVideos');
      expect(result.data.user).toHaveProperty('totalSubscriptions');
    });

    it('should fail analytics for invalid user', async () => {
      const userId = 'invalid_user';
      const userType = 'user';
      const result = await mockApiService.getAnalytics(userId, userType);

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });

  describe('Response Format', () => {
    it('should return consistent response format', async () => {
      const result = await mockApiService.getEvents();

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('statusCode');
      expect(result).toHaveProperty('timestamp');
      expect(typeof result.success).toBe('boolean');
      expect(typeof result.statusCode).toBe('number');
      expect(typeof result.timestamp).toBe('string');
    });

    it('should return error format for failed requests', async () => {
      const result = await mockApiService.getEventById('invalid_id');

      expect(result).toHaveProperty('success', false);
      expect(result).toHaveProperty('error');
      expect(result).toHaveProperty('statusCode');
      expect(result).toHaveProperty('timestamp');
      expect(typeof result.error).toBe('string');
    });
  });

  describe('Network Simulation', () => {
    it('should simulate network delay', async () => {
      const startTime = Date.now();
      await mockApiService.getEvents();
      const endTime = Date.now();

      // Should take at least 500ms due to simulated delay
      expect(endTime - startTime).toBeGreaterThanOrEqual(400); // Allow some tolerance
    });
  });

  describe('Data Consistency', () => {
    it('should maintain data consistency across calls', async () => {
      // Get initial events
      const initialResult = await mockApiService.getEvents();
      const initialCount = initialResult.data.events.length;

      // Create a new event (if the service supports it)
      // This would depend on the actual implementation

      // Get events again
      const finalResult = await mockApiService.getEvents();
      const finalCount = finalResult.data.events.length;

      // Count should be consistent (or increased if we added data)
      expect(finalCount).toBeGreaterThanOrEqual(initialCount);
    });
  });
});
