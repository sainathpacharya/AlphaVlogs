import { Subscription, User } from '@/types';

/** True for BE/app values that mean the student has premium access. */
export function isTruthySubscriptionFlag(raw: unknown): boolean {
  if (raw === true) {
    return true;
  }
  const value = String(raw ?? '').toLowerCase().trim();
  return (
    value === 'active' ||
    value === 'subscribed' ||
    value === 'premium' ||
    value === 'true' ||
    value === '1'
  );
}

function normalizeStatus(raw: unknown): Subscription['status'] {
  const status = String(raw ?? '').toLowerCase();
  if (
    status === 'active' ||
    status === 'subscribed' ||
    status === 'premium'
  ) {
    return 'active';
  }
  if (status === 'expired') {
    return 'expired';
  }
  if (status === 'pending') {
    return 'pending';
  }
  if (status === 'cancelled' || status === 'canceled') {
    return 'cancelled';
  }
  return 'active';
}

function normalizePlan(raw: unknown): Subscription['plan'] {
  const plan = String(raw ?? '').toLowerCase();
  return plan === 'free' ? 'free' : 'premium';
}

/** True when subscription record allows premium / upload features. */
export function isSubscriptionActive(
  subscription: Subscription | null | undefined,
): boolean {
  if (!subscription) {
    return false;
  }
  if (normalizeStatus(subscription.status) !== 'active') {
    return false;
  }
  if (subscription.endDate) {
    const endMs = new Date(subscription.endDate).getTime();
    if (!Number.isNaN(endMs) && endMs < Date.now()) {
      return false;
    }
  }
  return (
    normalizePlan(subscription.plan) === 'premium' ||
    subscription.canUploadVideos === true
  );
}

/** Flags on user/profile from verify-otp, select-profile, or /api/auth/me. */
export function isSubscribedFromUser(user: User | null | undefined): boolean {
  if (!user) {
    return false;
  }
  const record = user as User & Record<string, unknown>;
  if (record.isSubscribed === true || record.subscribed === true) {
    return true;
  }
  return isTruthySubscriptionFlag(record.subscriptionStatus);
}

export function parseSubscriptionPayload(payload: unknown): Subscription | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }
  const record = payload as Record<string, unknown>;
  if (record.subscribed === false && record.isSubscribed === false) {
    return null;
  }
  const nested = record.subscription ?? record.data ?? record;
  if (!nested || typeof nested !== 'object') {
    return null;
  }
  const sub = nested as Record<string, unknown>;

  // Explicit not-subscribed from GET /api/students/subscription
  if (sub.isSubscribed === false || sub.subscribed === false) {
    return null;
  }

  if (sub.status && sub.plan) {
    return {
      id: String(sub.id ?? ''),
      userId: String(sub.userId ?? sub.studentId ?? ''),
      plan: normalizePlan(sub.plan),
      amount: Number(sub.amount ?? 0),
      paymentMethod: (sub.paymentMethod as Subscription['paymentMethod']) ?? 'razorpay',
      status: normalizeStatus(sub.status),
      startDate: String(sub.startDate ?? ''),
      endDate: sub.endDate == null ? '' : String(sub.endDate),
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
    sub.isSubscribed === true ||
    isTruthySubscriptionFlag(sub.status) ||
    isTruthySubscriptionFlag(sub.plan)
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
