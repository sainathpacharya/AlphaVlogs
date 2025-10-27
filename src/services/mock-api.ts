import { User, Event, InfluencerEvent, Subscription, PaymentMethod, VideoSubmission, QuizQuestion, QuizResult, Notification, DashboardData } from '@/types';

// Mock data storage
class MockDataStore {
  private users: User[] = [
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
      profileImage: undefined,
      roleId: 4,
      role: 'student',
      isVerified: true,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
    },
    {
      id: 'user_002',
      firstName: 'Priya',
      lastName: 'Patel',
      email: 'priya.patel@example.com',
      mobile: '8765432109',
      state: 'Gujarat',
      district: 'Ahmedabad',
      city: 'Ahmedabad',
      pincode: '380001',
      profileImage: undefined,
      roleId: 3,
      role: 'influencer',
      isVerified: true,
      createdAt: '2024-01-10T14:30:00Z',
      updatedAt: '2024-01-10T14:30:00Z',
    }
  ];

  private events: Event[] = [
    {
      id: 'event_001',
      title: 'National Anthem',
      description: 'Sing the national anthem with pride and patriotism',
      category: 'Singing',
      isActive: true,
      startDate: '2024-01-15T00:00:00Z',
      endDate: '2024-02-15T23:59:59Z',
      canUpload: true,
      uploadStartDate: '2024-01-15T00:00:00Z',
      uploadEndDate: '2024-02-10T23:59:59Z',
      allowedRoles: [4],
      createdAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'event_002',
      title: 'Tongue Twister',
      description: 'Master challenging tongue twisters with speed and clarity',
      category: 'Speaking',
      isActive: true,
      startDate: '2024-02-01T00:00:00Z',
      endDate: '2024-03-01T23:59:59Z',
      canUpload: false,
      uploadStartDate: '2024-02-01T00:00:00Z',
      uploadEndDate: '2024-02-25T23:59:59Z',
      allowedRoles: [4],
      createdAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'event_003',
      title: 'Singing',
      description: 'Showcase your vocal talent with any song of your choice',
      category: 'Singing',
      isActive: true,
      startDate: '2024-01-20T00:00:00Z',
      endDate: '2024-02-20T23:59:59Z',
      canUpload: true,
      uploadStartDate: '2024-01-20T00:00:00Z',
      uploadEndDate: '2024-02-15T23:59:59Z',
      allowedRoles: [4],
      createdAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'event_004',
      title: 'Dancing',
      description: 'Express yourself through dance in any style',
      category: 'Dance',
      isActive: true,
      startDate: '2024-02-05T00:00:00Z',
      endDate: '2024-03-05T23:59:59Z',
      canUpload: true,
      uploadStartDate: '2024-02-05T00:00:00Z',
      uploadEndDate: '2024-02-28T23:59:59Z',
      allowedRoles: [4],
      createdAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'event_005',
      title: 'Movie Dialogues',
      description: 'Recreate famous movie dialogues with acting skills',
      category: 'Acting',
      isActive: true,
      startDate: '2024-01-25T00:00:00Z',
      endDate: '2024-02-25T23:59:59Z',
      canUpload: true,
      uploadStartDate: '2024-01-25T00:00:00Z',
      uploadEndDate: '2024-02-20T23:59:59Z',
      allowedRoles: [4],
      createdAt: '2024-01-01T00:00:00Z',
    }
  ];

  private influencerEvents: InfluencerEvent[] = [
    {
      id: 'inf_event_001',
      title: 'Register School',
      description: 'Register your school to participate in Jack Marvels competitions',
      type: 'school_registration',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'inf_event_002',
      title: 'View History',
      description: 'View your school\'s participation history and achievements',
      type: 'history',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
    }
  ];

  private subscriptions: Subscription[] = [
    {
      id: 'sub_001',
      userId: 'user_001',
      plan: 'premium',
      amount: 100,
      paymentMethod: 'razorpay',
      status: 'active',
      startDate: '2024-01-01T00:00:00Z',
      endDate: '2024-12-31T23:59:59Z',
      transactionId: 'txn_123456789',
      canUploadVideos: true,
      maxVideosPerMonth: 10,
      videosUploadedThisMonth: 3,
    }
  ];

  private paymentMethods: PaymentMethod[] = [
    {
      id: 'pm_001',
      type: 'razorpay',
      name: 'Razorpay (UPI, Cards, Net Banking)',
      isEnabled: true,
    },
    {
      id: 'pm_002',
      type: 'cash',
      name: 'Cash Payment',
      isEnabled: true,
    },
    {
      id: 'pm_003',
      type: 'cheque',
      name: 'Cheque Payment',
      isEnabled: true,
    }
  ];

  private videoSubmissions: VideoSubmission[] = [
    {
      id: 'vs_001',
      userId: 'user_001',
      eventId: 'event_001',
      videoUrl: 'https://example.com/videos/national_anthem.mp4',
      thumbnailUrl: 'https://example.com/thumbnails/national_anthem.jpg',
      duration: 120,
      uploadedAt: '2024-01-20T00:00:00Z',
      status: 'pending',
    }
  ];

  private quizQuestions: QuizQuestion[] = [
    {
      id: 'qq_001',
      question: 'What is the capital of India?',
      options: ['Mumbai', 'Delhi', 'Kolkata', 'Chennai'],
      correctAnswer: 1,
      explanation: 'Delhi is the capital of India',
      category: 'General Knowledge',
    },
    {
      id: 'qq_002',
      question: 'Which planet is known as the Red Planet?',
      options: ['Earth', 'Mars', 'Jupiter', 'Venus'],
      correctAnswer: 1,
      explanation: 'Mars is called the Red Planet due to its reddish appearance',
      category: 'Science',
    }
  ];

  private notifications: Notification[] = [
    {
      id: 'notif_001',
      userId: 'user_001',
      type: 'event',
      title: 'New Event Available',
      message: 'A new singing competition is now open for registration',
      data: { eventId: 'event_003' },
      isRead: false,
      createdAt: new Date('2024-01-25T10:00:00Z'),
    },
    {
      id: 'notif_002',
      userId: 'user_001',
      type: 'subscription',
      title: 'Subscription Renewal',
      message: 'Your premium subscription will expire in 30 days',
      data: { subscriptionId: 'sub_001' },
      isRead: false,
      createdAt: new Date('2024-01-24T15:30:00Z'),
    }
  ];

  // Getter methods
  getUsers() { return this.users; }
  getEvents() { return this.events; }
  getInfluencerEvents() { return this.influencerEvents; }
  getSubscriptions() { return this.subscriptions; }
  getPaymentMethods() { return this.paymentMethods; }
  getVideoSubmissions() { return this.videoSubmissions; }
  getQuizQuestions() { return this.quizQuestions; }
  getNotifications() { return this.notifications; }

  // Find methods
  findUserById(id: string) { return this.users.find(u => u.id === id); }
  findEventById(id: string) { return this.events.find(e => e.id === id); }
  findSubscriptionByUserId(userId: string) { return this.subscriptions.find(s => s.userId === userId); }
  findVideoSubmissionsByUserId(userId: string) { return this.videoSubmissions.filter(vs => vs.userId === userId); }
  findNotificationsByUserId(userId: string) { return this.notifications.filter(n => n.userId === userId); }

  // Update methods
  updateUser(id: string, updates: Partial<User>) {
    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex !== -1) {
      this.users[userIndex] = { ...this.users[userIndex], ...updates, updatedAt: new Date().toISOString() } as User;
      return this.users[userIndex];
    }
    return null;
  }

  addVideoSubmission(submission: Omit<VideoSubmission, 'id' | 'uploadedAt'>) {
    const newSubmission: VideoSubmission = {
      ...submission,
      id: `vs_${Date.now()}`,
      uploadedAt: new Date().toISOString(),
    };
    this.videoSubmissions.push(newSubmission);
    return newSubmission;
  }

  addNotification(notification: Omit<Notification, 'id' | 'createdAt'>) {
    const newNotification: Notification = {
      ...notification,
      id: `notif_${Date.now()}`,
      createdAt: new Date(),
    };
    this.notifications.push(newNotification);
    return newNotification;
  }
}

