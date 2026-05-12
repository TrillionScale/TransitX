import './src/polyfills';

import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { useState } from 'react';

import { SplashScreen } from './src/screens/SplashScreen';
import { FaceVerifyScreen } from './src/screens/FaceVerifyScreen';
import { CardListScreen } from './src/screens/CardListScreen';
import { CardDetailScreen } from './src/screens/CardDetailScreen';
import { PayScreen } from './src/screens/PayScreen';
import { SendScreen } from './src/screens/SendScreen';
import { WalletScreen } from './src/screens/WalletScreen';
import { ExchangeScreen } from './src/screens/ExchangeScreen';
import { WorkspaceScreen } from './src/screens/WorkspaceScreen';
import { MemberDetailScreen } from './src/screens/MemberDetailScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { RootStackParamList } from './src/navigation';
import { ThemeModeProvider } from './src/state/useThemeMode';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [fontsLoaded] = useFonts({
    'Unbounded-Black': require('./assets/fonts/Unbounded-Black.ttf'),
  });
  const [splashDone, setSplashDone] = useState(false);

  if (!fontsLoaded) return null;

  if (!splashDone) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <ThemeModeProvider>
            <SplashScreen onDone={() => setSplashDone(true)} />
          </ThemeModeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeModeProvider>
          <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="FaceVerify" component={FaceVerifyScreen} />
              <Stack.Screen name="CardList" component={CardListScreen} />
              <Stack.Screen name="CardDetail" component={CardDetailScreen} />
              <Stack.Screen
                name="Pay"
                component={PayScreen}
                options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
              />
              <Stack.Screen
                name="Send"
                component={SendScreen}
                options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
              />
              <Stack.Screen
                name="Wallet"
                component={WalletScreen}
                options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
              />
              <Stack.Screen
                name="Exchange"
                component={ExchangeScreen}
                options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
              />
              <Stack.Screen
                name="Workspace"
                component={WorkspaceScreen}
                options={{ animation: 'slide_from_left' }}
              />
              <Stack.Screen name="MemberDetail" component={MemberDetailScreen} />
              <Stack.Screen name="Profile" component={ProfileScreen} />
            </Stack.Navigator>
            <StatusBar style="dark" />
          </NavigationContainer>
        </ThemeModeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
