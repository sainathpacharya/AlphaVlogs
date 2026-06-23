/** Client-only sentinel for the "Other (Enter manually)" school option. */
export const MANUAL_SCHOOL_ID = '9999';

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  emailId: string;
  mobileNumber: string;
  state: string;
  district: string;
  city: string;
  pincode: string;
  promocode?: string;
  schoolId?: string;
  schoolName?: string;
  studentClass?: string;
  section?: string;
}

export interface RegisterDeviceContext {
  deviceId: string;
  deviceType: string;
  token: string;
}

export interface RegisterApiPayload {
  firstName: string;
  lastName: string;
  emailId: string;
  mobileNumber: string;
  state: string;
  district: string;
  city: string;
  pincode: string;
  studentClass: string;
  deviceId: string;
  deviceType: string;
  token: string;
  schoolId?: number;
  schoolName?: string;
  section?: string;
  promoCode?: string;
  geolocation?: string;
}

export function normalizeMobileNumber(value: string): string {
  return value.replace(/\D/g, '');
}

export function isManualSchoolSelection(schoolId?: string): boolean {
  const id = schoolId?.trim();
  return !id || id === MANUAL_SCHOOL_ID;
}

/** Map registration form values to the backend POST /api/students/register body. */
export function buildRegisterApiPayload(
  data: RegisterFormData,
  device: RegisterDeviceContext,
): RegisterApiPayload {
  const payload: RegisterApiPayload = {
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    emailId: data.emailId.trim(),
    mobileNumber: normalizeMobileNumber(data.mobileNumber),
    state: data.state.trim(),
    district: data.district.trim(),
    city: data.city.trim(),
    pincode: data.pincode.trim(),
    studentClass: data.studentClass?.trim() ?? '',
    deviceId: device.deviceId,
    deviceType: device.deviceType,
    token: device.token,
  };

  if (isManualSchoolSelection(data.schoolId)) {
    const schoolName = data.schoolName?.trim();
    if (schoolName) {
      payload.schoolName = schoolName;
    }
  } else {
    payload.schoolId = Number(data.schoolId);
  }

  const section = data.section?.trim();
  if (section) {
    payload.section = section;
  }

  const promoCode = data.promocode?.trim();
  if (promoCode) {
    payload.promoCode = promoCode;
  }

  const geolocation = [data.city, data.state]
    .map(part => part?.trim())
    .filter(Boolean)
    .join(', ');
  if (geolocation) {
    payload.geolocation = geolocation;
  }

  return payload;
}
