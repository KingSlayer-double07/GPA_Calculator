import { Stack } from "expo-router";
import { StatusBar, View } from "react-native";
import 'react-native-reanimated';

export default function RootLayout() {
  return (
    <View style={{flex: 1}}>
      <StatusBar hidden={true} />
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="history" options={{ headerShown: false }} />
    </Stack>
    </View>
  );
}
