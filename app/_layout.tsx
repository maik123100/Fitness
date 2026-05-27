import { rawDb, useDatabase } from "@/services/db";
import { seedMockData, shouldSeedMockData } from '@/services/mockData';
import { initializeNotifications, setupNotificationHandlers } from '@/services/notificationService';
import { getOnboardingCompleted } from '@/services/onboardingService';
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';
import { ThemeProvider } from '@/app/contexts/ThemeContext';

export default function RootLayout() {
  const { success, error } = useDatabase();
  const [onboardingLoaded, setOnboardingLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loadOnboarding = async () => {
      await getOnboardingCompleted();
      setOnboardingLoaded(true);

      // Seed mock data if enabled
      if (shouldSeedMockData()) {
        try {
          seedMockData();
        } catch (error) {
          console.error('Failed to seed mock data:', error);
        }
      }

      // Initialize notifications after onboarding is loaded
      await initializeNotifications();

      // Set up notification handlers for navigation
      setupNotificationHandlers(router);
    };

    if (success) {
      loadOnboarding();
    }
  }, [router, success]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {error ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Database Migration Error: {error.message}</Text>
        </View>
      ) : !success || !onboardingLoaded ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" />
          <Text style={{ marginTop: 10 }}>Loading database...</Text>
        </View>
      ) : (
        <ThemeProvider>
          <PaperProvider>
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="onboarding" options={{ headerShown: false }} />
              <Stack.Screen name="macroGraphs" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="light" />
          </PaperProvider>
        </ThemeProvider>
      )}
    </GestureHandlerRootView>
  );
}
