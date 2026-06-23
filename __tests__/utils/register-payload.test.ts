import {
  MANUAL_SCHOOL_ID,
  buildRegisterApiPayload,
  isManualSchoolSelection,
  normalizeMobileNumber,
} from '../../src/utils/register-payload';

describe('register-payload', () => {
  const device = {
    deviceId: 'android-device-uuid-123',
    deviceType: 'android',
    token: 'fcm-push-token',
  };

  const baseForm = {
    firstName: 'NagaSainath',
    lastName: 'Reddy',
    emailId: 'sainathp.acharya@gmail.com',
    mobileNumber: '701 313 4330',
    state: 'Telangana',
    district: 'Hyderabad',
    city: 'Hyderabad',
    pincode: '500114',
    studentClass: '10',
    section: 'A',
    promocode: 'PROMO10',
  };

  it('normalizes mobile numbers to 10 digits', () => {
    expect(normalizeMobileNumber('701 313 4330')).toBe('7013134330');
  });

  it('treats manual school selection as no schoolId', () => {
    expect(isManualSchoolSelection(MANUAL_SCHOOL_ID)).toBe(true);
    expect(isManualSchoolSelection('')).toBe(true);
    expect(isManualSchoolSelection('3')).toBe(false);
  });

  it('builds manual-school payload without schoolId', () => {
    const payload = buildRegisterApiPayload(
      {
        ...baseForm,
        schoolId: MANUAL_SCHOOL_ID,
        schoolName: 'Seven Hills High School',
      },
      device,
    );

    expect(payload).toEqual({
      firstName: 'NagaSainath',
      lastName: 'Reddy',
      emailId: 'sainathp.acharya@gmail.com',
      mobileNumber: '7013134330',
      state: 'Telangana',
      district: 'Hyderabad',
      city: 'Hyderabad',
      pincode: '500114',
      studentClass: '10',
      section: 'A',
      promoCode: 'PROMO10',
      schoolName: 'Seven Hills High School',
      geolocation: 'Hyderabad, Telangana',
      deviceId: 'android-device-uuid-123',
      deviceType: 'android',
      token: 'fcm-push-token',
    });
    expect(payload.schoolId).toBeUndefined();
  });

  it('builds list-school payload with numeric schoolId only', () => {
    const payload = buildRegisterApiPayload(
      {
        ...baseForm,
        schoolId: '1',
        schoolName: 'Delhi Public School',
        promocode: '',
      },
      device,
    );

    expect(payload.schoolId).toBe(1);
    expect(payload.schoolName).toBeUndefined();
    expect(payload.promoCode).toBeUndefined();
  });
});
