import React from "react";
import { Text, View, StyleSheet } from "react-native";
import { useUser } from "../contexts/userContext";
import { Link, Redirect } from "expo-router";

export default function Map() {
  const { user, loading } = useUser();
  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Map</Text>
      <Text style={styles.text}>This is the map page.</Text>
      <Link href="/">Go to Mainpage</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    textAlign: "center",
  },
});
