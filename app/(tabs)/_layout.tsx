import { Tabs } from 'expo-router';
import { Icon, IconProps } from '@/components/Icon';
import { colors } from '@/theme';

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
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarActiveBackgroundColor: colors.background,
        tabBarLabelStyle: { fontSize: 12 },
        tabBarItemStyle: { paddingVertical: 8 },
        tabBarStyle: { height: 68, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Calculator', tabBarIcon: tabIcon('calculate') }} />
      <Tabs.Screen name="history" options={{ title: 'History', tabBarIcon: tabIcon('history') }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: tabIcon('settings') }} />
    </Tabs>
  );
}
