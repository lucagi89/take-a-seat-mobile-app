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
} from "react-native";
import { updateProfile, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { addDocument } from "../services/databaseActions";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import * as ImagePicker from "expo-image-picker";
import { db, storage, auth } from "../scripts/firebase.config";
import { useRouter } from "expo-router";
import { useUser } from "../contexts/userContext";
// import placeholderImage from '../assets/images/placeholderprofilepic.png'

const CompleteProfileScreen = () => {
  const router = useRouter();
  const { setUserData } = useUser();

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

        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const existingUserData = userDoc.data();
            console.log("Existing user data:", existingUserData);
            setUserInfo({
              name: existingUserData.name || "",
              lastName: existingUserData.lastName || "",
              streetAddress: existingUserData.streetAddress || "",
              postcode: existingUserData.postcode || "",
              country: existingUserData.country || "",
              city: existingUserData.city || "",
              phone: existingUserData.phone || "",
            });
            // If there's a photoURL in Firestore, set it as the image URI.
            if (existingUserData.photoURL) {
              setImageUri(existingUserData.photoURL);
            } else if (user.photoURL) {
              // Alternatively, check the Auth user object.
              setImageUri(user.photoURL);
            }
          } else if (user.photoURL) {
            // If no Firestore document but Auth has a photoURL
            setImageUri(user.photoURL);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Function to open the image library and pick an image
  const pickImage = async () => {
    // Ask for permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Permission to access media library is required!"
      );
      return;
    }

    // Launch the image library
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
    });

    if (!result.canceled) {
      if (result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    }
  };

  // Function to upload the image to Firebase Storage
  const uploadImageAsync = async (uri: string) => {
    // Convert the image URI to a blob
    const response = await fetch(uri);
    const blob = await response.blob();

    // Create a unique file name
    const filename = `profile_${new Date().getTime()}`;
    const storageRef = ref(storage, `profilePics/${userId}/${filename}`);

    // Upload the image
    const snapshot = await uploadBytes(storageRef, blob);
    // Retrieve the image's download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
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
      // If an image is selected, upload it to Firebase Storage
      if (imageUri) {
        photoURL = await uploadImageAsync(imageUri);
      }

      // Update Firebase Auth with displayName and photoURL (if available)
      await updateProfile(auth.currentUser!, {
        displayName: userInfo.name,
        ...(photoURL && { photoURL }),
      });

      // Save user data in Firestore, including the photoURL if the image was uploaded
      await setDoc(
        doc(db, "users", userId),
        {
          ...userInfo,
          isProfileComplete: true,
          isOwner: false,
          ...(photoURL && { photoURL }),
        },
        { merge: true }
      );

      // Update the user context with the new data
      setUserData({
        ...userInfo,
        isProfileComplete: true,
        isOwner: false,
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    width: "100%",
    justifyContent: "center",
    borderWidth: 10,
    borderColor: "#ccc",
    borderRadius: 10,
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
