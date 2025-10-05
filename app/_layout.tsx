import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { initDatabase, dbInitialized } from "@/services/database";
import { Text, View } from "react-native";

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
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
        <Stack.Screen name="manageExerciseTemplates" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}
