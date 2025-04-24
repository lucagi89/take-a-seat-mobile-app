import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import { useUser } from "../contexts/userContext";

export default function Favourites() {
  const { userData } = useUser();
  const { favourites } = userData || [];
  const router = useRouter();
  const [favouriteRestaurants, setFavouriteRestaurants] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  return (
    <View style={styles.container}>
      <Text>Favourites</Text>
      <Text>This is the Favourites page.</Text>
      <TouchableOpacity style={styles.abort} onPress={() => router.back()}>
        <Text>X</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    width: "100%",
    height: "90%",
    // justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  abort: {
    backgroundColor: "#FFCA28",
    position: "absolute",
    bottom: 10,
    right: 10,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 50,
    marginTop: 20,
  },
});
