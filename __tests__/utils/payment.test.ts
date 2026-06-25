import { canAccessPayment, buildPaymentReceipt } from '../../src/utils/payment';
import { User } from '../../src/types';

describe('payment utils', () => {
  const student: User = {
    id: '42',
    firstName: 'Test',
    lastName: 'Student',
    email: 'test@example.com',
    mobile: '+919876543210',
    state: '',
    district: '',
    city: '',
    pincode: '',
    roleId: 4,
    role: 'student',
    isVerified: true,
    createdAt: '',
    updatedAt: '',
  };

  it('allows payment for student role', () => {
    expect(canAccessPayment(student)).toBe(true);
  });

  it('denies payment when user is missing', () => {
    expect(canAccessPayment(null)).toBe(false);
    expect(canAccessPayment(undefined)).toBe(false);
  });

  it('allows payment when roleId is student even if role string differs', () => {
    expect(
      canAccessPayment({
        ...student,
        role: 'admin',
        roleId: 4,
      }),
    ).toBe(true);
  });

  it('denies payment for influencer role', () => {
    expect(
      canAccessPayment({
        ...student,
        role: 'influencer',
        roleId: 3,
      }),
    ).toBe(false);
  });

  it('builds receipt within 40 chars', () => {
    const receipt = buildPaymentReceipt('user_001');
    expect(receipt.startsWith('student_')).toBe(true);
    expect(receipt.length).toBeLessThanOrEqual(40);
  });

  it('truncates very long receipt values', () => {
    const receipt = buildPaymentReceipt('a'.repeat(100));
    expect(receipt.length).toBe(40);
  });
});
