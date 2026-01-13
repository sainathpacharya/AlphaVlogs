/**
 * Shared validation utilities for the application
 * Centralizes validation logic to avoid duplication
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface FormValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface FieldValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | null;
}

export interface FormField {
  value: string;
  rules: FieldValidationRules;
}

export interface RegistrationData {
  firstName?: string;
  lastName?: string;
  emailId?: string;
  email?: string;
  mobileNumber?: string;
  mobile?: string;
  state?: string;
  district?: string;
  city?: string;
  pincode?: string;
  schoolId?: string;
  schoolName?: string;
  promocode?: string;
}

/**
 * Validates registration data with comprehensive checks
 */
export function validateRegistrationData(data: RegistrationData): ValidationResult {
  const errors: string[] = [];

  // Required field validation
  if (!data.firstName?.trim()) {
    errors.push('First name is required');
  } else if (data.firstName.trim().length < 2) {
    errors.push('First name must be at least 2 characters long');
  } else if (!/^[a-zA-Z\s'-]+$/.test(data.firstName.trim())) {
    errors.push('First name can only contain letters, spaces, hyphens, and apostrophes');
  }

  if (!data.lastName?.trim()) {
    errors.push('Last name is required');
  } else if (data.lastName.trim().length < 2) {
    errors.push('Last name must be at least 2 characters long');
  } else if (!/^[a-zA-Z\s'-]+$/.test(data.lastName.trim())) {
    errors.push('Last name can only contain letters, spaces, hyphens, and apostrophes');
  }

  const email = data.email ?? data.emailId;
  if (!email?.trim()) {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.push('Please enter a valid email address');
  }

  const mobile = data.mobileNumber || data.mobile;
  if (!mobile?.trim()) {
    errors.push('Mobile number is required');
  } else if (!/^[6-9]\d{9}$/.test(mobile.trim())) {
    errors.push('Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9');
  }

  if (!data.state?.trim()) {
    errors.push('State is required');
  } else if (!/^[a-zA-Z\s]+$/.test(data.state.trim())) {
    errors.push('State name can only contain letters and spaces');
  }

  if (!data.district?.trim()) {
    errors.push('District is required');
  } else if (!/^[a-zA-Z\s]+$/.test(data.district.trim())) {
    errors.push('District name can only contain letters and spaces');
  }

  if (!data.city?.trim()) {
    errors.push('City is required');
  } else if (!/^[a-zA-Z\s]+$/.test(data.city.trim())) {
    errors.push('City name can only contain letters and spaces');
  }

  if (!data.pincode?.trim()) {
    errors.push('Pincode is required');
  } else if (!/^[1-9][0-9]{5}$/.test(data.pincode.trim())) {
    errors.push('Please enter a valid 6-digit pincode');
  }

  // School validation
  if (!data.schoolId && !data.schoolName?.trim()) {
    errors.push('Please select a school or enter school name');
  }

  // School name validation (if provided)
  if (data.schoolName && !/^[a-zA-Z0-9\s.'-]+$/.test(data.schoolName.trim())) {
    errors.push('School name can only contain letters, numbers, spaces, periods, hyphens, and apostrophes');
  }

  // Promo code validation (if provided)
  if (data.promocode && !/^[a-zA-Z0-9]+$/.test(data.promocode.trim())) {
    errors.push('Promo code can only contain letters and numbers');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates email format
 */
export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Validates mobile number format
 */
export function validateMobileNumber(mobile: string): boolean {
  return /^[6-9]\d{9}$/.test(mobile.trim());
}

/**
 * Validates pincode format
 */
export function validatePincode(pincode: string): boolean {
  return /^[1-9][0-9]{5}$/.test(pincode.trim());
}

/**
 * Validates name format
 */
export function validateName(name: string): boolean {
  return /^[a-zA-Z\s'-]+$/.test(name.trim());
}

/**
 * Validates location name (state, district, city)
 */
export function validateLocationName(location: string): boolean {
  return /^[a-zA-Z\s]+$/.test(location.trim());
}

/**
 * Sanitizes string input
 */
export function sanitizeString(str: string): string {
  return str.trim();
}

/**
 * Validates and sanitizes registration data
 */
export function sanitizeRegistrationData(data: RegistrationData): RegistrationData {
  return {
    firstName: data.firstName?.trim(),
    lastName: data.lastName?.trim(),
    emailId: data.emailId?.trim() || data.email?.trim(),
    email: data.email?.trim() || data.emailId?.trim(),
    mobileNumber: data.mobileNumber?.trim() || data.mobile?.trim(),
    mobile: data.mobile?.trim() || data.mobileNumber?.trim(),
    state: data.state?.trim(),
    district: data.district?.trim(),
    city: data.city?.trim(),
    pincode: data.pincode?.trim(),
    schoolId: data.schoolId,
    schoolName: data.schoolName?.trim(),
    promocode: data.promocode?.trim(),
  };
}

// Validation Patterns
export const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[6-9]\d{9}$/,
  pincode: /^[1-9][0-9]{5}$/,
  name: /^[a-zA-Z\s'-]+$/,
  schoolName: /^[a-zA-Z0-9\s.'-]+$/,
  promocode: /^[a-zA-Z0-9]+$/,
  location: /^[a-zA-Z\s]+$/,
} as const;

// Validation Messages
export const VALIDATION_MESSAGES = {
  required: 'This field is required',
  invalidEmail: 'Please enter a valid email address',
  invalidPhone: 'Please enter a valid 10-digit mobile number',
  invalidPincode: 'Please enter a valid 6-digit pincode',
  invalidName: 'Name can only contain letters, spaces, hyphens, and apostrophes',
  invalidSchoolName: 'School name can only contain letters, numbers, spaces, periods, hyphens, and apostrophes',
  minLength: (min: number) => `Must be at least ${min} characters`,
  maxLength: (max: number) => `Must be no more than ${max} characters`,
} as const;

// Registration Validation Rules
export const REGISTRATION_VALIDATION_RULES: Record<string, FieldValidationRules> = {
  firstName: {
    required: true,
    minLength: 2,
    pattern: VALIDATION_PATTERNS.name,
  },
  lastName: {
    required: true,
    minLength: 2,
    pattern: VALIDATION_PATTERNS.name,
  },
  emailId: {
    required: true,
    pattern: VALIDATION_PATTERNS.email,
  },
  mobileNumber: {
    required: true,
    pattern: VALIDATION_PATTERNS.phone,
  },
  state: {
    required: true,
    pattern: VALIDATION_PATTERNS.location,
  },
  district: {
    required: true,
    pattern: VALIDATION_PATTERNS.location,
  },
  city: {
    required: true,
    pattern: VALIDATION_PATTERNS.location,
  },
  pincode: {
    required: true,
    pattern: VALIDATION_PATTERNS.pincode,
  },
  schoolName: {
    pattern: VALIDATION_PATTERNS.schoolName,
  },
  promocode: {
    pattern: VALIDATION_PATTERNS.promocode,
  },
} as const;

/**
 * Validates a single field with given rules
 */
export function validateField(value: string, rules: FieldValidationRules): string | null {
  const trimmedValue = value?.trim() || '';

  // Skip validation for empty non-required fields
  if (!trimmedValue && !rules.required) {
    return null;
  }

  // Required validation
  if (rules.required && !trimmedValue) {
    return VALIDATION_MESSAGES.required;
  }

  // Min length validation
  if (rules.minLength && trimmedValue.length < rules.minLength) {
    return VALIDATION_MESSAGES.minLength(rules.minLength);
  }

  // Max length validation
  if (rules.maxLength && trimmedValue.length > rules.maxLength) {
    return VALIDATION_MESSAGES.maxLength(rules.maxLength);
  }

  // Pattern validation
  if (rules.pattern && trimmedValue && !rules.pattern.test(trimmedValue)) {
    return 'Invalid format';
  }

  // Custom validation
  if (rules.custom && trimmedValue) {
    const customError = rules.custom(trimmedValue);
    if (customError) {
      return customError;
    }
  }

  return null;
}

/**
 * Validates multiple form fields
 */
export function validateForm(fields: Record<string, FormField>): FormValidationResult {
  const errors: Record<string, string> = {};

  for (const [fieldName, field] of Object.entries(fields)) {
    const error = validateField(field.value, field.rules);
    if (error) {
      errors[fieldName] = error;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates registration form data
 */
export function validateRegistrationForm(data: RegistrationData): FormValidationResult {
  const errors: Record<string, string> = {};

  // Validate firstName
  if (!data.firstName?.trim()) {
    errors.firstName = VALIDATION_MESSAGES.invalidName;
  } else if (!VALIDATION_PATTERNS.name.test(data.firstName.trim())) {
    errors.firstName = VALIDATION_MESSAGES.invalidName;
  }

  // Validate lastName
  if (!data.lastName?.trim()) {
    errors.lastName = VALIDATION_MESSAGES.invalidName;
  } else if (!VALIDATION_PATTERNS.name.test(data.lastName.trim())) {
    errors.lastName = VALIDATION_MESSAGES.invalidName;
  }

  // Validate email
  const email = data.emailId || data.email;
  if (!email?.trim()) {
    errors.emailId = VALIDATION_MESSAGES.invalidEmail;
  } else if (!VALIDATION_PATTERNS.email.test(email.trim())) {
    errors.emailId = VALIDATION_MESSAGES.invalidEmail;
  }

  // Validate mobile
  const mobile = data.mobileNumber || data.mobile;
  if (!mobile?.trim()) {
    errors.mobileNumber = VALIDATION_MESSAGES.invalidPhone;
  } else if (!VALIDATION_PATTERNS.phone.test(mobile.trim())) {
    errors.mobileNumber = VALIDATION_MESSAGES.invalidPhone;
  }

  // Validate state
  if (!data.state?.trim()) {
    errors.state = VALIDATION_MESSAGES.required;
  } else if (!VALIDATION_PATTERNS.location.test(data.state.trim())) {
    errors.state = VALIDATION_MESSAGES.required;
  }

  // Validate district
  if (!data.district?.trim()) {
    errors.district = VALIDATION_MESSAGES.required;
  } else if (!VALIDATION_PATTERNS.location.test(data.district.trim())) {
    errors.district = VALIDATION_MESSAGES.required;
  }

  // Validate city
  if (!data.city?.trim()) {
    errors.city = VALIDATION_MESSAGES.required;
  } else if (!VALIDATION_PATTERNS.location.test(data.city.trim())) {
    errors.city = VALIDATION_MESSAGES.required;
  }

  // Validate pincode
  if (!data.pincode?.trim()) {
    errors.pincode = VALIDATION_MESSAGES.invalidPincode;
  } else if (!VALIDATION_PATTERNS.pincode.test(data.pincode.trim())) {
    errors.pincode = VALIDATION_MESSAGES.invalidPincode;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates school selection
 */
export function validateSchoolSelection(schoolId: string, schoolName: string): FormValidationResult {
  const errors: Record<string, string> = {};

  if (!schoolId && !schoolName?.trim()) {
    errors.schoolId = 'Please select a school or enter school name';
  } else if (schoolName && !VALIDATION_PATTERNS.schoolName.test(schoolName.trim())) {
    errors.schoolName = VALIDATION_MESSAGES.invalidSchoolName;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Sanitizes input based on type
 * Note: Does not trim during input to allow spaces while typing
 */
export function sanitizeInput(value: string, type: 'name' | 'email' | 'phone' | 'pincode' | 'general', trim: boolean = false): string {
  let sanitized = value;

  switch (type) {
    case 'name':
      // Remove special characters except hyphens, apostrophes, and spaces
      // Preserve spaces in the middle of the text
      sanitized = sanitized.replace(/[^a-zA-Z\s'-]/g, '');
      // Always trim name inputs to remove leading/trailing spaces
      sanitized = sanitized.trim();
      break;
    case 'email':
      // Remove spaces and convert to lowercase
      sanitized = sanitized.replace(/\s/g, '').toLowerCase();
      // Always trim email inputs
      sanitized = sanitized.trim();
      break;
    case 'phone':
      // Remove all non-digit characters and limit to 10 digits
      sanitized = sanitized.replace(/\D/g, '').slice(0, 10);
      break;
    case 'pincode':
      // Remove all non-digit characters
      sanitized = sanitized.replace(/\D/g, '');
      break;
    case 'general':
    default:
      // Don't trim during typing, only on final validation
      if (trim) {
        sanitized = sanitized.trim();
      }
      break;
  }

  return sanitized;
}

/**
 * Formats phone number with spaces
 */
export function formatPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length <= 3) {
    return digits;
  } else if (digits.length <= 6) {
    return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  } else {
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`;
  }
}

/**
 * Formats pincode (ensures 6 digits)
 */
export function formatPincode(pincode: string): string {
  const digits = pincode.replace(/\D/g, '');
  return digits.slice(0, 6);
}

/**
 * Checks if form is ready for submission
 */
export function isFormReadyForSubmission(form: RegistrationData): boolean {
  const requiredFields = [
    'firstName',
    'lastName',
    'emailId',
    'mobileNumber',
    'state',
    'district',
    'city',
    'pincode',
  ];

  // Check all required fields are filled
  for (const field of requiredFields) {
    const value = form[field as keyof RegistrationData];
    if (!value || !String(value).trim()) {
      return false;
    }
  }

  // Check school selection
  if (!form.schoolId && !form.schoolName?.trim()) {
    return false;
  }

  // Validate all fields
  const validation = validateRegistrationForm(form);
  return validation.isValid;
}

/**
 * Real-time field validation
 * For phone numbers, only validate when complete (10 digits) to avoid showing errors while typing
 */
export function validateFieldRealtime(
  fieldName: string,
  value: string,
  rules?: FieldValidationRules
): string | null {
  const fieldRules = rules || REGISTRATION_VALIDATION_RULES[fieldName];
  if (!fieldRules) {
    return null;
  }

  // For phone numbers, only validate when we have exactly 10 digits
  // This prevents showing "Invalid format" while user is still typing
  if (fieldName === 'mobileNumber') {
    const digits = value.replace(/\D/g, '');
    // If user is still typing (less than 10 digits), don't show validation error yet
    if (digits.length > 0 && digits.length < 10) {
      return null;
    }
  }

  return validateField(value, fieldRules);
}
