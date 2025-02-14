import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, Alert, StyleSheet } from "react-native";
import { getAuth, updateProfile, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../scripts/firebase.config";
import { useRouter } from "expo-router";

const CompleteProfileScreen = () => {
  const auth = getAuth();
  const router = useRouter();

  const [userData, setUserData] = useState({
    name: "",
    surname: "",
    address: "",
  });

  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);

        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const existingUserData = userDoc.data();
            setUserData({
              name: existingUserData.name || "",
              surname: existingUserData.surname || "",
              address: existingUserData.address || "",
            });

            // If profile is already complete, navigate to home
            if (
              existingUserData.name &&
              existingUserData.surname &&
              existingUserData.address
            ) {
              router.push("/" as never);
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSaveProfile = async () => {
    if (!userData.name || !userData.surname || !userData.address) {
      Alert.alert("Error", "All fields are required!");
      return;
    }

    if (!userId) return;

    try {
      // Update Firebase Auth displayName
      await updateProfile(auth.currentUser!, { displayName: userData.name });

      // Save extra user data in Firestore
      await setDoc(doc(db, "users", userId), { ...userData }, { merge: true });

      Alert.alert("Success", "Profile completed!");
      router.push("/" as never);
    } catch (error) {
      console.error("Error saving profile:", error);
      Alert.alert("Error", "Could not save profile.");
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Complete Your Profile</Text>

      <Text>Name:</Text>
      <TextInput
        value={userData.name}
        onChangeText={(text) =>
          setUserData((prev) => ({ ...prev, name: text }))
        }
        style={styles.input}
        placeholder="Enter your name"
      />

      <Text>Surname:</Text>
      <TextInput
        value={userData.surname}
        onChangeText={(text) =>
          setUserData((prev) => ({ ...prev, surname: text }))
        }
        style={styles.input}
        placeholder="Enter your surname"
      />

      <Text>Address:</Text>
      <TextInput
        value={userData.address}
        onChangeText={(text) =>
          setUserData((prev) => ({ ...prev, address: text }))
        }
        style={styles.input}
        placeholder="Enter your address"
      />

      <Button title="Save Profile" onPress={handleSaveProfile} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
});

export default CompleteProfileScreen;
