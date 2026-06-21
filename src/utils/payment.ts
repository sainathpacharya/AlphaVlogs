import { User } from '@/types';

/** Student-only mobile app — payment APIs accept STUDENT JWT from OTP login. */
export function canAccessPayment(user: User | null | undefined): boolean {
  if (!user) {
    return false;
  }
  const role = String(user.role ?? '').toLowerCase();
  return role === 'student' || user.roleId === 4;
}

export function buildPaymentReceipt(userId: string): string {
  const suffix = `${userId}_${Date.now()}`.replace(/[^a-zA-Z0-9_-]/g, '_');
  const receipt = `student_${suffix}`;
  return receipt.length > 40 ? receipt.slice(0, 40) : receipt;
}
