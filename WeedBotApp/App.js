import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import IntroScreen from './screens/IntroScreen';
import LandingScreen from './screens/LandingScreen';
import MainScreen from './screens/MainScreen';
import SettingsScreen from './screens/SettingsScreen';

const Stack = createNativeStackNavigator();

import * as SplashScreen from 'expo-splash-screen';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  React.useEffect(() => {
    // Hide splash screen after a short delay to ensure everything is mounted
    setTimeout(async () => {
      await SplashScreen.hideAsync();
    }, 1500);
  }, []);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Intro"
            screenOptions={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="Intro" component={IntroScreen} />
            <Stack.Screen name="Landing" component={LandingScreen} />
            <Stack.Screen name="Dashboard" component={MainScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
          </Stack.Navigator>
          <StatusBar style="light" />
        </NavigationContainer>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
});
