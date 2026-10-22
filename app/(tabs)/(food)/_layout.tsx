import { Stack } from 'expo-router';

export default function FoodLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="add-food" options={{ headerShown: false }} />
      <Stack.Screen name="add-direct-meal" options={{ headerShown: false }} />
      <Stack.Screen name="food-search" options={{ headerShown: false }} />
      <Stack.Screen name="food-quantity" options={{ headerShown: false }} />
      <Stack.Screen name="saved-meals" options={{ headerShown: false }} />
      <Stack.Screen name="saved-meal-builder" options={{ headerShown: false }} />
      <Stack.Screen name="log-saved-meal" options={{ headerShown: false }} />
    </Stack>
  );
}
