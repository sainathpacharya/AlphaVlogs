import React, {useState, useEffect, useCallback, useRef} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  View,
  TextInput,
} from 'react-native';
import {
  VStack,
  Input,
  InputField,
  Button,
  Text,
  Box,
  Image,
  Icon,
  Select,
} from '../../components';
import {useToast} from '../../components/toast';
import {useThemeColors} from '../../utils/colors';
import {authService} from '../../services/auth-service';
import {schoolsService, School} from '../../services/schools-service';
import {
  validateRegistrationForm,
  validateFieldRealtime as validateFieldRealtimeUtil,
  validateSchoolSelection,
  sanitizeInput,
  formatPhoneNumber,
  formatPincode,
  isFormReadyForSubmission,
  REGISTRATION_VALIDATION_RULES,
  VALIDATION_MESSAGES,
} from '../../utils/validation';

import {
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  Landmark,
  Hash,
} from 'lucide-react-native';
import {MotiImage} from 'moti';
import {Easing} from 'react-native-reanimated';
import appLogo from '../../assets/png/appLogo.png';
import {StatusBar} from '@/components/status-bar';

const {width} = Dimensions.get('window');

const RegistrationScreen = ({navigation}: any) => {
  const colors = useThemeColors();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    emailId: '',
    mobileNumber: '',
    state: '',
    district: '',
    city: '',
    pincode: '',
    promocode: '',
    schoolId: '',
    schoolName: '',
  });

  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const [touchedFields, setTouchedFields] = useState<Set<keyof typeof form>>(
    new Set(),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [showCustomSchool, setShowCustomSchool] = useState(false);
  const [schools, setSchools] = useState<School[]>([]);
  const [schoolsLoading, setSchoolsLoading] = useState(true);

  // Refs for input fields
  const inputRefs = useRef<Record<string, any>>({});
  const scrollViewRef = useRef<ScrollView>(null);
  const toast = useToast();

  // Fetch schools on component mount
  useEffect(() => {
    const fetchSchools = async () => {
      try {
        setSchoolsLoading(true);
        const response = await schoolsService.getSchools();

        if (response.success && response.data) {
          // Check if "Other" option already exists in the API response
          const hasOtherOption = response.data.schools.some(
            school => school.id === 9999,
          );

          if (hasOtherOption) {
            // Use schools as-is if "Other" option already exists
            setSchools(response.data.schools);
          } else {
            // Add "Other" option if it doesn't exist
            const schoolsWithOther = [
              ...response.data.schools,
              {
                id: 9999,
                createdOn: '',
                schoolCode: 'SCH_OTHER',
                name: 'Other (Enter manually)',
                establishedYear: 0,
                schoolType: 'OTHER' as const,
                boardOfAffiliation: 'N/A',
                mediumOfInstruction: 'N/A',
                principalName: 'N/A',
                contactNumber: 'N/A',
                email: 'other@school.com',
                address: 'N/A',
                location: 'N/A',
                pincode: '000000',
                updatedAt: '',
              },
            ];
            setSchools(schoolsWithOther);
          }
        } else {
          console.error('Failed to fetch schools:', response.message);
          // Fallback to default schools
          setSchools([
            {
              id: 1,
              createdOn: '',
              schoolCode: 'SCH001',
              name: 'Delhi Public School',
              establishedYear: 1995,
              schoolType: 'PRIVATE' as const,
              boardOfAffiliation: 'CBSE',
              mediumOfInstruction: 'English',
              principalName: 'Dr. Ramesh Kumar',
              contactNumber: '080-26543210',
              email: 'info@dps.edu.in',
              address: 'Delhi, India',
              location: 'Delhi, India',
              pincode: '110001',
              updatedAt: '',
            },
            {
              id: 2,
              createdOn: '',
              schoolCode: 'SCH002',
              name: 'Kendriya Vidyalaya',
              establishedYear: 1965,
              schoolType: 'GOVERNMENT_AIDED' as const,
              boardOfAffiliation: 'CBSE',
              mediumOfInstruction: 'Hindi, English',
              principalName: 'Mr. Rajeev Sharma',
              contactNumber: '011-23745678',
              email: 'principal@kendriya.gov.in',
              address: 'New Delhi, India',
              location: 'New Delhi, India',
              pincode: '110001',
              updatedAt: '',
            },
            {
              id: 3,
              createdOn: '',
              schoolCode: 'SCH003',
              name: "St. Mary's School",
              establishedYear: 1980,
              schoolType: 'PRIVATE' as const,
              boardOfAffiliation: 'ICSE',
              mediumOfInstruction: 'English',
              principalName: 'Mrs. Anjali Sen',
              contactNumber: '033-23351234',
              email: 'contact@stmarys.edu.in',
              address: 'Kolkata, West Bengal',
              location: 'Kolkata, West Bengal',
              pincode: '700091',
              updatedAt: '',
            },
            {
              id: 4,
              createdOn: '',
              schoolCode: 'SCH004',
              name: 'Modern School',
              establishedYear: 1972,
              schoolType: 'PRIVATE' as const,
              boardOfAffiliation: 'CBSE',
              mediumOfInstruction: 'English',
              principalName: 'Dr. Meera Joshi',
              contactNumber: '020-25512345',
              email: 'contact@modernschool.edu.in',
              address: 'Mumbai, Maharashtra',
              location: 'Mumbai, Maharashtra',
              pincode: '400001',
              updatedAt: '',
            },
            {
              id: 5,
              createdOn: '',
              schoolCode: 'SCH005',
              name: 'Ryan International School',
              establishedYear: 1976,
              schoolType: 'PRIVATE' as const,
              boardOfAffiliation: 'CBSE',
              mediumOfInstruction: 'English',
              principalName: 'Mrs. Grace Pinto',
              contactNumber: '022-25512345',
              email: 'contact@ryaninternational.edu.in',
              address: 'Mumbai, Maharashtra',
              location: 'Mumbai, Maharashtra',
              pincode: '400001',
              updatedAt: '',
            },
            {
              id: 9999,
              createdOn: '',
              schoolCode: 'SCH_OTHER',
              name: 'Other (Enter manually)',
              establishedYear: 0,
              schoolType: 'OTHER' as const,
              boardOfAffiliation: 'N/A',
              mediumOfInstruction: 'N/A',
              principalName: 'N/A',
              contactNumber: 'N/A',
              email: 'other@school.com',
              address: 'N/A',
              location: 'N/A',
              pincode: '000000',
              updatedAt: '',
            },
          ]);
        }
      } catch (error) {
        console.error('Error fetching schools:', error);
        // Fallback to default schools on error
        setSchools([
          {
            id: 1,
            createdOn: '',
            schoolCode: 'SCH001',
            name: 'Delhi Public School',
            establishedYear: 1995,
            schoolType: 'PRIVATE' as const,
            boardOfAffiliation: 'CBSE',
            mediumOfInstruction: 'English',
            principalName: 'Dr. Ramesh Kumar',
            contactNumber: '080-26543210',
            email: 'info@dps.edu.in',
            address: 'Delhi, India',
            location: 'Delhi, India',
            pincode: '110001',
            updatedAt: '',
          },
          {
            id: 9999,
            createdOn: '',
            schoolCode: 'SCH_OTHER',
            name: 'Other (Enter manually)',
            establishedYear: 0,
            schoolType: 'OTHER' as const,
            boardOfAffiliation: 'N/A',
            mediumOfInstruction: 'N/A',
            principalName: 'N/A',
            contactNumber: 'N/A',
            email: 'other@school.com',
            address: 'N/A',
            location: 'N/A',
            pincode: '000000',
            updatedAt: '',
          },
        ]);
      } finally {
        setSchoolsLoading(false);
      }
    };

    fetchSchools();
  }, []);

  // Real-time validation for individual fields
  const validateFieldRealtime = useCallback(
    (fieldName: keyof typeof form, value: string) => {
      if (!touchedFields.has(fieldName)) return null;

      const rules =
        REGISTRATION_VALIDATION_RULES[
          fieldName as keyof typeof REGISTRATION_VALIDATION_RULES
        ];
      if (!rules) return null;

      return validateFieldRealtimeUtil(fieldName, value, rules);
    },
    [touchedFields],
  );

  // Comprehensive form validation
  const validateForm = useCallback(() => {
    const validationResult = validateRegistrationForm(form);
    setErrors(validationResult.errors);
    return validationResult.isValid;
  }, [form]);

  // Check if form is ready for submission
  const isFormReady = useCallback(() => {
    return isFormReadyForSubmission(form);
  }, [form]);

  // Validate form and show only the first error
  const validateFormProgressive = useCallback(() => {
    // Clear all existing errors first
    setErrors({});

    // Define the order of fields to validate
    const fieldOrder = [
      'firstName',
      'lastName',
      'emailId',
      'mobileNumber',
      'schoolId',
      'schoolName',
      'state',
      'district',
      'city',
      'pincode',
    ];

    // Check each field in order and return first error
    for (const field of fieldOrder) {
      const fieldValue = form[field as keyof typeof form];

      // Skip school validation if not in custom school mode
      if (
        (field === 'schoolId' || field === 'schoolName') &&
        !showCustomSchool
      ) {
        continue;
      }

      // Check if field is required and empty
      if (!fieldValue?.trim()) {
        let errorMessage = '';
        if (field === 'schoolId' || field === 'schoolName') {
          errorMessage = 'Please select a school or enter school name';
        } else {
          const fieldLabels: Record<string, string> = {
            firstName: 'First Name',
            lastName: 'Last Name',
            emailId: 'Email',
            mobileNumber: 'Mobile Number',
            state: 'State',
            district: 'District',
            city: 'City',
            pincode: 'Pincode',
          };
          errorMessage = `${fieldLabels[field] || field} is required`;
        }

        setErrors({[field]: errorMessage});
        return false;
      }

      // Validate field content if not empty
      const fieldError = validateFieldRealtime(
        field as keyof typeof form,
        fieldValue,
      );
      if (fieldError) {
        setErrors({[field]: fieldError});
        return false;
      }
    }

    return true;
  }, [form, showCustomSchool, validateFieldRealtime]);

  // Get missing required fields for user feedback
  const getMissingFields = useCallback(() => {
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
    const missingFields = requiredFields.filter(
      field => !form[field as keyof typeof form]?.trim(),
    );

    if (!form.schoolId && !form.schoolName?.trim()) {
      missingFields.push('school');
    }

    return missingFields;
  }, [form]);

  const handleRegister = async () => {
    // Mark all fields as touched for validation
    const allFields = Object.keys(form) as Array<keyof typeof form>;
    setTouchedFields(new Set(allFields));

    // Validate form progressively (show only first error)
    const isFormValid = validateFormProgressive();

    // If form is not valid, focus on first error field
    if (!isFormValid) {
      const firstErrorField = Object.keys(errors).find(
        field => errors[field as keyof typeof form],
      );
      if (
        firstErrorField &&
        firstErrorField !== 'schoolId' &&
        firstErrorField !== 'schoolName'
      ) {
        // Scroll to the field first, then focus
        setTimeout(() => {
          inputRefs.current[firstErrorField]?.focus();
        }, 100);
      }
      return;
    }

    // If form is valid, proceed with submission
    if (isFormValid) {
      setIsLoading(true);
      try {
        const response = await authService.register(form);

        if (response.success) {
          toast.show({
            placement: 'top',
            render: () => (
              <Box bg={colors.success} p="$4" borderRadius="$md">
                <Text color={colors.white} fontWeight="$bold">
                  ✅ Registration Successful!
                </Text>
              </Box>
            ),
          });
          // Navigate to login screen
          navigation.navigate('Login');
        } else {
          toast.show({
            placement: 'top',
            render: () => (
              <Box bg={colors.danger} p="$4" borderRadius="$md">
                <Text color={colors.white} fontWeight="$bold">
                  ❌ {response.error || 'Registration failed'}
                </Text>
              </Box>
            ),
          });
        }
      } catch (error) {
        console.error('Registration error:', error);
        toast.show({
          placement: 'top',
          render: () => (
            <Box bg={colors.danger} p="$4" borderRadius="$md">
              <Text color={colors.white} fontWeight="$bold">
                ❌ Registration failed. Please try again.
              </Text>
            </Box>
          ),
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const onChange = (field: keyof typeof form, value: string) => {
    // Sanitize input based on field type
    // Don't trim during typing to allow spaces
    let sanitizedValue = value;
    switch (field) {
      case 'firstName':
      case 'lastName':
      case 'state':
      case 'district':
      case 'city':
        sanitizedValue = sanitizeInput(value, 'name', false); // Don't trim during typing
        break;
      case 'emailId':
        sanitizedValue = sanitizeInput(value, 'email', false);
        break;
      case 'mobileNumber':
        sanitizedValue = sanitizeInput(value, 'phone', false);
        break;
      case 'pincode':
        sanitizedValue = sanitizeInput(value, 'pincode', false);
        break;
      case 'schoolName':
        sanitizedValue = sanitizeInput(value, 'general', false);
        break;
      default:
        sanitizedValue = sanitizeInput(value, 'general', false);
    }

    // Update form state
    setForm({...form, [field]: sanitizedValue});

    // Mark field as touched
    setTouchedFields(prev => new Set([...prev, field]));

    // Clear errors for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[field];
        return newErrors;
      });
    }

    // Real-time validation for current field only
    // For phone numbers, only validate when complete (10 digits)
    if (field === 'mobileNumber') {
      const digits = sanitizedValue.replace(/\D/g, '');
      // Only validate if we have exactly 10 digits
      if (digits.length === 10) {
        const realtimeError = validateFieldRealtime(field, sanitizedValue);
        if (realtimeError) {
          setErrors({[field]: realtimeError});
        }
      }
    } else {
      // For other fields, validate immediately
      const realtimeError = validateFieldRealtime(field, sanitizedValue);
      if (realtimeError) {
        setErrors({[field]: realtimeError});
      }
    }
  };

  const handleSchoolSelect = (schoolId: string) => {
    if (schoolId === '9999') {
      // "Other (Enter manually)" selected
      setShowCustomSchool(true);
      setForm({
        ...form,
        schoolId: '9999', // Keep the selected value so dropdown shows "Other (Enter manually)"
        schoolName: '', // Clear school name so user can enter manually
      });
    } else {
      // Regular school selected
      setShowCustomSchool(false);
      const selectedSchool = schools.find(s => s.id.toString() === schoolId);
      setForm({
        ...form,
        schoolId: schoolId,
        schoolName: selectedSchool?.name || '',
      });
    }

    // Clear all errors (progressive validation)
    setErrors({});

    // Mark school fields as touched
    setTouchedFields(prev => new Set([...prev, 'schoolId', 'schoolName']));
  };

  // Format input values for display
  const getFormattedValue = (
    field: keyof typeof form,
    value: string,
  ): string => {
    switch (field) {
      case 'mobileNumber':
        return formatPhoneNumber(value);
      case 'pincode':
        return formatPincode(value);
      default:
        return value;
    }
  };

  return (
    <KeyboardAvoidingView
      testID="registration-screen"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{flex: 1, backgroundColor: colors.primaryBackground}}>
      <StatusBar
        backgroundColor={colors.primaryBackground}
        barStyle={
          colors.primaryBackground === '#FFFFFF'
            ? 'dark-content'
            : 'light-content'
        }
      />
      <ScrollView
        ref={scrollViewRef}
        testID="registration-scroll-view"
        contentContainerStyle={{flexGrow: 1, paddingBottom: 100}}
        showsVerticalScrollIndicator={false}
        style={{overflow: 'visible'}}>
        <VStack
          testID="registration-container"
          flex={1}
          justifyContent="center"
          px="$5"
          py="$10"
          space="lg"
          style={{overflow: 'visible'}}>
          {/* Logo */}
          <MotiImage
            testID="registration-logo"
            source={appLogo}
            style={{
              width: width,
              height: width * 0.2,
              marginBottom: 30,
            }}
            from={{translateY: 0}}
            animate={{translateY: -10}}
            transition={{
              type: 'timing',
              duration: 2000,
              easing: Easing.inOut(Easing.ease),
              loop: true,
              repeatReverse: true,
            }}
          />

          <Text
            testID="registration-title"
            fontSize="$2xl"
            fontWeight="$bold"
            color={colors.primaryText}
            mb="$4"
            textAlign="center">
            Register
          </Text>

          {/* Inputs with custom left icon container */}
          {[
            {
              key: 'firstName',
              label: 'First Name *',
              placeholder: 'Enter your first name',
              icon: User,
            },
            {
              key: 'lastName',
              label: 'Last Name *',
              placeholder: 'Enter your last name',
              icon: User,
            },
            {
              key: 'emailId',
              label: 'Email ID *',
              placeholder: 'Enter your email address',
              icon: Mail,
            },
            {
              key: 'mobileNumber',
              label: 'Mobile Number *',
              placeholder: 'Enter your mobile number',
              icon: Phone,
            },
            {
              key: 'schoolId',
              label: 'School *',
              placeholder: schoolsLoading
                ? 'Loading schools...'
                : 'Select your school',
              icon: Building2,
              isSelect: true,
            },
            {
              key: 'state',
              label: 'State *',
              placeholder: 'Enter your state',
              icon: MapPin,
            },
            {
              key: 'district',
              label: 'District *',
              placeholder: 'Enter your district',
              icon: Building2,
            },
            {
              key: 'city',
              label: 'City *',
              placeholder: 'Enter your city',
              icon: Landmark,
            },
            {
              key: 'pincode',
              label: 'Pincode *',
              placeholder: 'Enter your pincode',
              icon: Hash,
            },
            {
              key: 'promocode',
              label: 'Promo Code',
              placeholder: 'Enter promo code (optional)',
              icon: Hash,
            },
          ].map(({key, label, placeholder, icon: IconComponent, isSelect}) => (
            <React.Fragment key={key}>
              <Box mb={'$2'} testID={`registration-${key}-container`}>
                {isSelect ? (
                  // School Selection Dropdown
                  <Select
                    options={schools.map(school => ({
                      value: school.id.toString(),
                      label: school.name,
                    }))}
                    value={form.schoolId}
                    placeholder={placeholder}
                    onValueChange={value => handleSchoolSelect(value)}
                    error={errors.schoolId}
                    disabled={schoolsLoading}
                    icon={IconComponent}
                  />
                ) : (
                  // Regular Input Field
                  <View style={{position: 'relative'}}>
                    {/* Icon container absolutely positioned */}
                    <Box
                      testID={`registration-${key}-icon`}
                      position="absolute"
                      left={12}
                      top="50%"
                      style={{transform: [{translateY: -12}]}}>
                      <Icon
                        as={IconComponent}
                        size="md"
                        color={colors.accentAction}
                      />
                    </Box>
                    <Input
                      testID={`registration-${key}-input`}
                      pl="$12"
                      variant="outline"
                      borderColor={colors.accentAction}
                      isInvalid={!!errors[key as keyof typeof form]}>
                      <InputField
                        ref={ref => {
                          inputRefs.current[key] = ref;
                        }}
                        testID={`registration-${key}-field`}
                        placeholder={placeholder}
                        placeholderTextColor={colors.mutedText}
                        color={colors.inputText}
                        value={getFormattedValue(
                          key as keyof typeof form,
                          form[key as keyof typeof form],
                        )}
                        keyboardType={
                          key === 'mobileNumber' || key === 'pincode'
                            ? 'number-pad'
                            : key === 'emailId'
                              ? 'email-address'
                              : 'default'
                        }
                        maxLength={
                          key === 'mobileNumber'
                            ? 13 // 10 digits + 2 spaces (XXX XXX XXXX format)
                            : key === 'pincode'
                              ? 6
                              : key === 'firstName' || key === 'lastName'
                                ? 50
                                : key === 'emailId'
                                  ? 100
                                  : undefined
                        }
                        autoCapitalize={
                          key === 'firstName' ||
                          key === 'lastName' ||
                          key === 'state' ||
                          key === 'district' ||
                          key === 'city'
                            ? 'words'
                            : key === 'emailId'
                              ? 'none'
                              : 'sentences'
                        }
                        autoCorrect={key === 'emailId' ? false : true}
                        onChangeText={val =>
                          onChange(key as keyof typeof form, val)
                        }
                        onBlur={() => {
                          // Validate on blur to catch errors when user leaves the field
                          const fieldValue = form[key as keyof typeof form];
                          if (fieldValue) {
                            const error = validateFieldRealtime(
                              key as keyof typeof form,
                              fieldValue,
                            );
                            if (error) {
                              setErrors({[key]: error});
                            }
                          }
                        }}
                      />
                    </Input>
                  </View>
                )}
                {errors[key as keyof typeof form] && (
                  <Text
                    testID={`registration-${key}-error`}
                    color={colors.danger}
                    mt="$1">
                    {errors[key as keyof typeof form]}
                  </Text>
                )}
              </Box>

              {/* Custom School Name Input - Show right after school dropdown */}
              {key === 'schoolId' && showCustomSchool && (
                <Box
                  testID="registration-custom-school-container"
                  mt="$2"
                  mb="$2">
                  <View style={{position: 'relative'}}>
                    <Box
                      testID="registration-custom-school-icon"
                      position="absolute"
                      left={12}
                      top="50%"
                      style={{transform: [{translateY: -12}]}}>
                      <Icon
                        as={Building2}
                        size="md"
                        color={colors.accentAction}
                      />
                    </Box>
                    <Input
                      testID="registration-custom-school-input"
                      pl="$12"
                      variant="outline"
                      borderColor={colors.accentAction}
                      isInvalid={!!errors.schoolName}>
                      <InputField
                        ref={ref => {
                          inputRefs.current.schoolName = ref;
                        }}
                        testID="registration-custom-school-field"
                        placeholder="Enter your school name"
                        value={form.schoolName}
                        onChangeText={value => onChange('schoolName', value)}
                        autoCapitalize="words"
                      />
                    </Input>
                  </View>
                  {errors.schoolName && (
                    <Text
                      testID="registration-custom-school-error"
                      color={colors.danger}
                      mt="$1">
                      {errors.schoolName}
                    </Text>
                  )}
                </Box>
              )}
            </React.Fragment>
          ))}

          <Button
            testID="registration-submit-button"
            onPress={handleRegister}
            isDisabled={isLoading}
            w="$full"
            borderRadius="$md"
            mt="$8"
            mb="$4"
            bg={colors.accentAction}
            opacity={isLoading ? 0.6 : 1}>
            <Text
              testID="registration-submit-text"
              color={colors.white}
              fontWeight="$bold">
              {isLoading ? 'Registering...' : 'Register'}
            </Text>
          </Button>
        </VStack>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegistrationScreen;
