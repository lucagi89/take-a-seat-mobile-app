import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
} from "react-native";
import { useUser } from "../contexts/userContext";
import { Redirect, Link } from "expo-router";
import { fetchUserData, getUserRestaurants } from "../services/databaseActions";
import Icon from "react-native-vector-icons/MaterialIcons";

interface UserData {
  name: string;
  photoURL?: string; // Make photoURL optional to reflect reality
  isProfileComplete?: boolean;
}

export default function Profile() {
  const { user, loading, userData } = useUser();
  const [userRestaurants, setUserRestaurants] = useState([]);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (user) {
      getUserRestaurants(user.uid).then((result) => {
        setUserRestaurants(result);
      });
    }
  }, [user]);

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
    <ImageBackground
      source={require("../assets/images/background.png")}
      style={styles.background}
      onLoad={() => setImageLoaded(true)}
      resizeMode="cover"
    >
      {/* Show placeholder until image loads */}
      {!imageLoaded && (
        <Image
          source={require("../assets/images/pre-background.png")}
          style={styles.placeholderBackground}
          resizeMode="cover"
        />
      )}
      <View style={styles.container}>
        <View style={styles.card}>
          {/* Display name */}
          <Text style={styles.title}>
            Hello {userData?.name ? userData.name : user.email}
          </Text>

          {/* Display profile picture if available and valid */}
          {userData?.photoURL ? (
            <Image
              source={{ uri: userData.photoURL }}
              style={styles.profileImage}
              onError={(e) =>
                console.log("Image load error:", e.nativeEvent.error)
              } // Debug loading errors
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>No Photo</Text>
            </View>
          )}

          <Text style={styles.subtitle}>This is your profile page.</Text>

          {/* Navigation Links */}
          <TouchableOpacity style={styles.linkButton}>
            <Link href="/complete-profile" style={styles.linkText}>
              {userData?.isProfileComplete
                ? "Edit Profile"
                : "Complete Profile"}
            </Link>
          </TouchableOpacity>
          {userRestaurants && userRestaurants.length > 0 && (
            <TouchableOpacity style={styles.linkButton}>
              <Link href="/my-restaurants" style={styles.linkText}>
                View My Restaurants
              </Link>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.linkButton}>
            <Link href="/create-restaurant" style={styles.linkText}>
              Create a Restaurant
            </Link>
          </TouchableOpacity>

          {/* Back Arrow Button */}
          <TouchableOpacity style={styles.backButton}>
            <Link href="/">
              <Icon name="arrow-back" size={30} color="#2E7D32" />
            </Link>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  placeholderBackground: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    width: "90%",
    maxWidth: 400,
    alignItems: "center",
    position: "relative",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2E7D32",
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
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "#FFCA28",
    marginVertical: 15,
  },
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#E0E0E0",
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
    backgroundColor: "#FFCA28",
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
    textDecorationLine: "none",
  },
  backButton: {
    position: "absolute",
    bottom: 10,
    right: 10,
    padding: 5,
  },
});
