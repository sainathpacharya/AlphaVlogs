import { Platform } from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

export interface OTPAutoReadConfig {
  enableAutoRead: boolean;
  smsPattern?: string;
  timeout?: number;
}

export interface OTPAutoReadResult {
  success: boolean;
  otp?: string;
  error?: string;
}

class OTPAutoReadService {
  private isListening = false;
  private timeoutId?: ReturnType<typeof setTimeout>;
  private defaultTimeout = 60000; // 60 seconds
  private defaultSmsPattern = /Jack Marvels: Your OTP is (\d{6})/;
  private smsListener?: any;

  /**
   * Request SMS permissions for Android
   */
  async requestSMSPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return true;
    }

    try {
      const permission = PERMISSIONS.ANDROID.RECEIVE_SMS;
      const result = await check(permission);

      switch (result) {
        case RESULTS.UNAVAILABLE:
          console.log('SMS permission not available on this device');
          return false;
        case RESULTS.DENIED:
          const requestResult = await request(permission);
          return requestResult === RESULTS.GRANTED;
        case RESULTS.LIMITED:
        case RESULTS.GRANTED:
          return true;
        case RESULTS.BLOCKED:
          console.log('SMS permission is blocked');
          return false;
        default:
          return false;
      }
    } catch (error) {
      console.error('Error requesting SMS permission:', error);
      return false;
    }
  }

  /**
   * Start listening for SMS with OTP
   */
  async startListening(config: OTPAutoReadConfig = { enableAutoRead: true }): Promise<OTPAutoReadResult> {
    if (!config.enableAutoRead) {
      return { success: false, error: 'Auto-read is disabled' };
    }

    if (this.isListening) {
      return { success: false, error: 'Already listening for OTP' };
    }

    try {
      // Request permissions first
      const hasPermission = await this.requestSMSPermission();
      if (!hasPermission) {
        return { success: false, error: 'SMS permission denied' };
      }

      // Check if SMS retriever is supported (Android only)
      if (Platform.OS === 'android') {
        const isSupported = await this.isSupported();
        if (!isSupported) {
          return { success: false, error: 'SMS auto-read not supported on this device' };
        }
      }

      this.isListening = true;
      const timeout = config.timeout || this.defaultTimeout;

      // Set timeout
      this.timeoutId = setTimeout(() => {
        this.stopListening();
      }, timeout);

      // Start SMS listener (Android only)
      if (Platform.OS === 'android' && SmsRetriever) {
        this.smsListener = SmsRetriever.addSmsListener((message: string) => {
          console.log('SMS received:', message);
          
          const match = message.match(this.defaultSmsPattern);
          if (match && match[1]) {
            const otp = match[1];
            this.stopListening();
            return { success: true, otp };
          }
        });
      }

      return { success: true };
    } catch (error) {
      this.isListening = false;
      console.error('Error starting OTP listener:', error);
      return { success: false, error: 'Failed to start OTP listener' };
    }
  }

  /**
   * Get SMS hash for Android (required for SMS retrieval)
   * This hash must be included in the SMS message for auto-read to work
   */
  async getSMSHash(): Promise<string> {
    if (Platform.OS !== 'android' || !SmsRetriever) {
      return '';
    }

    try {
      const hash = await SmsRetriever.getSmsHash();
      console.log('SMS Hash generated:', hash);
      return hash;
    } catch (error) {
      console.error('Error getting SMS hash:', error);
      return '';
    }
  }

  /**
   * Generate SMS message with hash for Android auto-read
   */
  async generateSMSWithHash(otp: string): Promise<string> {
    if (Platform.OS !== 'android') {
      return `Jack Marvels: Your OTP is ${otp}. Valid for 3 minutes. Do not share this code with anyone.`;
    }

    try {
      const hash = await this.getSMSHash();
      if (!hash) {
        console.warn('Could not generate SMS hash, falling back to regular SMS');
        return `Jack Marvels: Your OTP is ${otp}. Valid for 3 minutes. Do not share this code with anyone.`;
      }

      // Include hash in SMS message for auto-read to work
      return `Jack Marvels: Your OTP is ${otp}. Valid for 3 minutes. Do not share this code with anyone. ${hash}`;
    } catch (error) {
      console.error('Error generating SMS with hash:', error);
      return `Jack Marvels: Your OTP is ${otp}. Valid for 3 minutes. Do not share this code with anyone.`;
    }
  }

  /**
   * Stop listening for SMS
   */
  stopListening(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
    }

    if (this.isListening && Platform.OS === 'android' && SmsRetriever) {
      try {
        SmsRetriever.removeSmsListener();
      } catch (error) {
        console.error('Error removing SMS listener:', error);
      }
      this.isListening = false;
    }
  }

  /**
   * Check if device supports SMS retrieval
   */
  async isSupported(): Promise<boolean> {
    if (Platform.OS !== 'android' || !SmsRetriever) {
      return false; // iOS doesn't support SMS retrieval
    }

    try {
      const isSupported = await SmsRetriever.isSupported();
      return isSupported;
    } catch (error) {
      console.error('Error checking SMS support:', error);
      return false;
    }
  }

  /**
   * Extract OTP from SMS message manually
   */
  extractOTPFromMessage(message: string, pattern?: RegExp): string | null {
    const smsPattern = pattern || this.defaultSmsPattern;
    const match = message.match(smsPattern);
    return match && match[1] ? match[1] : null;
  }

  /**
   * Get platform-specific instructions
   */
  getPlatformInstructions(): string {
    if (Platform.OS === 'android') {
      return 'SMS will be automatically detected and OTP will be filled.';
    } else {
      return 'On iOS, please manually enter the OTP from the SMS.';
    }
  }

  /**
   * Check if auto-read is available on current platform
   */
  isAutoReadAvailable(): boolean {
    return Platform.OS === 'android';
  }
}

// Dynamically import SMS retriever
let SmsRetriever: any;
try {
  SmsRetriever = require('react-native-sms-retriever');
} catch (error) {
  console.warn('SMS retriever not available:', error);
}

export const otpAutoReadService = new OTPAutoReadService();
export default otpAutoReadService;
