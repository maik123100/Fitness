import { rawDb, useDatabase } from "@/services/db";
import { initializeNotifications } from '@/services/notificationService';
import { getOnboardingCompleted } from '@/services/onboardingService';
import { useDrizzleStudio } from 'expo-drizzle-studio-plugin';
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';
import { SnackbarProvider } from './components/SnackbarProvider';

export default function RootLayout() {
  const { success, error } = useDatabase();
  const [onboardingLoaded, setOnboardingLoaded] = useState(false);

  // Enable Drizzle Studio for database debugging
  useDrizzleStudio(rawDb);

  useEffect(() => {
    const loadOnboarding = async () => {
      await getOnboardingCompleted();
      setOnboardingLoaded(true);

      // Initialize notifications after onboarding is loaded
      await initializeNotifications();
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
