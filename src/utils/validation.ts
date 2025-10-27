/**
 * Comprehensive validation utilities for form validation
 */

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | null;
  message?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface FormField {
  value: string;
  rules: ValidationRule;
}

// Common validation patterns
export const VALIDATION_PATTERNS = {
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  phone: /^[6-9]\d{9}$/,
  pincode: /^[1-9][0-9]{5}$/,
  name: /^[a-zA-Z\s'-]+$/,
  schoolName: /^[a-zA-Z0-9\s.'-]+$/,
  alphanumeric: /^[a-zA-Z0-9\s]+$/,
  onlyLetters: /^[a-zA-Z\s]+$/,
  onlyNumbers: /^\d+$/,
};

// Common validation messages
export const VALIDATION_MESSAGES = {
  required: 'This field is required',
  invalidEmail: 'Please enter a valid email address',
  invalidPhone: 'Please enter a valid 10-digit mobile number',
  invalidPincode: 'Please enter a valid 6-digit pincode',
  invalidName: 'Name can only contain letters, spaces, hyphens, and apostrophes',
  invalidSchoolName: 'School name can only contain letters, numbers, spaces, periods, hyphens, and apostrophes',
  minLength: (min: number) => `Must be at least ${min} characters long`,
  maxLength: (max: number) => `Must be no more than ${max} characters long`,
  phoneStartDigit: 'Mobile number must start with 6, 7, 8, or 9',
  pincodeRange: 'Pincode must be between 100000 and 999999',
};

/**
 * Validates a single field value against its rules
 */
export const validateField = (value: string, rules: ValidationRule): string | null => {
  const trimmedValue = value.trim();

  // Required validation
  if (rules.required && !trimmedValue) {
    return rules.message || VALIDATION_MESSAGES.required;
  }

  // Skip other validations if value is empty and not required
  if (!trimmedValue && !rules.required) {
    return null;
  }

  // Min length validation
  if (rules.minLength && trimmedValue.length < rules.minLength) {
    return rules.message || VALIDATION_MESSAGES.minLength(rules.minLength);
  }

  // Max length validation
  if (rules.maxLength && trimmedValue.length > rules.maxLength) {
    return rules.message || VALIDATION_MESSAGES.maxLength(rules.maxLength);
  }

  // Pattern validation
  if (rules.pattern && !rules.pattern.test(trimmedValue)) {
    return rules.message || 'Invalid format';
  }

  // Custom validation
  if (rules.custom) {
    return rules.custom(trimmedValue);
  }

  return null;
};

/**
 * Validates multiple form fields
 */
export const validateForm = (fields: Record<string, FormField>): ValidationResult => {
  const errors: Record<string, string> = {};
  let isValid = true;

  Object.entries(fields).forEach(([fieldName, field]) => {
    const error = validateField(field.value, field.rules);
    if (error) {
      errors[fieldName] = error;
      isValid = false;
    }
  });

  return { isValid, errors };
};

/**
 * Registration form specific validation rules
 */
export const REGISTRATION_VALIDATION_RULES = {
  firstName: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: VALIDATION_PATTERNS.name,
    message: VALIDATION_MESSAGES.invalidName,
  },
  lastName: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: VALIDATION_PATTERNS.name,
    message: VALIDATION_MESSAGES.invalidName,
  },
  emailId: {
    required: true,
    maxLength: 100,
    pattern: VALIDATION_PATTERNS.email,
    message: VALIDATION_MESSAGES.invalidEmail,
  },
  mobileNumber: {
    required: true,
    pattern: VALIDATION_PATTERNS.phone,
    message: VALIDATION_MESSAGES.invalidPhone,
    custom: (value: string) => {
      if (!VALIDATION_PATTERNS.phone.test(value)) {
        return VALIDATION_MESSAGES.invalidPhone;
      }
      if (!['6', '7', '8', '9'].includes(value[0])) {
        return VALIDATION_MESSAGES.phoneStartDigit;
      }
      return null;
    },
  },
  state: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: VALIDATION_PATTERNS.onlyLetters,
    message: 'State name can only contain letters and spaces',
  },
  district: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: VALIDATION_PATTERNS.onlyLetters,
    message: 'District name can only contain letters and spaces',
  },
  city: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: VALIDATION_PATTERNS.onlyLetters,
    message: 'City name can only contain letters and spaces',
  },
  pincode: {
    required: true,
    pattern: VALIDATION_PATTERNS.pincode,
    message: VALIDATION_MESSAGES.invalidPincode,
    custom: (value: string) => {
      if (!VALIDATION_PATTERNS.pincode.test(value)) {
        return VALIDATION_MESSAGES.invalidPincode;
      }
      const pincodeNum = parseInt(value, 10);
      if (pincodeNum < 100000 || pincodeNum > 999999) {
        return VALIDATION_MESSAGES.pincodeRange;
      }
      return null;
    },
  },
  promocode: {
    required: false,
    maxLength: 20,
    pattern: VALIDATION_PATTERNS.alphanumeric,
    message: 'Promo code can only contain letters and numbers',
  },
  schoolName: {
    required: false,
    minLength: 2,
    maxLength: 100,
    pattern: VALIDATION_PATTERNS.schoolName,
    message: VALIDATION_MESSAGES.invalidSchoolName,
  },
};

