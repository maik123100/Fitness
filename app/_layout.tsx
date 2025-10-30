import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { useDatabase, rawDb } from "@/services/db";
import { Text, View, ActivityIndicator } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';
import { SnackbarProvider } from './components/SnackbarProvider';
import { getOnboardingCompleted } from '../services/onboardingService';
import { useDrizzleStudio } from 'expo-drizzle-studio-plugin';

export default function RootLayout() {
  const { success, error } = useDatabase();
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [onboardingLoaded, setOnboardingLoaded] = useState(false);

  // Enable Drizzle Studio for database debugging
  useDrizzleStudio(rawDb);

  useEffect(() => {
    const loadOnboarding = async () => {
      const completed = await getOnboardingCompleted();
      setOnboardingCompleted(completed);
      setOnboardingLoaded(true);
    };
    
    if (success) {
      loadOnboarding();
    }
  }, [success]);

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Database Migration Error: {error.message}</Text>
      </View>
    );
  }

  if (!success || !onboardingLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Loading database...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider>
        <SnackbarProvider>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
            <Stack.Screen name="macroGraphs" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="light" />
        </SnackbarProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
