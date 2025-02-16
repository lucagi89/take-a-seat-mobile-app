import React, { useState } from "react";
import {
  Text,
  View,
  TextInput,
  Button,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { createDatabaseEntry } from "../services/databaseActions";
import { useUser } from "../contexts/userContext";
import * as ImagePicker from "expo-image-picker";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../scripts/firebase.config";

export default function CreateRestaurant() {
  const [restaurant, setRestaurant] = useState({
    name: "",
    description: "",
    address: "",
    city: "",
    postcode: "",
    phone: "",
    email: "",
    website: "",
  });

  const { name, description, address, city, postcode, phone, email, website } =
    restaurant;

  // Use an array to store multiple image URIs
  const [imageUris, setImageUris] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { user } = useUser();
  const router = useRouter();

  // Open the image library to pick one or more images
  const pickImages = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        "Permission Denied",
        "Permission to access the media library is required!"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      // enables multiple image selection on supported platforms
      allowsMultipleSelection: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      // Append newly selected images to the list
      setImageUris((prev) => [
        ...prev,
        ...result.assets.map((asset) => asset.uri),
      ]);
    }
  };

  // Upload a single image to Firebase Storage and return its download URL
  const uploadImageAsync = async (uri: string) => {
    const response = await fetch(uri);
    const blob = await response.blob();

    // Generate a unique filename
    const filename = `restaurant_${new Date().getTime()}_${Math.random()
      .toString(36)
      .substring(7)}`;
    const storageRef = ref(storage, `restaurants/${filename}`);

    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  };

  const handleSubmit = async () => {
    if (
      !name ||
      !description ||
      !address ||
      imageUris.length === 0 ||
      !city ||
      !postcode ||
      !phone ||
      !email ||
      !website
    ) {
      setError("Please fill out all fields and select at least one image.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      // Upload all images concurrently and wait for all download URLs
      const imageUrls = await Promise.all(
        imageUris.map((uri) => uploadImageAsync(uri))
      );
      await createDatabaseEntry(
        { ...restaurant, userId: user.uid, is_available: true, imageUrls },
        "restaurants"
      );
      router.push("/profile");
    } catch (err) {
      console.error("Error creating restaurant:", err);
      setError("Error creating restaurant.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create a Restaurant</Text>
      <Text style={styles.text}>
        Fill out the form to create a new restaurant.
      </Text>

      <Text style={styles.label}>Name:</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={(text) => setRestaurant({ ...restaurant, name: text })}
        placeholder="Restaurant Name"
      />

      <Text style={styles.label}>Street Address:</Text>
      <TextInput
        style={styles.input}
        value={address}
        onChangeText={(text) => setRestaurant({ ...restaurant, address: text })}
        placeholder="Street Address"
      />

      <Text style={styles.label}>City:</Text>
      <TextInput
        style={styles.input}
        value={city}
        onChangeText={(text) => setRestaurant({ ...restaurant, city: text })}
        placeholder="City"
      />

      <Text style={styles.label}>Postcode:</Text>
      <TextInput
        style={styles.input}
        value={postcode}
        onChangeText={(text) =>
          setRestaurant({ ...restaurant, postcode: text })
        }
        placeholder="Postcode"
      />

      <Text style={styles.label}>Phone:</Text>
      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={(text) => setRestaurant({ ...restaurant, phone: text })}
        placeholder="Phone Number"
      />

      <Text style={styles.label}>Email:</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={(text) => setRestaurant({ ...restaurant, email: text })}
        placeholder="Email Address"
      />

      <Text style={styles.label}>Website:</Text>
      <TextInput
        style={styles.input}
        value={website}
        onChangeText={(text) => setRestaurant({ ...restaurant, website: text })}
        placeholder="Website"
      />

      <Text style={styles.label}>Description:</Text>
      <TextInput
        style={[styles.input, styles.multilineInput]}
        value={description}
        onChangeText={(text) =>
          setRestaurant({ ...restaurant, description: text })
        }
        placeholder="Restaurant Description"
        multiline
        numberOfLines={4}
      />

      <Text style={styles.label}>Restaurant Images:</Text>
      <View style={styles.imagesContainer}>
        {imageUris.map((uri, index) => (
          <Image key={index} source={{ uri }} style={styles.imagePreview} />
        ))}
      </View>
      <Button title="Select Images" onPress={pickImages} />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Button title="Create Restaurant" onPress={handleSubmit} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: "center",
  },
  text: {
    marginBottom: 16,
    textAlign: "center",
  },
  label: {
    marginTop: 8,
    marginBottom: 4,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 12,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: "top",
  },
  error: {
    color: "red",
    marginBottom: 16,
    textAlign: "center",
  },
  imagesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  imagePreview: {
    width: 100,
    height: 100,
    marginRight: 8,
    marginBottom: 8,
  },
});
