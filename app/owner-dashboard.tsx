import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
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
      <TouchableOpacity
        onPress={() => {
          router.back();
        }}
        style={{
          backgroundColor: "#FFCA28",
          padding: 12,
          borderRadius: 50,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 3,
          elevation: 5,
        }}
      >
        <Text style={{ color: "#000", fontSize: 16 }}>Go to back</Text>
      </TouchableOpacity>
    </View>
  );
}
