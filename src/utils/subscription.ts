import { Subscription, User } from '@/types';

/** True when subscription record allows premium / upload features. */
export function isSubscriptionActive(
  subscription: Subscription | null | undefined,
): boolean {
  if (!subscription) {
    return false;
  }
  if (subscription.status !== 'active') {
    return false;
  }
  if (subscription.endDate) {
    const endMs = new Date(subscription.endDate).getTime();
    if (!Number.isNaN(endMs) && endMs < Date.now()) {
      return false;
    }
  }
  return (
    subscription.plan === 'premium' ||
    subscription.canUploadVideos === true
  );
}

/** Flags on user/profile from verify-otp or /api/auth/me. */
export function isSubscribedFromUser(user: User | null | undefined): boolean {
  if (!user) {
    return false;
  }
  const record = user as User & Record<string, unknown>;
  if (record.isSubscribed === true || record.subscribed === true) {
    return true;
  }
  const status = String(record.subscriptionStatus ?? '').toLowerCase();
  return status === 'active' || status === 'subscribed';
}

export function parseSubscriptionPayload(payload: unknown): Subscription | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }
  const record = payload as Record<string, unknown>;
  if (record.subscribed === false) {
    return null;
  }
  const nested = record.subscription ?? record.data ?? record;
  if (!nested || typeof nested !== 'object') {
    return null;
  }
  const sub = nested as Record<string, unknown>;
  if (sub.status && sub.plan) {
    return {
      id: String(sub.id ?? ''),
      userId: String(sub.userId ?? sub.studentId ?? ''),
      plan: (sub.plan as Subscription['plan']) ?? 'premium',
      amount: Number(sub.amount ?? 0),
      paymentMethod: (sub.paymentMethod as Subscription['paymentMethod']) ?? 'razorpay',
      status: (sub.status as Subscription['status']) ?? 'active',
      startDate: String(sub.startDate ?? ''),
      endDate: String(sub.endDate ?? ''),
      transactionId: sub.transactionId ? String(sub.transactionId) : undefined,
      canUploadVideos: sub.canUploadVideos !== false,
      maxVideosPerMonth: Number(sub.maxVideosPerMonth ?? 10),
      videosUploadedThisMonth: Number(sub.videosUploadedThisMonth ?? 0),
    };
  }

  if (
    record.subscribed === true ||
    record.isSubscribed === true ||
    sub.subscribed === true ||
    sub.isSubscribed === true
  ) {
    return {
      id: 'inferred',
      userId: '',
      plan: 'premium',
      amount: 0,
      paymentMethod: 'razorpay',
      status: 'active',
      startDate: '',
      endDate: '',
      canUploadVideos: true,
      maxVideosPerMonth: 10,
      videosUploadedThisMonth: 0,
    };
  }

  return null;
}
