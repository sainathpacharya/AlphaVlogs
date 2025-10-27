import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import otpAutoReadService, { OTPAutoReadConfig, OTPAutoReadResult } from '@/services/otp-auto-read-service';

export interface UseOTPAutoReadOptions {
  enableAutoRead?: boolean;
  timeout?: number;
  onOTPReceived?: (otp: string) => void;
  onError?: (error: string) => void;
  onTimeout?: () => void;
}

export interface UseOTPAutoReadReturn {
  isListening: boolean;
  isSupported: boolean;
  startListening: () => Promise<void>;
  stopListening: () => void;
  extractOTPFromMessage: (message: string) => string | null;
  platformInstructions: string;
}

export const useOTPAutoRead = (options: UseOTPAutoReadOptions = {}): UseOTPAutoReadReturn => {
  const {
    enableAutoRead = true,
    timeout = 60000,
    onOTPReceived,
    onError,
    onTimeout,
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  // Check if SMS auto-read is supported
  useEffect(() => {
    const checkSupport = async () => {
      const supported = await otpAutoReadService.isSupported();
      setIsSupported(supported);
    };

    checkSupport();
  }, []);

  // Start listening for OTP
  const startListening = useCallback(async () => {
    if (!enableAutoRead || !isSupported) {
      return;
    }

    try {
      setIsListening(true);
      
      const config: OTPAutoReadConfig = {
        enableAutoRead: true,
        timeout,
      };

      const result = await otpAutoReadService.startListening(config);
      
      if (result.success && result.otp) {
        onOTPReceived?.(result.otp);
      } else if (result.error) {
        onError?.(result.error);
      }
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Failed to start OTP listener');
    } finally {
      setIsListening(false);
    }
  }, [enableAutoRead, isSupported, timeout, onOTPReceived, onError]);

  // Stop listening for OTP
  const stopListening = useCallback(() => {
    otpAutoReadService.stopListening();
    setIsListening(false);
  }, []);

  // Extract OTP from message manually
  const extractOTPFromMessage = useCallback((message: string): string | null => {
    return otpAutoReadService.extractOTPFromMessage(message);
  }, []);

  // Get platform-specific instructions
  const platformInstructions = otpAutoReadService.getPlatformInstructions();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return {
    isListening,
    isSupported,
    startListening,
    stopListening,
    extractOTPFromMessage,
    platformInstructions,
  };
};
