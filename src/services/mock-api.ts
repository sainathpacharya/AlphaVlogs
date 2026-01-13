import { User, Event, InfluencerEvent, Subscription, PaymentMethod, VideoSubmission, QuizQuestion, QuizResult, Notification, DashboardData } from '@/types';
import { validateRegistrationData } from '@/utils/validation';
import { MockDataStore } from './mock/mock-data-store';
import { MockAuthService } from './mock/mock-auth';

// Create singleton instances
const mockDataStore = new MockDataStore();
const mockAuthService = new MockAuthService(mockDataStore);

// Mock API Service
class MockApiService {
  private store = mockDataStore;

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

  // AUTH APIs - delegate to MockAuthService
  async sendOTP(data: { mobile: string; type: string }) {
    return mockAuthService.sendOTP(data);
  }

  async verifyOTP(data: { mobile: string; otp: string }) {
    return mockAuthService.verifyOTP(data);
  }

  async login(data: { mobile: string; otp: string }) {
    return mockAuthService.login(data);
  }

  async register(data: any) {
    return mockAuthService.register(data);
  }

  async refreshToken(refreshToken: string) {
    return mockAuthService.refreshToken(refreshToken);
  }

  async logout() {
    return mockAuthService.logout();
  }

  // DASHBOARD API
  async getDashboard(userId: string = 'user_001'): Promise<DashboardData> {
    await this.delay();
    
    const user = this.store.findUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Mobile app role-based event filtering (only influencers and students)
    let events: Event[] | InfluencerEvent[];
    let subscription: Subscription | undefined;
    let stats: any;

    if (user.roleId === 4) { // Student
      events = this.store.getEvents().filter(event => 
        event.allowedRoles?.includes(user.roleId)
      );
      subscription = this.store.getSubscriptions().find(sub => sub.userId === userId);
      stats = {
        totalVideos: this.store.getVideoSubmissions().filter(v => v.userId === userId).length,
        totalEvents: events.length,
        unreadNotifications: this.store.getNotifications().filter(n => !n.isRead && n.userId === userId).length,
        activeEvents: events.filter(e => e.isActive).length,
        eventsWithOpenUploads: events.filter(e => e.canUpload).length,
      };
    } else if (user.roleId === 3) { // Influencer
      events = this.store.getInfluencerEvents();
      stats = {
        totalSchools: 5, // Mock data for influencer
        totalEvents: events.length,
        unreadNotifications: this.store.getNotifications().filter(n => !n.isRead && n.userId === userId).length,
        activeEvents: events.filter(e => e.isActive).length,
        eventsWithOpenUploads: 0, // Influencers don't upload videos
      };
    } else {
      throw new Error('Mobile app only supports Influencers (roleId: 3) and Students (roleId: 4)');
    }

    return {
      user,
      events,
      subscription,
      stats,
    };
  }

  // SUBSCRIPTION API
  async updateSubscription(data: { plan: string; paymentMethod: string; amount: number }): Promise<{ data: Subscription }> {
    await this.delay();
    
    const newSubscription: Subscription = {
      id: `sub_${Date.now()}`,
      userId: 'user_001',
      plan: data.plan as 'premium',
      amount: data.amount,
      paymentMethod: data.paymentMethod as 'razorpay' | 'cash' | 'cheque',
      status: 'active',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
      transactionId: `txn_${Date.now()}`,
      canUploadVideos: true,
      maxVideosPerMonth: 10,
      videosUploadedThisMonth: 0,
    };

    this.store.getSubscriptions().push(newSubscription);
    
    return { data: newSubscription };
  }

  // USER APIs - delegate to MockAuthService
  async getProfile(userId: string) {
    return mockAuthService.getProfile(userId);
  }

  async updateProfile(userId: string, updates: Partial<User>) {
    return mockAuthService.updateProfile(userId, updates);
  }

  async uploadAvatar(userId: string, file: any) {
    return mockAuthService.uploadAvatar(userId, file);
  }

  // EVENTS APIs
  async getEvents(params?: any) {
    await this.delay();
    
    let events = this.store.getEvents();
    
    // Apply filters
    if (params?.category) {
      events = events.filter(e => e.category === params.category);
    }
    
    if (params?.search && typeof params.search === 'string') {
      const searchTerm = params.search.toLowerCase();
      events = events.filter(e => 
        e.title.toLowerCase().includes(searchTerm) || 
        e.description?.toLowerCase().includes(searchTerm)
      );
    }
    
    // Include categories if requested
    let categories: string[] = [];
    if (params?.include?.includes('categories')) {
      categories = [...new Set(events.map(e => e.category))];
    }
    
    return this.createResponse({
      events,
      categories,
      total: events.length,
      page: 1,
      limit: events.length,
    });
  }

