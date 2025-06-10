import DeviceInfo from "react-native-device-info";
import VersionInfo from "react-native-version-info";

export const PLATFORM_STRING = `${DeviceInfo.getSystemName()} ${DeviceInfo.getSystemName()} ApplicationVersion: ${VersionInfo.appVersion}`;
