import { Tabs } from 'expo-router';
import { Icon, IconProps } from '@/components/Icon';

type IconName = IconProps['name'];

const tabIcon = (name: IconName) =>
  function TabIcon({ color }: { color: string }) {
    return <Icon name={name} size={24} color={color} />;
  };

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarPosition: 'top',
        tabBarLabelPosition: 'below-icon',
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#666',
        tabBarActiveBackgroundColor: '#F8F9FA',
        tabBarLabelStyle: { fontSize: 12 },
        tabBarItemStyle: { paddingVertical: 8 },
        tabBarStyle: { height: 68, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#E5E5E5' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Calculator', tabBarIcon: tabIcon('calculate') }} />
      <Tabs.Screen name="history" options={{ title: 'History', tabBarIcon: tabIcon('history') }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: tabIcon('settings') }} />
    </Tabs>
  );
}
