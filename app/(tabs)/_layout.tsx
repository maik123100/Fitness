import DaySelector from '@/components/DaySelector';
import { DateProvider } from '@/app/contexts/DateContext';
import { ThemeProvider, useTheme } from '@/app/contexts/ThemeContext';
import { spacing } from '@/styles/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import React, { JSX } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type TabLayoutProps = {
  name: string;
  title: string;
  iconElement: ({ color, focused }: { color: string; focused: boolean }) => JSX.Element;
};

const tabs: TabLayoutProps[] = [
  {
    name: 'index',
    title: 'Dashboard',
    iconElement: ({ color, focused }) => (
      <Ionicons name={focused ? 'home' : 'home-outline'} color={color} size={26} />
    ),
  },
  {
    name: '(food)',
    title: 'Food',
    iconElement: ({ color, focused }) => (
      <Ionicons name={focused ? 'restaurant' : 'restaurant-outline'} color={color} size={26} />
    ),
  },
  {
    name: '(training)',
    title: 'Workouts',
    iconElement: ({ color, focused }) => (
      <Ionicons name={focused ? 'barbell' : 'barbell-outline'} color={color} size={26} />
    ),
  },
  {
    name: '(graphs)',
    title: 'Graphs',
    iconElement: ({ color, focused }) => (
      <Ionicons name={focused ? 'stats-chart' : 'stats-chart-outline'} color={color} size={26} />
    ),
  },
  {
    name: 'profile',
    title: 'Profile',
    iconElement: ({ color, focused }) => (
      <Ionicons name={focused ? 'person' : 'person-outline'} color={color} size={26} />
    ),
  },
]

function TabsContent() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.comment,
        tabBarStyle: {
          backgroundColor: theme.surface.card,
          borderTopWidth: 1,
          borderTopColor: theme.surface.elevated,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: theme.background,
          elevation: 0,
        },
        headerTintColor: theme.foreground,
        header: () => (
          <View style={[styles.headerContainer, { backgroundColor: theme.background }]}>
            <DaySelector />
          </View>
        ),
      }}
    >
      {tabs.map(({ name, title, iconElement }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title,
            headerTitleAlign: 'center',
            tabBarIcon: iconElement,
          }}
          listeners={
            name.startsWith('(')
              ? ({ navigation }) => ({
                tabPress: (e) => {
                  e.preventDefault();
                  navigation.jumpTo(name, { screen: 'index' });
                },
              })
              : undefined
          }
        />
      ))}
    </Tabs>
  );
}

export default function TabLayout() {
  return (
    <ThemeProvider>
      <DateProvider>
        <TabsContent />
      </DateProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingTop: 48,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
});
