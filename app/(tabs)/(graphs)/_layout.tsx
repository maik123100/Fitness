import { useTheme } from '@/app/contexts/ThemeContext';
import { Stack } from 'expo-router';

export default function GraphsLayout() {
  const { theme } = useTheme();
  
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.background,
        },
        headerTintColor: theme.foreground,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="calorie-analysis" options={{ headerShown: false }} />
      <Stack.Screen name="workout-progression" options={{ headerShown: false }} />
    </Stack>
  );
}
