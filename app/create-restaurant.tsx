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
import { createDatabaseEntry, updateData } from "../services/databaseActions";
import { useUser } from "../contexts/userContext";
import * as ImagePicker from "expo-image-picker";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../scripts/firebase.config";
import Checkbox from "expo-checkbox";

export default function CreateRestaurant() {
  const [restaurant, setRestaurant] = useState<{
    name: string;
    description: string;
    address: string;
    city: string;
    postcode: string;
    keywords: string[];
    phone: string;
    email: string;
    website: string;
  }>({
    name: "",
    description: "",
    address: "",
    city: "",
    postcode: "",
    keywords: [],
    phone: "",
    email: "",
    website: "",
  });

  const {
    name,
    description,
    address,
    city,
    postcode,
    phone,
    email,
    website,
    keywords,
  } = restaurant;

  // Use an array to store multiple image URIs
  const [imageUris, setImageUris] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // const [keywords, setKeywords] = useState<string[]>([]);
  const availableKeywords = [
    "Fast Food",
    "Fine Dining",
    "Casual Dining",
    "Cafe",
    "Bar",
    "Bakery",
    "Food Truck",
    "Buffet",
    "Pub",
    "Pizzeria",
    "Steakhouse",
    "Seafood",
    "Vegetarian",
    "Vegan",
    "Gluten-Free",
    "Halal",
    "Kosher",
    "Organic",
    "Asian",
    "Italian",
    "Mexican",
    "Indian",
    "Chinese",
    "Japanese",
    "Thai",
    "Mediterranean",
    "French",
    "Spanish",
    "German",
    "Greek",
    "Turkish",
    "Lebanese",
    "Brazilian",
    "Argentinian",
    "Middle Eastern",
    "American",
  ];

  const { user, setUserData } = useUser();
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
      keywords.length === 0 ||
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

      await updateData("users", user.uid, { isOwner: true });
      setUserData({ ...user, isOwner: true });

      router.push("/profile");
    } catch (err) {
      console.error("Error creating restaurant:", err);
      setError("Error creating restaurant.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeywordChange = (keyword: string, newValue: boolean) => {
    if (newValue) {
      if (keywords.length >= 3) {
        Alert.alert(
          "Maximum Selected",
          "You can only select up to 3 keywords."
        );
        return;
      }
      setRestaurant({ ...restaurant, keywords: [...keywords, keyword] });
    } else {
      setRestaurant({
        ...restaurant,
        keywords: keywords.filter((kw) => kw !== keyword),
      });
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

      <View style={styles.checksContainer}>
        <Text style={styles.checkTitle}>Keywords:</Text>
        <View style={styles.keywordsContainer}>
          {availableKeywords.map((keyword) => {
            const isSelected = keywords.includes(keyword);
            return (
              <View key={keyword} style={styles.checkboxContainer}>
                <Checkbox
                  value={isSelected}
                  // If not selected and we already have 3, disable this checkbox
                  disabled={!isSelected && keywords.length >= 3}
                  onValueChange={(newValue) =>
                    handleKeywordChange(keyword, newValue)
                  }
                  // Optional: color the checkbox when checked
                  color={isSelected ? "#4630EB" : undefined}
                />
                <Text style={styles.checkboxLabel}>{keyword}</Text>
              </View>
            );
          })}
        </View>
        <Text style={styles.selectedText}>
          Selected Keywords: {keywords.join(", ")}
        </Text>
      </View>

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

      <Button title="Cancel" onPress={() => router.push("/profile")} />
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
  checksContainer: {
    margin: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
  },
  checkTitle: {
    fontSize: 18,
    marginBottom: 8,
    fontWeight: "bold",
  },
  keywordsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "40%",
    marginRight: 16,
    marginBottom: 8,
  },
  checkboxLabel: {
    marginLeft: 8,
  },
  selectedText: {
    marginTop: 16,
    fontStyle: "italic",
  },
});