  async getEventById(eventId: string, include?: string[]) {
    await this.delay();
    
    const event = this.store.findEventById(eventId);
    if (!event) {
      return this.createErrorResponse('Event not found', 404);
    }
    
    const response: any = { event };
    
    // Include guidelines if requested
    if (include?.includes('guidelines')) {
      response.guidelines = {
        minDuration: 30,
        maxDuration: 300,
        maxFileSize: 100 * 1024 * 1024, // 100MB
        supportedFormats: ['mp4', 'avi', 'mov'],
        galleryOnly: true,
        tips: [
          'Ensure good lighting',
          'Use clear audio',
          'Keep background simple',
          'Practice before recording'
        ]
      };
    }
    
    // Include categories if requested
    if (include?.includes('categories')) {
      response.categories = [...new Set(this.store.getEvents().map(e => e.category))];
    }
    
    // Include related events if requested
    if (include?.includes('related')) {
      response.relatedEvents = this.store.getEvents()
        .filter(e => e.category === event.category && e.id !== event.id)
        .slice(0, 3);
    }
    
    return this.createResponse(response);
  }

  // VIDEO APIs
  async uploadVideo(data: any) {
    await this.delay(2000); // Simulate upload time
    
    // Check if event exists
    const event = this.store.getEvents().find(e => e.id === data.eventId);
    if (!event) {
      return this.createErrorResponse('Event not found', 404);
    }
    
    const submission = this.store.addVideoSubmission({
      userId: data.userId,
      eventId: data.eventId,
      videoUrl: `https://example.com/videos/${data.eventId}_${Date.now()}.mp4`,
      thumbnailUrl: `https://example.com/thumbnails/${data.eventId}_${Date.now()}.jpg`,
      duration: data.duration || 120,
      status: 'pending',
    });
    
    return this.createResponse(submission);
  }

  async getVideoSubmissions(userId?: string, eventId?: string) {
    await this.delay();
    
    let submissions = this.store.getVideoSubmissions();
    
    if (userId) {
      submissions = submissions.filter(s => s.userId === userId);
    }
    
    if (eventId) {
      submissions = submissions.filter(s => s.eventId === eventId);
    }
    
    return this.createResponse(submissions);
  }

  // SUBSCRIPTION APIs
  async getSubscription(userId: string, include?: string[]) {
    await this.delay();
    
    const subscription = this.store.findSubscriptionByUserId(userId);
    const response: any = { subscription };
    
    if (include?.includes('methods')) {
      response.paymentMethods = this.store.getPaymentMethods();
    }
    
    if (include?.includes('history')) {
      response.history = this.store.getSubscriptions()
        .filter(s => s.userId === userId)
        .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    }
    
    return this.createResponse(response);
  }

  async createSubscription(data: any) {
    await this.delay();
    
    // Check if user exists
    const user = this.store.getUsers().find(u => u.id === data.userId);
    if (!user) {
      return this.createErrorResponse('User not found', 404);
    }
    
    const subscription: Subscription = {
      id: `sub_${Date.now()}`,
      userId: data.userId,
      plan: data.plan,
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      status: 'pending',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
      canUploadVideos: true,
      maxVideosPerMonth: 10,
      videosUploadedThisMonth: 0,
    };
    
    this.store.getSubscriptions().push(subscription);
    return this.createResponse(subscription);
  }

  async processPayment(data: any) {
    await this.delay(1500); // Simulate payment processing
    
    const subscription = this.store.getSubscriptions()
      .find(s => s.id === data.subscriptionId);
    
    if (!subscription) {
      return this.createErrorResponse('Subscription not found', 404);
    }
    
    // Simulate insufficient funds for specific test case
    if (data.amount && data.amount > 1000) {
      return this.createErrorResponse('Insufficient funds', 400);
    }
    
    // Simulate payment success
    subscription.status = 'active';
    subscription.transactionId = `txn_${Date.now()}`;
    
    return this.createResponse({
      success: true,
      transactionId: subscription.transactionId,
      subscription,
    });
  }

