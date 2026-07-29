import {useEffect} from 'react';
import {BackHandler, Platform, Alert} from 'react-native';

/**
 * Blocks the Android hardware back button on a screen where going back
 * would exit the app. Optionally shows a confirmation dialog.
 *
 * @param confirmExit - When true, shows an "Exit?" prompt before closing.
 *                      When false (default), the back press is silently ignored.
 */
export function usePreventHardwareBack(confirmExit = false) {
  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }

    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!confirmExit) {
        // Swallow the event — stay on this screen.
        return true;
      }

      Alert.alert(
        'Exit App',
        'Are you sure you want to exit?',
        [
          {text: 'Cancel', style: 'cancel'},
          {text: 'Exit', style: 'destructive', onPress: () => BackHandler.exitApp()},
        ],
        {cancelable: true},
      );
      // Return true to prevent default (back) while dialog is open.
      return true;
    });

    return () => handler.remove();
  }, [confirmExit]);
}
