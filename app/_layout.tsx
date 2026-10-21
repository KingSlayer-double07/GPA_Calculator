import { Stack } from 'expo-router';
import { StatusBar } from 'react-native';
import { AppDataProvider } from '@/context/AppDataContext';

export default function RootLayout() {
  return (
    <AppDataProvider>
      <StatusBar hidden={true} />
      <Stack screenOptions={{ headerShown: false }} />
    </AppDataProvider>
  );
}
