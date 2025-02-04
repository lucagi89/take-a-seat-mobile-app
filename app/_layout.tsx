import { UserContextProvider } from "../contexts/userContext";

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Login from "./login";
import Index from "./index";

const Stack = createNativeStackNavigator();

export default function RootLayout() {
  return (
    <UserContextProvider>
      <Stack.Navigator initialRouteName="home">
        <Stack.Screen name="home" component={Index} />
        <Stack.Screen name="login" component={Login} />
      </Stack.Navigator>
    </UserContextProvider>
  );
}
