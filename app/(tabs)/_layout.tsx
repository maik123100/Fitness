import DaySelector from '@/app/components/DaySelector';
import { DateProvider } from '@/app/contexts/DateContext';
import Entypo from '@expo/vector-icons/Entypo';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import React, { JSX } from 'react';
import { View } from 'react-native';

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
    name: '(graphs)',
    title: 'Graphs',
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
    <DateProvider>
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
          header: () => (
            <View style={{ backgroundColor: '#25292e', paddingTop: 50, paddingHorizontal: 16 }}>
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
    </DateProvider>
  );
}
