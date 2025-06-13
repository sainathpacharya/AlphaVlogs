import React, {useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  View,
} from 'react-native';
import {
  VStack,
  Input,
  InputField,
  Button,
  Text,
  Box,
  useToast,
  StatusBar,
  Image,
  Icon,
} from '../../components';
import colors from '../../utils/colors';

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

const {width} = Dimensions.get('window');

const RegistrationScreen = ({navigation}: any) => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    state: '',
    district: '',
    city: '',
    pincode: '',
  });

  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const toast = useToast();

  const validate = () => {
    const newErrors: Partial<typeof form> = {};
    let valid = true;

    if (!form.firstName.trim()) {
      newErrors.firstName = 'First Name is required';
      valid = false;
    }
    if (!form.lastName.trim()) {
      newErrors.lastName = 'Last Name is required';
      valid = false;
    }
    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      newErrors.email = 'Invalid email';
      valid = false;
    }
    if (!form.mobile.trim()) {
      newErrors.mobile = 'Mobile Number is required';
      valid = false;
    } else if (!/^\d{10}$/.test(form.mobile.trim())) {
      newErrors.mobile = 'Invalid 10-digit mobile number';
      valid = false;
    }
    if (!form.state.trim()) {
      newErrors.state = 'State is required';
      valid = false;
    }
    if (!form.district.trim()) {
      newErrors.district = 'District is required';
      valid = false;
    }
    if (!form.city.trim()) {
      newErrors.city = 'City is required';
      valid = false;
    }
    if (!form.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
      valid = false;
    } else if (!/^\d{6}$/.test(form.pincode.trim())) {
      newErrors.pincode = 'Invalid 6-digit pincode';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleRegister = () => {
    if (validate()) {
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
    }
  };

  const onChange = (field: keyof typeof form, value: string) => {
    setForm({...form, [field]: value});
    if (errors[field]) setErrors({...errors, [field]: ''});
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{flex: 1, backgroundColor: colors.primaryBackground}}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={{flexGrow: 1}}>
        <VStack flex={1} justifyContent="center" px="$5" py="$10" space="lg">
          {/* Logo */}
          <MotiImage
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
              placeholder: 'First Name',
              icon: User,
            },
            {
              key: 'lastName',
              placeholder: 'Last Name',
              icon: User,
            },
            {
              key: 'email',
              placeholder: 'Email ID',
              icon: Mail,
            },
            {
              key: 'mobile',
              placeholder: 'Mobile Number',
              icon: Phone,
            },
            {
              key: 'state',
              placeholder: 'State',
              icon: MapPin,
            },
            {
              key: 'district',
              placeholder: 'District',
              icon: Building2,
            },
            {
              key: 'city',
              placeholder: 'City',
              icon: Landmark,
            },
            {
              key: 'pincode',
              placeholder: 'Pincode',
              icon: Hash,
            },
          ].map(({key, placeholder, icon: IconComponent}) => (
            <Box key={key}>
              <View style={{position: 'relative'}}>
                {/* Icon container absolutely positioned */}
                <Box
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
                  pl="$12"
                  variant="outline"
                  borderColor={colors.accentAction}
                  isInvalid={!!errors[key as keyof typeof form]}>
                  <InputField
                    placeholder={placeholder}
                    placeholderTextColor={colors.mutedText}
                    value={form[key as keyof typeof form]}
                    keyboardType={
                      key === 'mobile' || key === 'pincode'
                        ? 'number-pad'
                        : 'default'
                    }
                    maxLength={
                      key === 'mobile' ? 10 : key === 'pincode' ? 6 : undefined
                    }
                    onChangeText={val =>
                      onChange(key as keyof typeof form, val)
                    }
                  />
                </Input>
              </View>
              {errors[key as keyof typeof form] && (
                <Text color={colors.danger} mt="$1">
                  {errors[key as keyof typeof form]}
                </Text>
              )}
            </Box>
          ))}

          <Button
            onPress={handleRegister}
            isDisabled={Object.values(form).some(v => !v.trim())}
            w="$full"
            borderRadius="$md"
            mt="$6"
            bg={colors.accentAction}>
            <Text color={colors.primaryBackground} fontWeight="$bold">
              Register
            </Text>
          </Button>
        </VStack>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegistrationScreen;
