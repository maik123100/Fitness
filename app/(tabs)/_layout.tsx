import React, { JSX } from 'react';
import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import Entypo from '@expo/vector-icons/Entypo';

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
      <Ionicons name={focused ? 'home-sharp' : 'home-outline'} color={color} size={24} />
    ),
  },
  {
    name: '(food)',
    title: 'Food',
    iconElement: ({ color, focused }) => (
      <Ionicons name={focused ? 'fast-food' : 'fast-food-outline'} color={color} size={24} />
    ),
  },
  {
    name: '(training)',
    title: 'Workouts',
    iconElement: ({ color, focused }) => (
      <Ionicons name={focused ? 'barbell-sharp' : 'barbell-outline'} color={color} size={24} />
    ),
  },
  {
    name: 'graph',
    title: 'Diet Report',
    iconElement: ({ color, focused }) => (
      <Entypo name={focused ? 'area-graph' : 'line-graph'} color={color} size={24} />
    ),
  },
  {
    name: 'profile',
    title: 'Profile',
    iconElement: ({ color, focused }) => (
      <Ionicons name={focused ? 'person-sharp' : 'person-outline'} color={color} size={24} />
    ),
  },
]
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#ffd33d',
        headerStyle: {
          backgroundColor: '#25292e',
        },
        headerShadowVisible: false,
        headerTintColor: '#fff',
        tabBarStyle: {
          backgroundColor: '#25292e',
        },
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
        />
      ))}
    </Tabs>
  );
}
