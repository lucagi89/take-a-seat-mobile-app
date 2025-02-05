import { UserContextProvider } from "../contexts/userContext";

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import login from "./(access)/login";
import Index from "./index";

const Stack = createNativeStackNavigator();

export default function RootLayout() {
  return (
    <UserContextProvider>
      <Stack.Navigator
        initialRouteName="home"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="home" component={Index} />
        <Stack.Screen name="login" component={login} />
      </Stack.Navigator>
    </UserContextProvider>
  );
}