/**
 * Validates registration form data
 */
export const validateRegistrationForm = (formData: Record<string, string>): ValidationResult => {
  const fields: Record<string, FormField> = {};

  // Convert form data to validation fields
  Object.entries(REGISTRATION_VALIDATION_RULES).forEach(([fieldName, rules]) => {
    fields[fieldName] = {
      value: formData[fieldName] || '',
      rules,
    };
  });

  // Special validation for school selection
  const schoolValidation = validateSchoolSelection(formData.schoolId, formData.schoolName);
  if (!schoolValidation.isValid) {
    return {
      isValid: false,
      errors: { ...validateForm(fields).errors, ...schoolValidation.errors },
    };
  }

  return validateForm(fields);
};

/**
 * Validates school selection (either schoolId or schoolName must be provided)
 */
export const validateSchoolSelection = (schoolId: string, schoolName: string): ValidationResult => {
  const errors: Record<string, string> = {};

  if (!schoolId && !schoolName.trim()) {
    errors.schoolId = 'Please select a school or enter school name';
    return { isValid: false, errors };
  }

  // If custom school name is provided, validate it
  if (!schoolId && schoolName.trim()) {
    const schoolNameError = validateField(schoolName, REGISTRATION_VALIDATION_RULES.schoolName);
    if (schoolNameError) {
      errors.schoolName = schoolNameError;
      return { isValid: false, errors };
    }
  }

  return { isValid: true, errors: {} };
};

/**
 * Real-time validation for individual fields
 */
export const validateFieldRealtime = (
  fieldName: string,
  value: string,
  rules: ValidationRule
): string | null => {
  // For real-time validation, we might want to be less strict
  // For example, don't show "required" error until user has interacted with the field
  if (rules.required && !value.trim()) {
    return null; // Don't show required error in real-time
  }

  return validateField(value, rules);
};

/**
 * Sanitizes input values
 */
export const sanitizeInput = (value: string, type: 'name' | 'email' | 'phone' | 'pincode' | 'general'): string => {
  let sanitized = value.trim();

  switch (type) {
    case 'name':
      // Remove extra spaces and keep only letters, spaces, hyphens, apostrophes
      sanitized = sanitized.replace(/[^a-zA-Z\s'-]/g, '').replace(/\s+/g, ' ');
      break;
    case 'email':
      // Remove extra spaces and convert to lowercase
      sanitized = sanitized.toLowerCase().replace(/\s+/g, '');
      break;
    case 'phone':
    case 'pincode':
      // Keep only digits
      sanitized = sanitized.replace(/\D/g, '');
      break;
    case 'general':
      // Remove extra spaces
      sanitized = sanitized.replace(/\s+/g, ' ');
      break;
  }

  return sanitized;
};

/**
 * Formats phone number for display
 */
export const formatPhoneNumber = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length <= 3) return cleaned;
  if (cleaned.length <= 6) return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
  return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 10)}`;
};

/**
 * Formats pincode for display
 */
export const formatPincode = (value: string): string => {
  return value.replace(/\D/g, '').slice(0, 6);
};

/**
 * Checks if form is ready for submission
 */
export const isFormReadyForSubmission = (formData: Record<string, string>): boolean => {
  const requiredFields = ['firstName', 'lastName', 'emailId', 'mobileNumber', 'state', 'district', 'city', 'pincode'];
  
  // Check if all required fields have values
  const hasRequiredValues = requiredFields.every(field => formData[field]?.trim());
  
  // Check if school is selected or custom school name is provided
  const hasSchool = !!(formData.schoolId || formData.schoolName?.trim());
  
  return hasRequiredValues && hasSchool;
};
