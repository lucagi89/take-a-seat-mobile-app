import React from "react";
import { useState, useEffect } from "react";
import { Text, View, StyleSheet } from "react-native";
import { useUser } from "../contexts/userContext";
import { Redirect, Link } from "expo-router";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../scripts/firebase.config";

export default function Profile() {
  const { user, loading } = useUser();
  interface UserData {
    name: string;
    // add other properties as needed
  }

  const [userData, setUserData] = useState<UserData | null>(null);
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

  useEffect(() => {
    // Check if user already has data in Firestore
    const checkUserData = async () => {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as UserData;
        if (userData) {
          setUserData(userData);
        }
      }
    };

    checkUserData();
  }, []);

  if (!userData) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello {userData.name}</Text>
      <Text style={styles.text}>This is your profile page.</Text>
      <Link href="/">Go to Mainpage</Link>
      <Link href="/complete-profile">Complete Profile</Link>
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
