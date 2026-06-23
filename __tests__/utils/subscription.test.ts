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

  it('returns null when subscribed is false', () => {
    expect(parseSubscriptionPayload({ subscribed: false })).toBeNull();
  });

  it('parses nested subscription object', () => {
    const sub = parseSubscriptionPayload({
      subscription: {
        id: 's1',
        userId: 'u1',
        plan: 'premium',
        amount: 100,
        paymentMethod: 'razorpay',
        status: 'active',
        startDate: '2024-01-01',
        endDate: '2099-01-01',
      },
    });
    expect(sub?.id).toBe('s1');
  });

  it('detects subscribed user via subscriptionStatus', () => {
    expect(isSubscribedFromUser({ subscriptionStatus: 'active' } as User)).toBe(true);
    expect(isSubscribedFromUser({ subscribed: true } as User)).toBe(true);
    expect(isSubscribedFromUser(null)).toBe(false);
  });

  it('requires premium plan or upload flag when status active', () => {
    expect(
      isSubscriptionActive({
        ...activeSub,
        plan: 'free' as never,
        canUploadVideos: false,
      }),
    ).toBe(false);
  });

  it('handles inactive status and invalid end dates', () => {
    expect(isSubscriptionActive(null)).toBe(false);
    expect(isSubscriptionActive({ ...activeSub, status: 'cancelled' })).toBe(false);
    expect(isSubscriptionActive({ ...activeSub, endDate: 'not-a-date', plan: 'premium' })).toBe(
      true,
    );
  });

  it('parses inferred subscription from boolean flags', () => {
    expect(parseSubscriptionPayload({ isSubscribed: true })?.id).toBe('inferred');
    expect(parseSubscriptionPayload({ subscription: { subscribed: true } })?.status).toBe('active');
    expect(parseSubscriptionPayload('bad')).toBeNull();
    expect(parseSubscriptionPayload({ subscription: null })).toBeNull();
    expect(
      parseSubscriptionPayload({
        subscription: {
          id: 's2',
          plan: 'premium',
          status: 'active',
          transactionId: 'txn_1',
          canUploadVideos: false,
        },
      })?.transactionId,
    ).toBe('txn_1');
  });
});
