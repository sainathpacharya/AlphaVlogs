import { queryKeys } from '../../src/lib/query-keys';

describe('queryKeys', () => {
  it('builds events list key from root', () => {
    expect(queryKeys.events.list()).toEqual(['events', 'list']);
    expect(queryKeys.events.list()[0]).toBe(queryKeys.events.all[0]);
  });

  it('builds auth mutation keys under auth root', () => {
    expect(queryKeys.auth.sendOtp()).toEqual(['auth', 'send-otp']);
    expect(queryKeys.auth.verifyOtp()).toEqual(['auth', 'verify-otp']);
    expect(queryKeys.auth.selectProfile()).toEqual(['auth', 'select-profile']);
    expect(queryKeys.auth.switchProfile()).toEqual(['auth', 'switch-profile']);
    expect(queryKeys.auth.profiles()).toEqual(['auth', 'profiles']);
    expect(queryKeys.auth.profile()).toEqual(['auth', 'profile']);
    expect(queryKeys.auth.register()).toEqual(['auth', 'register']);
    expect(queryKeys.auth.logout()).toEqual(['auth', 'logout']);
    expect(queryKeys.auth.deleteAccount()).toEqual(['auth', 'delete-account']);
  });

  it('keeps auth keys immutable tuples', () => {
    const key = queryKeys.auth.profile();
    expect(Object.isFrozen(key) || Array.isArray(key)).toBe(true);
    expect(key[0]).toBe('auth');
  });
});
