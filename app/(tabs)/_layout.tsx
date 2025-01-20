import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import Entypo from '@expo/vector-icons/Entypo';

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
      <Tabs.Screen
        name="index"
        options={{
            title: 'Dashboard',
            headerTitleAlign: 'center',
            tabBarIcon: ({ color, focused }) => (
                <Ionicons name={focused ? 'home-sharp' : 'home-outline'} color={color} size={24} />
            ),
        }} />
      <Tabs.Screen
        name="diary"
        options={{
            title: 'Diary',
            headerTitleAlign: 'center',
            tabBarIcon: ({ color, focused }) => (
                <Ionicons name={focused ? 'book-sharp' : 'book-outline'} color={color} size={24} />
            ),
        }} />
      <Tabs.Screen
        name="graph"
        options={{
            title: 'Diet Report',
            headerTitleAlign: 'center',
            tabBarIcon: ({ color, focused }) => (
                <Entypo name={focused ? 'area-graph' : 'line-graph'} color={color} size={24} />
            ),
        }} />
    </Tabs>
  );
}
