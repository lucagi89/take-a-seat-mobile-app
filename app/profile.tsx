import React from "react";
import { useState, useEffect } from "react";
import { Text, View, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useUser } from "../contexts/userContext";
import { Redirect, Link } from "expo-router";
import { fetchUserData, getUserRestaurants } from "../services/databaseActions";

interface UserData {
  name: string;
  photoURL: string;
}

export default function Profile() {
  const { user, loading, userData } = useUser();

  const [userRestaurants, setUserRestaurants] = useState([]);

  useEffect(() => {
    if (user) {
      getUserRestaurants(user.uid).then((result) => {
        setUserRestaurants(result);
      });
    }
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Display name */}
        <Text style={styles.title}>
          Hello {userData?.name ? userData.name : user.email}
        </Text>

        {/* Display profile picture if available */}
        {userData?.photoURL ? (
          <Image
            source={{ uri: userData.photoURL }}
            style={styles.profileImage}
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>No Photo</Text>
          </View>
        )}

        <Text style={styles.subtitle}>This is your profile page.</Text>

        {/* Navigation Links */}
        <TouchableOpacity style={styles.linkButton} onPress={() => {}}>
          <Link href="/" style={styles.linkText}>
            Go to Main Page
          </Link>
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkButton} onPress={() => {}}>
          <Link href="/complete-profile" style={styles.linkText}>
            Complete Profile
          </Link>
        </TouchableOpacity>
        {userRestaurants && userRestaurants.length > 0 && (
          <TouchableOpacity style={styles.linkButton} onPress={() => {}}>
            <Link href="/my-restaurants" style={styles.linkText}>
              View My Restaurants
            </Link>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.linkButton} onPress={() => {}}>
          <Link href="/create-restaurant" style={styles.linkText}>
            Create a Restaurant
          </Link>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F5F5F5", // Light gray background for a clean look
  },
  card: {
    backgroundColor: "#FFFFFF", // White card for content
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5, // For Android shadow
    width: "90%",
    maxWidth: 400, // Cap width for larger screens
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2E7D32", // Deep green for a restaurant feel
    textAlign: "center",
    marginBottom: 15,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
    fontStyle: "italic",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60, // Circular image
    borderWidth: 2,
    borderColor: "#FFCA28", // Gold border for elegance
    marginVertical: 15,
  },
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#E0E0E0", // Light gray placeholder
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 15,
  },
  placeholderText: {
    color: "#757575",
    fontSize: 14,
    fontWeight: "500",
  },
  loadingText: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
  },
  linkButton: {
    backgroundColor: "#FFCA28", // Gold/yellow for a warm accent
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginVertical: 10,
    width: "80%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  linkText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    textTransform: "uppercase",
    textDecorationLine: "none", // Remove default link underline
  },
});
