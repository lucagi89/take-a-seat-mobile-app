import React from "react";
import { useState, useEffect } from "react";
import { Text, View, StyleSheet } from "react-native";
import { useUser } from "../contexts/userContext";
import { Redirect, Link } from "expo-router";
import { fetchUserData, getUserRestaurants } from "../services/databaseActions";

import { Image } from "react-native";

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
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
    <View style={styles.container}>
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
        <Text>No profile picture</Text>
      )}

      <Text style={styles.text}>This is your profile page.</Text>
      <Link href="/">Go to Mainpage</Link>
      <Link href="/complete-profile">Complete Profile</Link>
      {userRestaurants && userRestaurants.length > 0 ? (
        <Link href="/my-restaurants">View My Restaurants</Link>
      ) : (
        ""
      )}
      <Link href="/create-restaurant">Create a Restaurant</Link>
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
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60, // for a circular image
    marginVertical: 10,
  },
  text: {
    fontSize: 16,
    textAlign: "center",
  },
});