  async cancelSubscription(subscriptionId: string) {
    await this.delay();
    
    const subscription = this.store.getSubscriptions()
      .find(s => s.id === subscriptionId);
    
    if (!subscription) {
      return this.createErrorResponse('Subscription not found', 404);
    }
    
    subscription.status = 'cancelled';
    
    return this.createResponse({ message: 'Subscription cancelled successfully' });
  }

  // QUIZ APIs
  async getQuiz(quizId: string) {
    await this.delay();
    
    // Check if quiz exists (for testing purposes, only allow specific quiz IDs)
    if (quizId !== 'quiz_001' && quizId !== 'quiz_002') {
      return this.createErrorResponse('Quiz not found', 404);
    }
    
    const quiz = {
      id: quizId,
      title: 'General Knowledge Quiz',
      description: 'Test your knowledge with this fun quiz',
      questions: this.store.getQuizQuestions(),
      timeLimit: 600, // 10 minutes
      passingScore: 70,
      isSubscribedOnly: false,
    };
    
    return this.createResponse(quiz);
  }

  async submitQuiz(quizId: string, answers: number[], userId: string) {
    await this.delay();
    
    const quiz = await this.getQuiz(quizId);
    if (!quiz.success || !('data' in quiz)) {
      return this.createErrorResponse('Quiz not found', 404);
    }
    const questions = quiz.data.questions;
    
    if (!answers || !Array.isArray(answers)) {
      return {
        success: false,
        error: 'Answers must be provided as an array',
        data: null
      };
    }
    
    let correctAnswers = 0;
    const results = answers.map((answer, index) => {
      const isCorrect = answer === questions[index]?.correctAnswer;
      if (isCorrect) correctAnswers++;
      return {
        questionId: questions[index]?.id || '',
        userAnswer: answer,
        correctAnswer: questions[index]?.correctAnswer || 0,
        isCorrect,
        explanation: questions[index]?.explanation || '',
      };
    });
    
    const score = Math.round((correctAnswers / questions.length) * 100);
    const passed = score >= (quiz as any).data.passingScore;
    
    const quizResult = {
      id: `result_${Date.now()}`,
      quizId,
      userId,
      score,
      totalQuestions: questions.length,
      correctAnswers,
      timeTaken: 300, // 5 minutes
      completedAt: new Date(),
      passed,
      results,
    };
    
    return this.createResponse(quizResult);
  }

