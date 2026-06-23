import { mockApiService } from '../../src/services/mock-api';

describe('MockApiService coverage', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const flush = async () => {
    await Promise.resolve();
    jest.advanceTimersByTime(600);
    await Promise.resolve();
  };

  it('covers auth delegation methods', async () => {
    const send = mockApiService.sendOTP({ mobile: '9876543210', type: 'login' });
    await flush();
    expect((await send).success).toBe(true);

    const verify = mockApiService.verifyOTP({ mobile: '9876543210', otp: '123456' });
    await flush();
    expect((await verify).success).toBe(true);

    const select = mockApiService.selectProfile({ studentId: 101, mobile: '9123456789' });
    await flush();
    await select;

    const list = mockApiService.listProfiles();
    await flush();
    await list;

    const sw = mockApiService.switchProfile({ studentId: 101 });
    await flush();
    await sw;

    const refresh = mockApiService.refreshToken('refresh-token');
    await flush();
    await refresh;

    const logout = mockApiService.logout();
    await flush();
    expect((await logout).success).toBe(true);
  });

  it('covers dashboard for student and influencer', async () => {
    const studentDash = mockApiService.getDashboard('user_001');
    await flush();
    const student = await studentDash;
    expect(student.user.id).toBe('user_001');
    expect(student.stats).toBeDefined();

    const influencerDash = mockApiService.getDashboard('user_002');
    await flush();
    const influencer = await influencerDash;
    expect(influencer.user.roleId).toBe(3);
  });

  it('covers subscription and profile helpers', async () => {
    const update = mockApiService.updateSubscription({
      plan: 'premium',
      paymentMethod: 'razorpay',
      amount: 100,
    });
    await flush();
    expect((await update).data.plan).toBe('premium');

    const profile = mockApiService.getProfile('user_001');
    await flush();
    await profile;

    const updated = mockApiService.updateProfile('user_001', { firstName: 'New' });
    await flush();
    await updated;

    const avatar = mockApiService.uploadAvatar('user_001', { uri: 'file://x' });
    await flush();
    await avatar;
  });

  it('covers events filtering and video flows', async () => {
    const filtered = mockApiService.getEvents({
      category: 'Singing',
      search: 'sing',
      include: ['categories'],
    });
    await flush();
    expect((await filtered).data.categories.length).toBeGreaterThan(0);

    const withInclude = mockApiService.getEventById('event_001', ['guidelines', 'categories']);
    await flush();
    await withInclude;

    const videos = mockApiService.getVideoSubmissions('user_001', 'event_001');
    await flush();
    await videos;

    const cancel = mockApiService.cancelSubscription('sub_001');
    await flush();
    await cancel;
  });

  it('covers school, notifications, admin and config', async () => {
    const invite = mockApiService.handleSchoolInvitation({ action: 'accept', code: 'INVITE' });
    await flush();
    await invite;

    const notifications = mockApiService.handleNotifications({ action: 'markRead', id: 'n1' });
    await flush();
    await notifications;

    const admin = mockApiService.handleAdmin({ action: 'stats' });
    await flush();
    await admin;

    const config = mockApiService.getConfig();
    await flush();
    expect((await config).success).toBe(true);
  });
});
