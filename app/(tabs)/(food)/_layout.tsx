import { useTheme } from '@/app/contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { Stack, usePathname } from 'expo-router';
import { useEffect } from 'react';

export default function FoodLayout() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const pathname = usePathname();

  useEffect(() => {
    const isIndex = pathname === '/(tabs)/food';
    // @ts-ignore
    navigation.getParent()?.setOptions({
      tabBarStyle: {
        display: isIndex ? 'flex' : 'none',
        backgroundColor: theme.background,
      },
    });
  }, [pathname, navigation, theme]);

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="add-food" options={{ headerShown: false }} />
      <Stack.Screen name="food-search" options={{ headerShown: false }} />
      <Stack.Screen name="food-quantity" options={{ headerShown: false }} />
    </Stack>
  );
}
