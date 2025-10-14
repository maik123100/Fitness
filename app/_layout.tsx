import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { initDatabase } from "@/services/database";
import { Text, View } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';
import { SnackbarProvider } from './components/SnackbarProvider';
import { getOnboardingCompleted } from '../services/onboardingService'; // Import getOnboardingCompleted

export default function RootLayout() {
  const [isDbInitialized, setIsDbInitialized] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [onboardingLoaded, setOnboardingLoaded] = useState(false);

  useEffect(() => {
    const prepareApp = async () => {
      initDatabase();
      setIsDbInitialized(true);

      const completed = await getOnboardingCompleted();
      setOnboardingCompleted(completed);
      setOnboardingLoaded(true);
    };
    prepareApp();
  }, []);

  if (!isDbInitialized || !onboardingLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
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
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
            <Stack.Screen name="manageExerciseTemplates" options={{ headerShown: false }} />
            <Stack.Screen name="macroGraphs" options={{ headerShown: false }} />
            <Stack.Screen name="createWorkoutTemplate" options={{ headerShown: false }} />
            <Stack.Screen name="workoutSession" options={{ headerShown: false }} />
            <Stack.Screen name="add-food" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="light" />
        </SnackbarProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
