import { useEffect } from 'react';
import { RecoilRoot } from 'recoil';
import { SplashScreen } from 'expo-router';
import { useFonts } from 'expo-font';
import * as Device from 'expo-device';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { StatusBar, Platform, useColorScheme } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';

import Toast from 'react-native-toast-message';

import AppContainer from './src/navigations/app';

import { SessionProvider } from './src/utils/context/ctx';

export { ErrorBoundary } from 'expo-router';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function App() {
  const colorScheme = useColorScheme();

  const [loaded, error] = useFonts({
    SpaceMono: require('./src/assets/fonts/SpaceMono-Regular.ttf'),
    Syne: require('./src/assets/fonts/Syne/Syne-VariableFont_wght.ttf'),
    'Syne-Bold': require('./src/assets/fonts/Syne/static/Syne-Bold.ttf'),
    'Space Grotesk': require('./src/assets/fonts/Space_Grotesk/SpaceGrotesk-VariableFont_wght.ttf'),
    'TwemojiMozilla': require('./src/assets/fonts/TwemojiMozilla.ttf'),
    'Wix Madefor Display': require('./src/assets/fonts/Wix_Madefor_Display/WixMadeforDisplay-VariableFont_wght.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    console.log(Device.deviceName);
  }, []);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <SessionProvider>
      <RecoilRoot>
        <PaperProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <AppContainer />
            <StatusBar backgroundColor='transparent' barStyle='light-content' hidden={Platform.OS === 'android' ? true : false} />
            <Toast />
          </ThemeProvider>
        </PaperProvider>
      </RecoilRoot>
    </SessionProvider>
  );
}