import { MockDataStore } from '../../src/services/mock/mock-data-store';
import { MockAuthService } from '../../src/services/mock/mock-auth';

describe('MockAuthService', () => {
  let service: MockAuthService;

  beforeEach(() => {
    jest.useFakeTimers();
    service = new MockAuthService(new MockDataStore());
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const flush = async () => {
    await Promise.resolve();
    jest.advanceTimersByTime(600);
    await Promise.resolve();
  };

  it('sends OTP for known mobiles', async () => {
    const promise = service.sendOTP({ mobile: '9876543210', type: 'login' });
    await flush();
    const result = await promise;
    expect(result.success).toBe(true);
    expect(result.data?.smsHash).toBeDefined();
  });

  it('rejects unknown mobile on send OTP', async () => {
    const promise = service.sendOTP({ mobile: '0000000000', type: 'login' });
    await flush();
    const result = await promise;
    expect(result.success).toBe(false);
  });

  it('verifies OTP with profile selection', async () => {
    const promise = service.verifyOTP({ mobile: '9123456789', otp: '123456' });
    await flush();
    const result = await promise;
    expect(result.success).toBe(true);
    expect(result.data?.selectionRequired).toBe(true);
  });

  it('logs in valid student', async () => {
    const promise = service.login({ mobile: '9876543210', otp: '123456' });
    await flush();
    const result = await promise;
    expect(result.success).toBe(true);
    expect(result.data?.user).toBeDefined();
  });

  it('registers a new user and rejects duplicate email', async () => {
    const register = service.register({
      firstName: 'New',
      lastName: 'User',
      emailId: 'unique@example.com',
      mobileNumber: '9999888877',
      state: 'TS',
      district: 'HYD',
      city: 'HYD',
      pincode: '500001',
      schoolId: '1',
      schoolName: 'School',
    });
    await flush();
    expect((await register).success).toBe(true);

    const duplicate = service.register({
      firstName: 'Dup',
      lastName: 'User',
      emailId: 'rahul.sharma@example.com',
      mobileNumber: '9999888866',
      state: 'TS',
      district: 'HYD',
      city: 'HYD',
      pincode: '500001',
      schoolId: '1',
      schoolName: 'School',
    });
    await flush();
    expect((await duplicate).success).toBe(false);
  });

  it('selects profile and switches profile', async () => {
    const select = service.selectProfile({ studentId: 101, mobile: '9123456789' });
    await flush();
    await select;

    const list = service.listProfiles();
    await flush();
    expect((await list).data?.profiles?.length).toBeGreaterThan(0);

    const sw = service.switchProfile({ studentId: 101 });
    await flush();
    await sw;
  });

  it('refreshes token, logs out, and deletes account', async () => {
    const refresh = service.refreshToken('old-refresh');
    await flush();
    await refresh;

    const logout = service.logout();
    await flush();
    expect((await logout).success).toBe(true);

    const del = service.deleteAccount();
    await flush();
    await del;
  });
});