// Mock API Service
class MockApiService {
  private store = new MockDataStore();

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

  // AUTH APIs
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
        }
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
        }
      });
    }
    
    return this.createErrorResponse('Invalid mobile number or OTP', 401);
  }

  async login(data: { mobile: string; otp: string }) {
    await this.delay();
    
    if (data.mobile === '9876543210' && data.otp === '123456') {
      const user = this.store.findUserById('user_001');
      return this.createResponse({
        user,
        tokens: {
          accessToken: 'mock_access_token_123',
          refreshToken: 'mock_refresh_token_456',
          expiresIn: 3600,
        }
      });
    }
    
    return this.createErrorResponse('Invalid mobile number or OTP', 401);
  }

  async register(data: any) {
    await this.delay();
    
    // Validate required fields
    const validationErrors = this.validateRegistrationData(data);
    if (validationErrors.length > 0) {
      return this.createErrorResponse(validationErrors.join(', '), 400);
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

  /**
   * Validates registration data
   */
  private validateRegistrationData(data: any): string[] {
    const errors: string[] = [];
    
    // Required field validation
    if (!data.firstName?.trim()) {
      errors.push('First name is required');
    } else if (data.firstName.trim().length < 2) {
      errors.push('First name must be at least 2 characters long');
    } else if (!/^[a-zA-Z\s'-]+$/.test(data.firstName.trim())) {
      errors.push('First name can only contain letters, spaces, hyphens, and apostrophes');
    }
    
    if (!data.lastName?.trim()) {
      errors.push('Last name is required');
    } else if (data.lastName.trim().length < 2) {
      errors.push('Last name must be at least 2 characters long');
    } else if (!/^[a-zA-Z\s'-]+$/.test(data.lastName.trim())) {
      errors.push('Last name can only contain letters, spaces, hyphens, and apostrophes');
    }
    
    const email = data.email ?? data.emailId;
    if (!email?.trim()) {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.push('Please enter a valid email address');
    }
    
    const mobile = data.mobileNumber || data.mobile;
    if (!mobile?.trim()) {
      errors.push('Mobile number is required');
    } else if (!/^[6-9]\d{9}$/.test(mobile.trim())) {
      errors.push('Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9');
    }
    
    if (!data.state?.trim()) {
      errors.push('State is required');
    } else if (!/^[a-zA-Z\s]+$/.test(data.state.trim())) {
      errors.push('State name can only contain letters and spaces');
    }
    
    if (!data.district?.trim()) {
      errors.push('District is required');
    } else if (!/^[a-zA-Z\s]+$/.test(data.district.trim())) {
      errors.push('District name can only contain letters and spaces');
    }
    
    if (!data.city?.trim()) {
      errors.push('City is required');
    } else if (!/^[a-zA-Z\s]+$/.test(data.city.trim())) {
      errors.push('City name can only contain letters and spaces');
    }
    
    if (!data.pincode?.trim()) {
      errors.push('Pincode is required');
    } else if (!/^[1-9][0-9]{5}$/.test(data.pincode.trim())) {
      errors.push('Please enter a valid 6-digit pincode');
    }
    
    // School validation
    if (!data.schoolId && !data.schoolName?.trim()) {
      errors.push('Please select a school or enter school name');
    }
    
    // School name validation (if provided)
    if (data.schoolName && !/^[a-zA-Z0-9\s.'-]+$/.test(data.schoolName.trim())) {
      errors.push('School name can only contain letters, numbers, spaces, periods, hyphens, and apostrophes');
    }
    
    // Promo code validation (if provided)
    if (data.promocode && !/^[a-zA-Z0-9]+$/.test(data.promocode.trim())) {
      errors.push('Promo code can only contain letters and numbers');
    }
    
    return errors;
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

  // USER APIs
  async getProfile(userId: string) {
    await this.delay();
    
    const user = this.store.findUserById(userId);
    if (user) {
      return this.createResponse(user);
    }
    
    return this.createErrorResponse('User not found', 404);
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

  async uploadAvatar(userId: string, file: any) {
    await this.delay();
    
    const avatarUrl = `https://example.com/avatars/${userId}_${Date.now()}.jpg`;
    const updatedUser = this.store.updateUser(userId, { profileImage: avatarUrl });
    
    if (updatedUser) {
      return this.createResponse({ avatarUrl });
    }
    
    return this.createErrorResponse('User not found', 404);
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
    if (!quiz.success) {
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
    const passed = score >= quiz.data.passingScore;
    
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
      return this.createResponse({ user: user.data, message: 'Registered with invitation successfully' });
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
