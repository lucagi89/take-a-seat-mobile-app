import Map from "./map";
import { UserContextProvider } from "../contexts/userContext";
import { useRootNavigationState, Redirect } from "expo-router";
import { ActivityIndicator } from "react-native";

export default function App() {
  return (
    <UserContextProvider>
      {/* Add your app's navigation and other components here */}
      <Map />
    </UserContextProvider>
  );
}
