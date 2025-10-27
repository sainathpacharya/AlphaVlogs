import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import OTPTextInput from 'react-native-otp-textinput';
import { useOTPAutoRead } from '@/hooks/useOTPAutoRead';

export interface OTPInputProps {
  length?: number;
  value?: string;
  onChange?: (otp: string) => void;
  onComplete?: (otp: string) => void;
  enableAutoRead?: boolean;
  autoReadTimeout?: number;
  placeholder?: string;
  tintColor?: string;
  offTintColor?: string;
  containerStyle?: any;
  textInputStyle?: any;
  showInstructions?: boolean;
  disabled?: boolean;
}

const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  value = '',
  onChange,
  onComplete,
  enableAutoRead = true,
  autoReadTimeout = 60000,
  placeholder = '0',
  tintColor = '#007AFF',
  offTintColor = '#CCCCCC',
  containerStyle,
  textInputStyle,
  showInstructions = true,
  disabled = false,
}) => {
  const [otp, setOtp] = useState(value);
  const otpRef = useRef<OTPTextInput>(null);

  // Auto-read OTP functionality
  const {
    isListening,
    isSupported,
    startListening,
    stopListening,
    platformInstructions,
  } = useOTPAutoRead({
    enableAutoRead,
    timeout: autoReadTimeout,
    onOTPReceived: (receivedOTP) => {
      console.log('Auto-read OTP received:', receivedOTP);
      setOtp(receivedOTP);
      onChange?.(receivedOTP);
      
      if (receivedOTP.length === length) {
        onComplete?.(receivedOTP);
      }
    },
    onError: (error) => {
      console.warn('Auto-read error:', error);
      // Don't show alert for permission denied, just log it
      if (!error.includes('permission')) {
        Alert.alert('Auto-read Error', error);
      }
    },
  });

  // Start listening when component mounts
  useEffect(() => {
    if (enableAutoRead && isSupported) {
      startListening();
    }

    return () => {
      stopListening();
    };
  }, [enableAutoRead, isSupported, startListening, stopListening]);

  // Update OTP when value prop changes
  useEffect(() => {
    if (value !== otp) {
      setOtp(value);
    }
  }, [value]);

  const handleOTPChange = (text: string) => {
    setOtp(text);
    onChange?.(text);
    
    if (text.length === length) {
      onComplete?.(text);
    }
  };

  const handleCellTextChange = (text: string, i: number) => {
    const newOtp = otp.split('');
    newOtp[i] = text;
    const finalOtp = newOtp.join('');
    handleOTPChange(finalOtp);
  };

  const handleKeyPress = (e: any, i: number) => {
    if (e.nativeEvent.key === 'Backspace' && i > 0 && !otp[i]) {
      otpRef.current?.focusPrevious();
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <OTPTextInput
        ref={otpRef}
        value={otp}
        handleTextChange={handleCellTextChange}
        handleCellTextChange={handleCellTextChange}
        handleKeyPress={handleKeyPress}
        inputCount={length}
        keyboardType="numeric"
        tintColor={tintColor}
        offTintColor={offTintColor}
        defaultValue={otp}
        containerStyle={[styles.otpContainer, textInputStyle]}
        textInputStyle={[styles.otpInput, textInputStyle]}
        placeholder={placeholder}
        disabled={disabled}
      />
      
      {showInstructions && enableAutoRead && (
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsText}>
            {isSupported 
              ? platformInstructions
              : 'Please manually enter the OTP from the SMS.'
            }
          </Text>
          {isListening && (
            <Text style={styles.listeningText}>
              Listening for SMS...
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  otpContainer: {
    marginVertical: 10,
  },
  otpInput: {
    borderWidth: 2,
    borderRadius: 8,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    minWidth: 45,
    height: 50,
  },
  instructionsContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  instructionsText: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 16,
  },
  listeningText: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 5,
    fontWeight: '500',
  },
});

export default OTPInput;
