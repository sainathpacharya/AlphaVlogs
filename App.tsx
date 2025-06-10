/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {useColorScheme} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import {GluestackUIProvider} from './src/components';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import Navigation from './src/navigation';

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <>
      <GestureHandlerRootView>
        <GluestackUIProvider>
          <SafeAreaProvider>
            <Navigation />
          </SafeAreaProvider>
        </GluestackUIProvider>
      </GestureHandlerRootView>
    </>
  );
}

export default App;
