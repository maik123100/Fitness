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
    iconElement:  ({ color, focused }) => (
      <Ionicons name={focused ? 'home-sharp' : 'home-outline'} color={color} size={24} />
    ),
  },
  {
    name: 'diary',
    title: 'Diary',
    iconElement:  ({ color, focused }) => (
      <Ionicons name={focused ? 'book-sharp' : 'book-outline'} color={color} size={24} />
    ),
  },
  {
    name: 'training',
    title: 'Training',
    iconElement:  ({ color, focused }) => (
      <Ionicons name={focused ? 'barbell-sharp' : 'barbell-outline'} color={color} size={24} />
    ),
  },
  {
    name: 'graph',
    title: 'Diet Report',
    iconElement:  ({ color, focused }) => (
      <Entypo name={focused ? 'area-graph' : 'line-graph'} color={color} size={24} />
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
