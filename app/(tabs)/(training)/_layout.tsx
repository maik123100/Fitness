import { Stack, usePathname } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { useEffect } from 'react';

export default function TrainingLayout() {
  const navigation = useNavigation();
  const pathname = usePathname();

  useEffect(() => {
    const isIndex = pathname === '/(tabs)/training';
    // @ts-ignore
    navigation.getParent()?.setOptions({
      tabBarStyle: {
        display: isIndex ? 'flex' : 'none',
      },
    });
  }, [pathname, navigation]);

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="createWorkoutTemplate" options={{ headerShown: false }} />
      <Stack.Screen name="manageExerciseTemplates" options={{ headerShown: false }} />
      <Stack.Screen name="workoutSession" options={{ headerShown: false }} />
    </Stack>
  );
}
