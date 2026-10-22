import DaySelector from '@/components/DaySelector';
import { SnackbarProvider } from '@/components/SnackbarProvider';
import { DateProvider } from '@/contexts/DateContext';
import { useTheme } from '@/contexts/ThemeContext';
import { spacing } from '@/styles/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs, useSegments } from 'expo-router';
import React, { JSX } from 'react';
import { ColorValue, StyleSheet, View } from 'react-native';

type TabLayoutProps = {
  name: string;
  title: string;
  iconElement: ({ color, focused }: { color: ColorValue; focused: boolean }) => JSX.Element;
};

const normalizeIconColor = (color: ColorValue) =>
  typeof color === 'number' ? String(color) : color ?? undefined;

const tabs: TabLayoutProps[] = [
  {
    name: 'index',
    title: 'Dashboard',
    iconElement: ({ color, focused }) => (
      <Ionicons name={focused ? 'home' : 'home-outline'} color={normalizeIconColor(color)} size={26} />
    ),
  },
  {
    name: '(food)',
    title: 'Food',
    iconElement: ({ color, focused }) => (
      <Ionicons name={focused ? 'restaurant' : 'restaurant-outline'} color={normalizeIconColor(color)} size={26} />
    ),
  },
  {
    name: '(training)',
    title: 'Workouts',
    iconElement: ({ color, focused }) => (
      <Ionicons name={focused ? 'barbell' : 'barbell-outline'} color={normalizeIconColor(color)} size={26} />
    ),
  },
  {
    name: '(graphs)',
    title: 'Graphs',
    iconElement: ({ color, focused }) => (
      <Ionicons name={focused ? 'stats-chart' : 'stats-chart-outline'} color={normalizeIconColor(color)} size={26} />
    ),
  },
  {
    name: 'profile',
    title: 'Profile',
    iconElement: ({ color, focused }) => (
      <Ionicons name={focused ? 'person' : 'person-outline'} color={normalizeIconColor(color)} size={26} />
    ),
  },
]

function TabsContent() {
  const { theme } = useTheme();
  const segments = useSegments();
  const isNestedScreen = segments.length > 2;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.comment,
        tabBarStyle: {
          backgroundColor: theme.surface.card,
          borderTopWidth: 1,
          borderTopColor: theme.surface.elevated,
          display: isNestedScreen ? 'none' : 'flex',
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
    <DateProvider>
      <SnackbarProvider>
        <TabsContent />
      </SnackbarProvider>
    </DateProvider>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingTop: 48,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
});
