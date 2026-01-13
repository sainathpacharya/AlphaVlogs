import { User, Event, InfluencerEvent, Subscription, PaymentMethod, VideoSubmission, QuizQuestion, Notification } from '@/types';

/**
 * Centralized mock data storage
 */
export class MockDataStore {
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
    },
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
    },
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
    },
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
    },
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
    },
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
    },
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
    },
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
    },
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

export const mockDataStore = new MockDataStore();
export default mockDataStore;

