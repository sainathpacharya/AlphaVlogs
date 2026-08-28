import React, {useState, useEffect, useCallback, useRef} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  Linking,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  VStack,
  HStack,
  Pressable,
  Input,
  InputField,
  Button,
  Text,
  Box,
  Icon,
  Select,
} from '../../components';
import {useToast} from '../../components/toast';
import {useThemeColors} from '../../utils/colors';
import {useIsMounted, useRegisterMutation} from '@/hooks';
import {devLog} from '@/utils/dev-log';
import {schoolsService, School} from '../../services/schools-service';
import {
  validateFieldRealtime as validateFieldRealtimeUtil,
  sanitizeInput,
  formatPhoneNumber,
  formatPincode,
  REGISTRATION_VALIDATION_RULES,
  STUDENT_CLASS_OPTIONS,
} from '../../utils/validation';
import { MANUAL_SCHOOL_ID } from '@/utils/register-payload';
import {LEGAL_URLS} from '@/constants/legal';

const MANUAL_SCHOOL_OPTION: School = {
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
};

import {
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  Landmark,
  Hash,
  GraduationCap,
} from 'lucide-react-native';
import {StatusBar} from '@/components/status-bar';

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
    studentClass: '',
    section: '',
  });

  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const [touchedFields, setTouchedFields] = useState<Set<keyof typeof form>>(
    new Set(),
  );
  const registerMutation = useRegisterMutation();
  const isLoading = registerMutation.isPending;
  const [showCustomSchool, setShowCustomSchool] = useState(false);
  const [schools, setSchools] = useState<School[]>([]);
  const [schoolsLoading, setSchoolsLoading] = useState(true);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Refs for input fields
  const inputRefs = useRef<Record<string, any>>({});
  const scrollViewRef = useRef<ScrollView>(null);
  const focusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMounted = useIsMounted();
  const toast = useToast();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    return () => {
      if (focusTimeoutRef.current) {
        clearTimeout(focusTimeoutRef.current);
      }
    };
  }, []);

  // Fetch schools on component mount
  useEffect(() => {
    let cancelled = false;

    const fetchSchools = async () => {
      try {
        if (!cancelled) {
          setSchoolsLoading(true);
        }
        const response = await schoolsService.getSchools();

        if (response.success && response.data) {
          // Check if "Other" option already exists in the API response
          const hasOtherOption = response.data.schools.some(
            school => school.id === 9999,
          );

          if (hasOtherOption) {
            if (!cancelled) {
              setSchools(response.data.schools);
            }
          } else {
            // Add "Other" option if it doesn't exist
            const schoolsWithOther = [
              ...response.data.schools,
              MANUAL_SCHOOL_OPTION,
            ];
            if (!cancelled) {
              setSchools(schoolsWithOther);
            }
          }
        } else {
          devLog('Registration: schools API unavailable', response.message);
          if (!cancelled) {
            setSchools([MANUAL_SCHOOL_OPTION]);
            toast.show({
              placement: 'top',
              render: () => (
                <Text color={colors.danger}>
                  Unable to load schools. You can enter your school manually.
                </Text>
              ),
            });
          }
        }
      } catch (error) {
        devLog('Registration: error fetching schools', error);
        if (!cancelled) {
          setSchools([MANUAL_SCHOOL_OPTION]);
          toast.show({
            placement: 'top',
            render: () => (
              <Text color={colors.danger}>
                Unable to load schools. You can enter your school manually.
              </Text>
            ),
          });
        }
      } finally {
        if (!cancelled) {
          setSchoolsLoading(false);
        }
      }
    };

    fetchSchools();
    return () => {
      cancelled = true;
    };
  }, [colors.danger, toast]);

  // Real-time validation for individual fields
  const validateFieldRealtime = useCallback(
    (fieldName: keyof typeof form, value: string) => {
      if (!touchedFields.has(fieldName)) {return null;}

      const rules =
        REGISTRATION_VALIDATION_RULES[
          fieldName as keyof typeof REGISTRATION_VALIDATION_RULES
        ];
      if (!rules) {return null;}

      return validateFieldRealtimeUtil(fieldName, value, rules);
    },
    [touchedFields],
  );

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
      'studentClass',
      'section',
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

      if (field === 'section' && !fieldValue?.trim()) {
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
            studentClass: 'Class',
            section: 'Section',
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

  const handleRegister = async () => {
    if (!acceptedTerms) {
      toast.show({
        placement: 'top',
        render: () => (
          <Text color={colors.danger}>
            Please accept the Terms of Service and Privacy Policy to continue.
          </Text>
        ),
      });
      return;
    }

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
        focusTimeoutRef.current = setTimeout(() => {
          if (isMounted.current) {
            inputRefs.current[firstErrorField]?.focus();
          }
        }, 100);
      }
      return;
    }

    // If form is valid, proceed with submission
    if (isFormValid) {
      try {
        const response = await registerMutation.mutateAsync(form);

        if (!isMounted.current) {
          return;
        }

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
      case 'section':
        sanitizedValue = sanitizeInput(value, 'general', false).toUpperCase();
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
    if (schoolId === MANUAL_SCHOOL_ID) {
      // "Other (Enter manually)" selected
      setShowCustomSchool(true);
      setForm({
        ...form,
        schoolId: MANUAL_SCHOOL_ID, // Keep the selected value so dropdown shows "Other (Enter manually)"
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
      keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
      style={{flex: 1, backgroundColor: colors.primaryBackground}}>
      <StatusBar translucent={false} />
      <HStack
        testID="registration-app-bar"
        alignItems="center"
        justifyContent="space-between"
        px="$4"
        pb="$3"
        style={{
          backgroundColor: colors.primaryBackground,
          paddingTop: insets.top + 4,
          borderBottomWidth: 1,
          borderBottomColor: colors.border || 'rgba(0,0,0,0.08)',
        }}>
        <Pressable
          testID="registration-back-button"
          onPress={() => navigation.goBack()}
          p="$2"
          borderRadius="$md"
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={{backgroundColor: colors.border || 'rgba(0,0,0,0.08)'}}>
          <Text style={{color: colors.primaryText, fontSize: 18}}>←</Text>
        </Pressable>
        <Text
          testID="registration-title"
          style={{
            color: colors.primaryText,
            fontSize: 18,
            fontWeight: '700',
            flex: 1,
            textAlign: 'center',
          }}
          numberOfLines={1}>
          Registration
        </Text>
        <Box w="$10" />
      </HStack>
      <ScrollView
        ref={scrollViewRef}
        testID="registration-scroll-view"
        style={{flex: 1}}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{
          paddingBottom: insets.bottom + 140,
        }}
        showsVerticalScrollIndicator={false}>
        <VStack
          testID="registration-container"
          px="$5"
          py="$4"
          space="lg">
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
              key: 'studentClass',
              label: 'Class *',
              placeholder: 'Select your class',
              icon: GraduationCap,
              isSelect: true,
              selectOptions: STUDENT_CLASS_OPTIONS.map(value => ({
                value,
                label: value === 'KG' ? 'KG' : `Class ${value}`,
              })),
            },
            {
              key: 'section',
              label: 'Section',
              placeholder: 'Enter your section (optional)',
              icon: Hash,
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
          ].map(({key, placeholder, icon: IconComponent, isSelect, selectOptions}) => (
            <React.Fragment key={key}>
              <Box mb={'$2'} testID={`registration-${key}-container`}>
                {isSelect ? (
                  <Select
                    options={
                      selectOptions ??
                      schools.map(school => ({
                        value: school.id.toString(),
                        label: school.name,
                      }))
                    }
                    value={form[key as keyof typeof form]}
                    placeholder={placeholder}
                    onValueChange={value => {
                      if (key === 'schoolId') {
                        handleSchoolSelect(value);
                        return;
                      }
                      onChange(key as keyof typeof form, value);
                    }}
                    error={errors[key as keyof typeof form]}
                    disabled={key === 'schoolId' ? schoolsLoading : false}
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
                            ? 13
                            : key === 'pincode'
                              ? 6
                              : key === 'section'
                                ? 2
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
                          key === 'city' ||
                          key === 'section'
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

          <HStack testID="registration-terms-row" alignItems="flex-start" space="sm" mt="$4">
            <Pressable
              testID="registration-terms-checkbox"
              onPress={() => setAcceptedTerms(current => !current)}
              accessibilityRole="checkbox"
              accessibilityState={{checked: acceptedTerms}}>
              <Box
                w={22}
                h={22}
                borderRadius={4}
                borderWidth={2}
                borderColor={colors.accentAction}
                alignItems="center"
                justifyContent="center"
                bg={acceptedTerms ? colors.accentAction : 'transparent'}>
                {acceptedTerms ? (
                  <Text color={colors.white} fontSize={14} fontWeight="$bold">
                    ✓
                  </Text>
                ) : null}
              </Box>
            </Pressable>
            <Text flex={1} color={colors.secondaryText} fontSize={13} lineHeight={20}>
              I agree to the{' '}
              <Text
                color={colors.accentAction}
                fontWeight="$bold"
                onPress={() => void Linking.openURL(LEGAL_URLS.termsOfService)}>
                Terms of Service
              </Text>{' '}
              and{' '}
              <Text
                color={colors.accentAction}
                fontWeight="$bold"
                onPress={() => void Linking.openURL(LEGAL_URLS.privacyPolicy)}>
                Privacy Policy
              </Text>
              .
            </Text>
          </HStack>

          <Button
            testID="registration-submit-button"
            onPress={handleRegister}
            isDisabled={isLoading || !acceptedTerms}
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
