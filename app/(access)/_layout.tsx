// app/(access)/_layout.tsx
import login from "./login";
import signup from "./signup";

import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator();

export default function AccessLayout() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false, // Hide headers for a clean login/signup screen
        animation: "fade", // Smooth fade transition between login and signup
      }}
    >
      <Stack.Screen name="login" component={login} />
      <Stack.Screen name="signup" component={signup} />
    </Stack.Navigator>
  );
}
