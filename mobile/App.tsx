import './src/polyfills';

import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';

import { CardListScreen } from './src/screens/CardListScreen';
import { CardDetailScreen } from './src/screens/CardDetailScreen';
import { PayScreen } from './src/screens/PayScreen';
import { WorkspaceScreen } from './src/screens/WorkspaceScreen';
import { MemberDetailScreen } from './src/screens/MemberDetailScreen';
import { RootStackParamList } from './src/navigation';
import { ThemeModeProvider } from './src/state/useThemeMode';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [fontsLoaded] = useFonts({
    'Unbounded-Black': require('./assets/fonts/Unbounded-Black.ttf'),
  });

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeModeProvider>
          <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="CardList" component={CardListScreen} />
            <Stack.Screen name="CardDetail" component={CardDetailScreen} />
            <Stack.Screen
              name="Pay"
              component={PayScreen}
              options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
              name="Workspace"
              component={WorkspaceScreen}
              options={{ animation: 'slide_from_left' }}
            />
            <Stack.Screen name="MemberDetail" component={MemberDetailScreen} />
          </Stack.Navigator>
            <StatusBar style="dark" />
          </NavigationContainer>
        </ThemeModeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