  // SCHOOL APIs
  async handleSchoolInvitation(data: any) {
    await this.delay();
    
    if (data.action === 'create') {
      const invitation = {
        id: `inv_${Date.now()}`,
        schoolId: data.schoolId,
        invitationCode: `SCHOOL${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        studentEmail: data.studentEmail,
        parentEmail: data.parentEmail,
        grade: data.grade,
        section: data.section,
        isUsed: false,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      };
      
      return this.createResponse(invitation);
    }
    
    if (data.action === 'verify') {
      // Simulate verification
      return this.createResponse({ verified: true, message: 'Invitation verified successfully' });
    }
    
    if (data.action === 'register') {
      // Simulate registration with invitation
      const user = await this.register(data.userData);
      const userData = 'data' in user ? user.data : null;
      return this.createResponse({ user: userData, message: 'Registered with invitation successfully' });
    }
    
    return this.createErrorResponse('Invalid action', 400);
  }

  // NOTIFICATIONS APIs
  async handleNotifications(data: any) {
    await this.delay();
    
    if (data.action === 'get') {
      const notifications = this.store.findNotificationsByUserId(data.userId);
      return this.createResponse(notifications);
    }
    
    if (data.action === 'mark-read') {
      const notification = this.store.getNotifications()
        .find(n => n.id === data.notificationId);
      
      if (notification) {
        notification.isRead = true;
        return this.createResponse({ message: 'Notification marked as read' });
      }
      
      return this.createErrorResponse('Notification not found', 404);
    }
    
    if (data.action === 'update-settings') {
      return this.createResponse({ message: 'Notification settings updated' });
    }
    
    if (data.action === 'subscribe') {
      return this.createResponse({ message: 'Subscribed to notifications successfully' });
    }
    
    return this.createErrorResponse('Invalid action', 400);
  }

  // SEARCH API
  async search(query: string, filters?: any) {
    await this.delay();
    
    const searchTerm = query.toLowerCase();
    const results: any = {
      events: [],
      users: [],
      videos: [],
    };
    
    // Search events
    results.events = this.store.getEvents().filter(e =>
      e.title.toLowerCase().includes(searchTerm) ||
      e.description?.toLowerCase().includes(searchTerm) ||
      e.category.toLowerCase().includes(searchTerm)
    );
    
    // Search users
    results.users = this.store.getUsers().filter(u =>
      u.firstName.toLowerCase().includes(searchTerm) ||
      u.lastName.toLowerCase().includes(searchTerm) ||
      u.email.toLowerCase().includes(searchTerm)
    );
    
    // Search videos
    results.videos = this.store.getVideoSubmissions().filter(v =>
      v.status.toLowerCase().includes(searchTerm)
    );
    
    return this.createResponse({
      query,
      results,
      total: results.events.length + results.users.length + results.videos.length,
    });
  }

  // ANALYTICS API
  async getAnalytics(userId?: string, type?: string) {
    await this.delay();
    
    if (type === 'user' && userId) {
      const user = this.store.findUserById(userId);
      if (!user) {
        return this.createErrorResponse('User not found', 404);
      }
      const subscriptions = this.store.getSubscriptions().filter(s => s.userId === userId);
      const videos = this.store.findVideoSubmissionsByUserId(userId);
      const notifications = this.store.findNotificationsByUserId(userId);
      
      return this.createResponse({
        user: {
          id: user?.id,
          name: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
          joinDate: user?.createdAt,
          totalVideos: videos.length,
          totalSubscriptions: subscriptions.length,
          unreadNotifications: notifications.filter(n => !n.isRead).length,
        },
        activity: {
          lastLogin: new Date().toISOString(),
          totalEvents: this.store.getEvents().length,
          activeSubscriptions: subscriptions.filter(s => s.status === 'active').length,
        }
      });
    }
    
    if (type === 'events') {
      const events = this.store.getEvents();
      const categories = [...new Set(events.map(e => e.category))];
      
      return this.createResponse({
        totalEvents: events.length,
        activeEvents: events.filter(e => e.isActive).length,
        categories: categories.map(category => ({
          name: category,
          count: events.filter(e => e.category === category).length,
        })),
        recentActivity: events.slice(-5).map(e => ({
          id: e.id,
          title: e.title,
          category: e.category,
          createdAt: e.createdAt,
        }))
      });
    }
    
    // General analytics
    return this.createResponse({
      totalUsers: this.store.getUsers().length,
      totalEvents: this.store.getEvents().length,
      totalVideos: this.store.getVideoSubmissions().length,
      totalSubscriptions: this.store.getSubscriptions().length,
      activeSubscriptions: this.store.getSubscriptions().filter(s => s.status === 'active').length,
    });
  }

  // ADMIN API
  async handleAdmin(data: any) {
    await this.delay();
    
    if (data.action === 'get-users') {
      const users = this.store.getUsers().map(u => ({
        id: u.id,
        name: `${u.firstName} ${u.lastName}`,
        email: u.email,
        mobile: u.mobile,
        isVerified: u.isVerified,
        createdAt: u.createdAt,
      }));
      
      return this.createResponse({ users });
    }
    
    if (data.action === 'get-events') {
      const events = this.store.getEvents().map(e => ({
        id: e.id,
        title: e.title,
        category: e.category,
        isActive: e.isActive,
        createdAt: e.createdAt,
      }));
      
      return this.createResponse({ events });
    }
    
    if (data.action === 'moderate-content') {
      return this.createResponse({ message: 'Content moderation completed' });
    }
    
    return this.createErrorResponse('Invalid admin action', 400);
  }

  // UTILS API
  async getConfig() {
    await this.delay();
    
    return this.createResponse({
      app: {
        name: 'Jack Marvels',
        version: '1.0.0',
        buildNumber: '1',
        environment: 'development',
      },
      features: {
        darkMode: true,
        pushNotifications: true,
        offlineMode: true,
        biometricAuth: true,
      },
      limits: {
        maxVideoSize: 100 * 1024 * 1024, // 100MB
        maxVideoDuration: 300, // 5 minutes
        maxUploadsPerDay: 5,
      },
      payment: {
        supportedMethods: ['razorpay', 'cash', 'cheque'],
        currency: 'INR',
        subscriptionPrice: 100,
      }
    });
  }
}

export const mockApiService = new MockApiService();
export default mockApiService;

// Re-export for modular structure
export { mockDataStore as MockDataStore, MockAuthService };
