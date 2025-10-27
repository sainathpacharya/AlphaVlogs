# OTP Input Component with Auto-Read

A React Native OTP input component with automatic SMS reading functionality for Android devices.

## Features

- ✅ **Auto-read SMS OTP** (Android only)
- ✅ **Manual OTP input** (iOS & Android)
- ✅ **Customizable styling**
- ✅ **Platform-specific instructions**
- ✅ **Permission handling**
- ✅ **Error handling**

## Installation

1. Install the required dependencies:

```bash
yarn add react-native-sms-retriever react-native-permissions
```

2. For Android, add permissions to `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.RECEIVE_SMS" />
<uses-permission android:name="android.permission.READ_SMS" />
```

## Usage

### Basic Usage

```tsx
import React, {useState} from 'react';
import {View} from 'react-native';
import OTPInput from '@/components/OTPInput';

const OTPVerificationScreen = () => {
  const [otp, setOtp] = useState('');

  const handleOTPComplete = (completedOTP: string) => {
    console.log('OTP completed:', completedOTP);
    // Handle OTP verification
  };

  return (
    <View>
      <OTPInput
        value={otp}
        onChange={setOtp}
        onComplete={handleOTPComplete}
        enableAutoRead={true}
        length={6}
      />
    </View>
  );
};
```

### Advanced Usage

```tsx
import React, {useState} from 'react';
import {View, Alert} from 'react-native';
import OTPInput from '@/components/OTPInput';

const OTPVerificationScreen = () => {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleOTPComplete = async (completedOTP: string) => {
    setIsLoading(true);
    try {
      // Verify OTP with your API
      const response = await authService.verifyOTP({
        mobile: '9876543210',
        otp: completedOTP,
      });

      if (response.success) {
        // Navigate to dashboard
        navigation.navigate('Dashboard');
      } else {
        Alert.alert('Error', 'Invalid OTP');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to verify OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View>
      <OTPInput
        value={otp}
        onChange={setOtp}
        onComplete={handleOTPComplete}
        enableAutoRead={true}
        autoReadTimeout={60000} // 60 seconds
        length={6}
        placeholder="0"
        tintColor="#007AFF"
        offTintColor="#CCCCCC"
        showInstructions={true}
        disabled={isLoading}
        containerStyle={{marginVertical: 20}}
        textInputStyle={{
          borderWidth: 2,
          borderRadius: 8,
          fontSize: 18,
        }}
      />
    </View>
  );
};
```

## Props

| Prop               | Type                    | Default     | Description                    |
| ------------------ | ----------------------- | ----------- | ------------------------------ |
| `length`           | `number`                | `6`         | Number of OTP digits           |
| `value`            | `string`                | `''`        | Current OTP value              |
| `onChange`         | `(otp: string) => void` | -           | Called when OTP changes        |
| `onComplete`       | `(otp: string) => void` | -           | Called when OTP is complete    |
| `enableAutoRead`   | `boolean`               | `true`      | Enable auto-read functionality |
| `autoReadTimeout`  | `number`                | `60000`     | Timeout for auto-read (ms)     |
| `placeholder`      | `string`                | `'0'`       | Placeholder for empty cells    |
| `tintColor`        | `string`                | `'#007AFF'` | Color for active cell          |
| `offTintColor`     | `string`                | `'#CCCCCC'` | Color for inactive cell        |
| `containerStyle`   | `StyleProp<ViewStyle>`  | -           | Container style                |
| `textInputStyle`   | `StyleProp<TextStyle>`  | -           | Input cell style               |
| `showInstructions` | `boolean`               | `true`      | Show platform instructions     |
| `disabled`         | `boolean`               | `false`     | Disable input                  |

## Platform Support

### Android

- ✅ **Auto-read SMS OTP**
- ✅ **Permission handling**
- ✅ **SMS pattern matching**
- ✅ **Automatic OTP extraction**

### iOS

- ❌ **Auto-read not supported** (iOS restrictions)
- ✅ **Manual OTP input**
- ✅ **Platform instructions**

## SMS Pattern

The component automatically extracts OTP from SMS messages with this pattern:

**For Android Auto-read:**

```
Jack Marvels: Your OTP is XXXXXX. Valid for 3 minutes. Do not share this code with anyone. [SMS_HASH]
```

**For iOS (Manual Input):**

```
Jack Marvels: Your OTP is XXXXXX. Valid for 3 minutes. Do not share this code with anyone.
```

**Important:** The SMS hash is required for Android auto-read functionality. The hash must be included at the end of the SMS message for the SMS Retriever API to work properly.

## Permissions

### Android Permissions Required

- `RECEIVE_SMS` - To receive SMS messages
- `READ_SMS` - To read SMS content

### Permission Flow

1. User opens OTP screen
2. App requests SMS permissions
3. If granted, auto-read starts
4. If denied, manual input is available

## Error Handling

The component handles various error scenarios:

- Permission denied
- Device not supported
- SMS retrieval failed
- Timeout

## Styling

You can customize the appearance using:

- `containerStyle` - Overall container
- `textInputStyle` - Individual input cells
- `tintColor` - Active cell color
- `offTintColor` - Inactive cell color

## Best Practices

1. **Always provide fallback** - Auto-read may not work on all devices
2. **Handle errors gracefully** - Show appropriate messages to users
3. **Test on multiple devices** - Different Android versions behave differently
4. **Respect user privacy** - Only request SMS permissions when needed
5. **Provide clear instructions** - Help users understand the auto-read feature

## Troubleshooting

### Auto-read not working

1. Check if device supports SMS retrieval
2. Verify SMS permissions are granted
3. Ensure SMS format matches expected pattern
4. Check if SMS retriever library is properly installed

### Permission issues

1. Request permissions at runtime
2. Handle permission denied gracefully
3. Provide manual input as fallback

### iOS limitations

- iOS doesn't support SMS auto-read
- Always provide manual input option
- Show appropriate instructions to users
