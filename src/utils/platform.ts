import DeviceInfo from "react-native-device-info";

export const getSystemName = () => DeviceInfo.getSystemName();
export const getAppVersion = () => DeviceInfo.getVersion();
export const getPlatformString = () => `${getSystemName()} ${getSystemName()} ApplicationVersion: ${getAppVersion()}`;

// Keep the constant for backward compatibility
export const PLATFORM_STRING = getPlatformString();
