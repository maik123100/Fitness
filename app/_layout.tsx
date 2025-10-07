import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { initDatabase, dbInitialized } from "@/services/database";
import { Text, View } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper'; // Import PaperProvider
import { SnackbarProvider } from './components/SnackbarProvider'; // Import SnackbarProvider

export default function RootLayout() {
  const [isDbInitialized, setIsDbInitialized] = useState(false);

  useEffect(() => {
    initDatabase();
    dbInitialized.then(() => setIsDbInitialized(true));
  }, []);

  if (!isDbInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider> {/* Wrap with PaperProvider */}
        <SnackbarProvider> {/* Wrap with SnackbarProvider */}
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
            <Stack.Screen name="manageExerciseTemplates" options={{ headerShown: false }} />
            <Stack.Screen name="macroGraphs" options={{ headerShown: false }} />
            <Stack.Screen name="createWorkoutTemplate" options={{ headerShown: false }} />
            <Stack.Screen name="workoutSession" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="light" />
        </SnackbarProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
