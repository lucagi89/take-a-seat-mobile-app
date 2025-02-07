import { useLocalSearchParams, Link } from "expo-router";
import { View, Text, StyleSheet } from "react-native";

export default function RestaurantDetails() {
  const { id } = useLocalSearchParams(); // Get restaurant ID from the route

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Restaurant ID: {id}</Text>
      {/* You can fetch restaurant details here based on the ID */}
      <Link href="/map">Back to the Map</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
});
