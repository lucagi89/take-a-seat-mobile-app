import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  Image,
  ActivityIndicator,
  ImageBackground,
} from "react-native";
import { updateProfile, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import * as ImagePicker from "expo-image-picker";
import { db, storage, auth } from "../scripts/firebase.config";
import { useRouter } from "expo-router";
import { useUser } from "../contexts/userContext";
// import placeholderImage from '../assets/images/placeholderprofilepic.png'

const CompleteProfileScreen = () => {
  const router = useRouter();
  const { setUserData, userData } = useUser();

  const [userInfo, setUserInfo] = useState({
    name: "",
    lastName: "",
    streetAddress: "",
    postcode: "",
    city: "",
    country: "",
    phone: "",
  });
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageUri, setImageUri] = useState<string | null>(null); // For the selected image
  const [uploading, setUploading] = useState(false); // For image upload status

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (userData) {
      setUserInfo({
        name: userData.name || "",
        lastName: userData.lastName || "",
        streetAddress: userData.streetAddress || "",
        postcode: userData.postcode || "",
        country: userData.country || "",
        city: userData.city || "",
        phone: userData.phone || "",
      });

      if (userData.photoURL) {
        setImageUri(userData.photoURL);
      }
    }
    setLoading(false);
  }, [userData]);

  const uploadImageAsync = async (uri: string): Promise<string | null> => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const filename = `profile_${new Date().getTime()}`;
      const storageRef = ref(storage, `profilePics/${userId}/${filename}`);

      const snapshot = await uploadBytes(storageRef, blob);
      return await getDownloadURL(snapshot.ref);
    } catch (error) {
      console.error("Error uploading image:", error);
      Alert.alert("Upload Failed", "Could not upload image. Try again.");
      return null;
    }
  };

  const handleSaveProfile = async () => {
    if (!userInfo.name || !userInfo.lastName || !userInfo.streetAddress) {
      Alert.alert("Error", "All fields are required!");
      return;
    }
    if (!userId) return;

    setUploading(true);

    try {
      let photoURL = null;
      if (imageUri) {
        photoURL = await uploadImageAsync(imageUri);
      }

      await updateProfile(auth.currentUser!, {
        displayName: userInfo.name,
        ...(photoURL && { photoURL }),
      });

      await setDoc(
        doc(db, "users", userId),
        {
          ...userInfo,
          isProfileComplete: true,
          isOwner: userData?.isOwner || false,
          ...(photoURL && { photoURL }),
        },
        { merge: true }
      );

      setUserData({
        ...userInfo,
        isProfileComplete: true,
        isOwner: userData?.isOwner || false,
        ...(photoURL && { photoURL }),
      });

      Alert.alert("Success", "Profile completed!");
      router.push("/profile");
    } catch (error) {
      console.error("Error saving profile:", error);
      Alert.alert("Error", "Could not save profile.");
    } finally {
      setUploading(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Permission to access media library is required!"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"], // ✅ Correct for latest versions
      quality: 0.7,
    });

    if (!result.canceled && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
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
    <ImageBackground
      source={require("../assets/images/background.png")} // Adjust path as needed
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Text style={styles.title}>Complete Your Profile</Text>

        {/* Profile Picture Section */}
        <View style={styles.profilePicContainer}>
          <Image
            source={
              imageUri
                ? { uri: imageUri }
                : require("../assets/images/placeholderprofilepic.png")
            }
            style={styles.imagePreview}
          />
          <Button
            title={imageUri ? "Change Your Picture" : "Select Profile Picture"}
            onPress={pickImage}
          />
        </View>
        {uploading && <ActivityIndicator size="small" color="#0000ff" />}

        <Text>Name:</Text>
        <TextInput
          value={userInfo.name}
          onChangeText={(text) =>
            setUserInfo((prev) => ({ ...prev, name: text }))
          }
          style={styles.input}
          placeholder="Enter your name"
        />

        <Text>Last Name:</Text>
        <TextInput
          value={userInfo.lastName}
          onChangeText={(text) =>
            setUserInfo((prev) => ({ ...prev, lastName: text }))
          }
          style={styles.input}
          placeholder="Enter your surname"
        />

        <Text>Street Address:</Text>
        <TextInput
          value={userInfo.streetAddress}
          onChangeText={(text) =>
            setUserInfo((prev) => ({ ...prev, streetAddress: text }))
          }
          style={styles.input}
          placeholder="Enter your address"
        />

        <Text>Postcode:</Text>
        <TextInput
          value={userInfo.postcode}
          onChangeText={(text) =>
            setUserInfo((prev) => ({ ...prev, postcode: text }))
          }
          style={styles.input}
          placeholder="Enter your postcode"
          autoCapitalize="none"
        />

        <Text>City:</Text>
        <TextInput
          value={userInfo.city}
          onChangeText={(text) =>
            setUserInfo((prev) => ({ ...prev, city: text }))
          }
          style={styles.input}
          placeholder="Enter your city"
        />

        <Text>Country:</Text>
        <TextInput
          value={userInfo.country}
          onChangeText={(text) =>
            setUserInfo((prev) => ({ ...prev, country: text }))
          }
          style={styles.input}
          placeholder="Enter your country"
        />

        <Text>Phone:</Text>
        <TextInput
          value={userInfo.phone}
          onChangeText={(text) =>
            setUserInfo((prev) => ({ ...prev, phone: text }))
          }
          style={styles.input}
          placeholder="Enter your phone number"
        />

        <Button
          title="Save Profile"
          onPress={handleSaveProfile}
          disabled={uploading}
        />

        <Button
          title="Skip for now"
          onPress={() => router.push("/profile")}
          disabled={uploading}
        />
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    padding: 30,
    width: "90%",
    height: "100%",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  profilePicContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: "white",
  },
  imagePreview: {
    width: 100,
    height: 100,
    marginVertical: 10,
    borderRadius: 50,
    alignSelf: "center",
  },
});

export default CompleteProfileScreen;
