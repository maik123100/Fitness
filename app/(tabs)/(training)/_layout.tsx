import { Stack } from 'expo-router';

export default function TrainingLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="createWorkoutTemplate" options={{ headerShown: false }} />
      <Stack.Screen name="manageExerciseTemplates" options={{ headerShown: false }} />
      <Stack.Screen name="workoutSession" options={{ headerShown: false }} />
    </Stack>
  );
}
