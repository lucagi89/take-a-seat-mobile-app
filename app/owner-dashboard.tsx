import { useState } from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { useUser } from "../contexts/userContext";
import OwnerBookingScreen from "@/components/OwnerBookingScreen";

export default function OwnerDashboard() {
  const router = useRouter();
  const { user, userData } = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  if (!user) {
    router.push("/login");
    return null;
  }
  if (!userData?.isOwner) {
    router.push("/");
    return null;
  }

  return (
    <View>
      <Text>Owner Dashboard</Text>
      <Text>This is the Owner Dashboard page.</Text>
      <OwnerBookingScreen />
    </View>
  );
}
