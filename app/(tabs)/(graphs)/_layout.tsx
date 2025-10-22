import { Stack } from 'expo-router';

export default function GraphsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="calorie-analysis" options={{ headerShown: false }} />
      <Stack.Screen name="workout-progression" options={{ headerShown: false }} />
    </Stack>
  );
}
