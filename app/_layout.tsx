import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { log } from "../_util/debug";
import { PaperProvider } from "react-native-paper";
import { RecoilRoot } from "recoil";
import { SessionProvider } from '../context/ctx';


export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

// export const unstable_settings = {
//   // Ensure that reloading on `/modal` keeps a back button present.
//   initialRouteName: 'index',
// };

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    Syne: require('../assets/fonts/Syne/Syne-VariableFont_wght.ttf'),
    'Syne-Bold': require('../assets/fonts/Syne/static/Syne-Bold.ttf'),
    'Space Grotesk': require('../assets/fonts/Space_Grotesk/SpaceGrotesk-VariableFont_wght.ttf'),
    'TwemojiMozilla': require('../assets/fonts/TwemojiMozilla.ttf'),
    'Wix Madefor Display': require('../assets/fonts/Wix_Madefor_Display/WixMadeforDisplay-VariableFont_wght.ttf'),
    ...FontAwesome.font,
  });

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

  return <RootLayoutNav />;
}


function RootLayoutNav() {
  const colorScheme = useColorScheme();

  log('RootLayoutNav: loaded');

  return (
    <SessionProvider>
      <RecoilRoot>
        <PaperProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack
              initialRouteName='index'
              screenOptions={{
                headerShown: false,
              }}
            >
              <Stack.Screen name="index" />
              <Stack.Screen name="auth/login-signup" />
              <Stack.Screen name="auth/phone-verify-code-input" />
              <Stack.Screen name="auth/register-form" />
              <Stack.Screen name="auth/forgot-password" />
              <Stack.Screen name="(screens)" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="modal" options={{ headerShown: false, }} />
            </Stack>
          </ThemeProvider>
        </PaperProvider>
      </RecoilRoot>
    </SessionProvider>
  );
}
