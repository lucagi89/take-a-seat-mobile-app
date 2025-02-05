import {
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Image,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { useUser } from "../contexts/userContext";
import { logout } from "../services/auth";

export default function Index() {
  const router = useRouter();
  const { user, loading } = useUser();

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login"); // Use replace to prevent back navigation to this screen
    }
  }, [user, loading]);

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text>Loading...</Text>
      </View>
    );
  }

  // Render the main content if user is authenticated
  return (
    <View style={styles.parentContainer}>
      <View style={styles.container}>
        <Image
          source={require("../assets/images/take-a-seat.jpg")}
          style={styles.image}
        />
      </View>
      <SafeAreaView style={styles.secondaryContainer}>
        <View>
          <Text>Welcome, {user?.email || "Guest"}!</Text>
        </View>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            router.push("/map");
          }}
        >
          <Text>Explore the Map</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            router.push("/profile");
          }}
        >
          <Text>Go to Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={async () => {
            await logout();
          }}
        >
          <Text>Logout</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  parentContainer: {
    height: "100%",
  },
  container: {
    marginTop: 0,
    marginHorizontal: 0,
    width: "100%",
    height: 400, // Fixed height
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  button: {
    marginVertical: 10,
    textAlign: "center",
    padding: 20,
  },
  secondaryContainer: {
    marginVertical: 0,
    paddingTop: 20,
    backgroundColor: "white",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    height: "100%",
  },
});
