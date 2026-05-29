import {
  isSubscriptionActive,
  isSubscribedFromUser,
  parseSubscriptionPayload,
} from '../../src/utils/subscription';
import { Subscription, User } from '../../src/types';

describe('subscription utils', () => {
  const activeSub: Subscription = {
    id: 'sub_1',
    userId: 'u1',
    plan: 'premium',
    amount: 100,
    paymentMethod: 'razorpay',
    status: 'active',
    startDate: '2024-01-01T00:00:00Z',
    endDate: '2099-12-31T23:59:59Z',
    canUploadVideos: true,
    maxVideosPerMonth: 10,
    videosUploadedThisMonth: 0,
  };

  it('detects active subscription', () => {
    expect(isSubscriptionActive(activeSub)).toBe(true);
  });

  it('rejects expired subscription', () => {
    expect(
      isSubscriptionActive({
        ...activeSub,
        endDate: '2020-01-01T00:00:00Z',
      }),
    ).toBe(false);
  });

  it('reads subscribed flag on user', () => {
    const user = { isSubscribed: true } as User;
    expect(isSubscribedFromUser(user)).toBe(true);
  });

  it('parses API subscribed boolean', () => {
    const sub = parseSubscriptionPayload({ subscribed: true });
    expect(sub?.status).toBe('active');
    expect(isSubscriptionActive(sub)).toBe(true);
  });
});
