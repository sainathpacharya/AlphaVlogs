import {
  validateField,
  validateForm,
  validateRegistrationForm,
  validateSchoolSelection,
  sanitizeInput,
  formatPhoneNumber,
  formatPincode,
  isFormReadyForSubmission,
  VALIDATION_PATTERNS,
  VALIDATION_MESSAGES,
  REGISTRATION_VALIDATION_RULES,
} from '../../src/utils/validation';

describe('Validation Utils', () => {
  describe('validateField', () => {
    it('should validate required fields', () => {
      const rules = { required: true };
      expect(validateField('', rules)).toBe(VALIDATION_MESSAGES.required);
      expect(validateField('   ', rules)).toBe(VALIDATION_MESSAGES.required);
      expect(validateField('valid', rules)).toBeNull();
    });

    it('should validate min length', () => {
      const rules = { minLength: 3 };
      expect(validateField('ab', rules)).toBe(VALIDATION_MESSAGES.minLength(3));
      expect(validateField('abc', rules)).toBeNull();
    });

    it('should validate max length', () => {
      const rules = { maxLength: 5 };
      expect(validateField('abcdef', rules)).toBe(VALIDATION_MESSAGES.maxLength(5));
      expect(validateField('abcde', rules)).toBeNull();
    });

    it('should validate patterns', () => {
      const rules = { pattern: VALIDATION_PATTERNS.email };
      expect(validateField('invalid-email', rules)).toBe('Invalid format');
      expect(validateField('test@example.com', rules)).toBeNull();
    });

    it('should validate custom rules', () => {
      const rules = {
        custom: (value: string) => value.length < 3 ? 'Too short' : null
      };
      expect(validateField('ab', rules)).toBe('Too short');
      expect(validateField('abc', rules)).toBeNull();
    });

    it('should skip validation for empty non-required fields', () => {
      const rules = { pattern: VALIDATION_PATTERNS.email };
      expect(validateField('', rules)).toBeNull();
    });
  });

  describe('validateForm', () => {
    it('should validate multiple fields', () => {
      const fields = {
        name: { value: 'John', rules: { required: true, minLength: 2 } },
        email: { value: 'invalid', rules: { required: true, pattern: VALIDATION_PATTERNS.email } },
        age: { value: '', rules: { required: false } },
      };

      const result = validateForm(fields);
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBe('Invalid format');
      expect(result.errors.name).toBeUndefined();
      expect(result.errors.age).toBeUndefined();
    });

    it('should return valid for all valid fields', () => {
      const fields = {
        name: { value: 'John', rules: { required: true, minLength: 2 } },
        email: { value: 'john@example.com', rules: { required: true, pattern: VALIDATION_PATTERNS.email } },
      };

      const result = validateForm(fields);
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });
  });

  describe('validateRegistrationForm', () => {
    it('should validate complete registration data', () => {
      const formData = {
        firstName: 'John',
        lastName: 'Doe',
        emailId: 'john@example.com',
        mobileNumber: '9876543210',
        state: 'Maharashtra',
        district: 'Mumbai',
        city: 'Mumbai',
        pincode: '400001',
        schoolId: '1',
        schoolName: '',
        promocode: '',
      };

      const result = validateRegistrationForm(formData);
      expect(result.isValid).toBe(true);
    });

    it('should fail validation for missing required fields', () => {
      const formData = {
        firstName: '',
        lastName: 'Doe',
        emailId: 'invalid-email',
        mobileNumber: '123',
        state: '',
        district: '',
        city: '',
        pincode: '12345',
        schoolId: '',
        schoolName: '',
        promocode: '',
      };

      const result = validateRegistrationForm(formData);
      expect(result.isValid).toBe(false);
      expect(result.errors.firstName).toBe(VALIDATION_MESSAGES.invalidName);
      expect(result.errors.emailId).toBe(VALIDATION_MESSAGES.invalidEmail);
      expect(result.errors.mobileNumber).toBe(VALIDATION_MESSAGES.invalidPhone);
      expect(result.errors.pincode).toBe(VALIDATION_MESSAGES.invalidPincode);
    });
  });

  describe('validateSchoolSelection', () => {
    it('should require either schoolId or schoolName', () => {
      const result = validateSchoolSelection('', '');
      expect(result.isValid).toBe(false);
      expect(result.errors.schoolId).toBe('Please select a school or enter school name');
    });

    it('should validate school name when provided', () => {
      const result = validateSchoolSelection('', 'School@123');
      expect(result.isValid).toBe(false);
      expect(result.errors.schoolName).toBe(VALIDATION_MESSAGES.invalidSchoolName);
    });

    it('should pass validation with valid schoolId', () => {
      const result = validateSchoolSelection('1', '');
      expect(result.isValid).toBe(true);
    });

    it('should pass validation with valid schoolName', () => {
      const result = validateSchoolSelection('', 'Delhi Public School');
      expect(result.isValid).toBe(true);
    });
  });

  describe('sanitizeInput', () => {
    it('should sanitize name inputs', () => {
      expect(sanitizeInput('  John@123  ', 'name')).toBe('John');
      expect(sanitizeInput('Mary-Jane O\'Connor', 'name')).toBe('Mary-Jane O\'Connor');
    });

    it('should sanitize email inputs', () => {
      expect(sanitizeInput('  JOHN@EXAMPLE.COM  ', 'email')).toBe('john@example.com');
      expect(sanitizeInput('test @ example . com', 'email')).toBe('test@example.com');
    });

    it('should sanitize phone inputs', () => {
      expect(sanitizeInput('987-654-3210', 'phone')).toBe('9876543210');
      expect(sanitizeInput('abc123def456', 'phone')).toBe('123456');
    });

    it('should sanitize pincode inputs', () => {
      expect(sanitizeInput('400-001', 'pincode')).toBe('400001');
      expect(sanitizeInput('abc123def', 'pincode')).toBe('123');
    });
  });

  describe('formatPhoneNumber', () => {
    it('should format phone numbers correctly', () => {
      expect(formatPhoneNumber('9876543210')).toBe('987 654 3210');
      expect(formatPhoneNumber('987')).toBe('987');
      expect(formatPhoneNumber('987654')).toBe('987 654');
    });
  });

  describe('formatPincode', () => {
    it('should format pincode correctly', () => {
      expect(formatPincode('400001')).toBe('400001');
      expect(formatPincode('4000012')).toBe('400001');
      expect(formatPincode('abc123def')).toBe('123');
    });
  });

  describe('isFormReadyForSubmission', () => {
    it('should return true for complete form data', () => {
      const formData = {
        firstName: 'John',
        lastName: 'Doe',
        emailId: 'john@example.com',
        mobileNumber: '9876543210',
        state: 'Maharashtra',
        district: 'Mumbai',
        city: 'Mumbai',
        pincode: '400001',
        schoolId: '1',
        schoolName: '',
        promocode: '',
      };

      expect(isFormReadyForSubmission(formData)).toBe(true);
    });

    it('should return false for incomplete form data', () => {
      const formData = {
        firstName: 'John',
        lastName: '',
        emailId: 'john@example.com',
        mobileNumber: '9876543210',
        state: 'Maharashtra',
        district: 'Mumbai',
        city: 'Mumbai',
        pincode: '400001',
        schoolId: '',
        schoolName: '',
        promocode: '',
      };

      expect(isFormReadyForSubmission(formData)).toBe(false);
    });
  });
});
