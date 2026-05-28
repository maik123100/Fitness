import { useDatabase } from "@/services/db";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAppBootstrap } from '@/hooks/useAppBootstrap';
import { ActivityIndicator, Text, View } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';
import { ThemeProvider } from '@/app/contexts/ThemeContext';

export default function RootLayout() {
  const { success, error } = useDatabase();
  const router = useRouter();
  const appReady = useAppBootstrap(success, router);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {error ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Database Migration Error: {error.message}</Text>
        </View>
      ) : !success || !appReady ? (
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
