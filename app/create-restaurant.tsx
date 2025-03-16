import React, { useState } from "react";
import {
  Text,
  View,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image,
  Alert,
  Switch,
  TouchableOpacity,
  Platform,
  ImageBackground,
} from "react-native";
import { useRouter } from "expo-router";
import {
  createNewRestaurant,
  updateDocument,
} from "../services/databaseActions";
import { useUser } from "../contexts/userContext";
import * as ImagePicker from "expo-image-picker";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../scripts/firebase.config";
import Checkbox from "expo-checkbox";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Restaurant } from "../data/types";
import { availableKeywords } from "../data/variables";
import { tamplateRestaurant } from "../data/variables";

export default function CreateRestaurant() {
  const [restaurant, setRestaurant] =
    useState<Omit<Restaurant, "id">>(tamplateRestaurant);
  const [imageUris, setImageUris] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user, userData, setUserData } = useUser();
  const router = useRouter();

  if (!user) {
    router.push("/login");
    return null;
  } else if (!userData) {
    alert("Please complete your profile first.");
    router.push("/complete-profile");
    return null;
  }

  const [isContinuousOpening, setIsContinuousOpening] = useState(true);
  const [showPicker, setShowPicker] = useState<{ [key: string]: boolean }>({
    openingHours: false,
    closingHours: false,
    secondOpeningHours: false,
    secondClosingHours: false,
  });
  const [times, setTimes] = useState({
    openingHours: new Date(),
    closingHours: new Date(),
    secondOpeningHours: new Date(),
    secondClosingHours: new Date(),
  });

  const {
    name,
    description,
    streetAddress,
    city,
    postcode,
    phone,
    email,
    website,
    keywords,
  } = restaurant;

  const showTimePicker = (field: keyof typeof times) => {
    setShowPicker((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleTimeChange = (
    event: any,
    selectedTime: Date | undefined,
    field: keyof typeof times
  ) => {
    setShowPicker((prev) => ({
      ...prev,
      [field]: Platform.OS === "android" ? false : prev[field],
    }));
    if (selectedTime) {
      setTimes((prev) => ({ ...prev, [field]: selectedTime }));
      setRestaurant((prev) => ({ ...prev, [field]: selectedTime }));
    }
  };

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
      allowsMultipleSelection: true,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUris((prev) => [
        ...prev,
        ...result.assets.map((asset) => asset.uri),
      ]);
    }
  };

  const uploadImageAsync = async (uri: string) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const filename = `restaurant_${new Date().getTime()}_${Math.random()
      .toString(36)
      .substring(7)}`;
    const storageRef = ref(storage, `restaurants/${filename}`);
    await uploadBytes(storageRef, blob);
    return await getDownloadURL(storageRef);
  };

  const handleSubmit = async () => {
    if (
      !name ||
      !description ||
      !streetAddress ||
      imageUris.length === 0 ||
      !city ||
      !postcode ||
      keywords.length === 0 ||
      !phone ||
      !email ||
      !website ||
      !restaurant.openingHours ||
      !restaurant.closingHours ||
      (!isContinuousOpening &&
        (!restaurant.secondOpeningHours || !restaurant.secondClosingHours))
    ) {
      setError("Please fill out all required fields.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const imageUrls = await Promise.all(
        imageUris.map((uri) => uploadImageAsync(uri))
      );
      await createNewRestaurant(
        { ...restaurant, userId: user.uid, isAvailable: true, imageUrls },
        "restaurants"
      );
      await updateDocument("users", user.uid, { isOwner: true });
      if (user) setUserData({ ...user, isOwner: true });
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
    <ImageBackground
      source={require("../assets/images/background.png")} // Adjust path as needed
      style={styles.background}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Create a Restaurant</Text>
          <Text style={styles.subtitle}>
            Fill out the form to add your restaurant
          </Text>

          <Text style={styles.label}>Name:</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={(text) =>
              setRestaurant({ ...restaurant, name: text })
            }
            placeholder="Restaurant Name"
            placeholderTextColor="#666"
          />

          <Text style={styles.label}>Street Address:</Text>
          <TextInput
            style={styles.input}
            value={streetAddress}
            onChangeText={(text) =>
              setRestaurant({ ...restaurant, streetAddress: text })
            }
            placeholder="Street Address"
            placeholderTextColor="#666"
          />

          <Text style={styles.label}>City:</Text>
          <TextInput
            style={styles.input}
            value={city}
            onChangeText={(text) =>
              setRestaurant({ ...restaurant, city: text })
            }
            placeholder="City"
            placeholderTextColor="#666"
          />

          <Text style={styles.label}>Postcode:</Text>
          <TextInput
            style={styles.input}
            value={postcode}
            onChangeText={(text) =>
              setRestaurant({ ...restaurant, postcode: text })
            }
            placeholder="Postcode"
            placeholderTextColor="#666"
          />

          <Text style={styles.label}>Country:</Text>
          <TextInput
            style={styles.input}
            value={restaurant.country}
            onChangeText={(text) =>
              setRestaurant({ ...restaurant, country: text })
            }
            placeholder="Country"
            placeholderTextColor="#666"
          />

          <Text style={styles.label}>Phone:</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={(text) =>
              setRestaurant({ ...restaurant, phone: text })
            }
            placeholder="Phone Number"
            placeholderTextColor="#666"
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Email:</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={(text) =>
              setRestaurant({ ...restaurant, email: text })
            }
            placeholder="Email Address"
            placeholderTextColor="#666"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Website:</Text>
          <TextInput
            style={styles.input}
            value={website}
            onChangeText={(text) =>
              setRestaurant({ ...restaurant, website: text })
            }
            placeholder="Website"
            placeholderTextColor="#666"
            keyboardType="url"
          />

          <View style={styles.switchContainer}>
            <Text style={styles.label}>Continuous Opening?</Text>
            <Switch
              value={isContinuousOpening}
              onValueChange={(value) => {
                setIsContinuousOpening(value);
                if (value)
                  setRestaurant({
                    ...restaurant,
                    secondOpeningHours: "",
                    secondClosingHours: "",
                  });
              }}
              trackColor={{ false: "#767577", true: "#C8E6C9" }}
              thumbColor={isContinuousOpening ? "#2E7D32" : "#f4f3f4"}
            />
          </View>

          <Text style={styles.label}>Opening Hours:</Text>
          <TouchableOpacity
            onPress={() => showTimePicker("openingHours")}
            style={styles.timePicker}
          >
            <Text style={styles.timeText}>
              {restaurant.openingHours
                ? new Date(restaurant.openingHours).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Select Time"}
            </Text>
          </TouchableOpacity>
          {showPicker.openingHours && (
            <DateTimePicker
              value={times.openingHours}
              mode="time"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              textColor="black"
              onChange={(e, t) => handleTimeChange(e, t, "openingHours")}
            />
          )}

          <Text style={styles.label}>Closing Hours:</Text>
          <TouchableOpacity
            onPress={() => showTimePicker("closingHours")}
            style={styles.timePicker}
          >
            <Text style={styles.timeText}>
              {restaurant.closingHours
                ? new Date(restaurant.closingHours).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Select Time"}
            </Text>
          </TouchableOpacity>
          {showPicker.closingHours && (
            <DateTimePicker
              value={times.closingHours}
              mode="time"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              textColor="black"
              onChange={(e, t) => handleTimeChange(e, t, "closingHours")}
            />
          )}

          {!isContinuousOpening && (
            <>
              <Text style={styles.label}>Second Opening Hours:</Text>
              <TouchableOpacity
                onPress={() => showTimePicker("secondOpeningHours")}
                style={styles.timePicker}
              >
                <Text style={styles.timeText}>
                  {restaurant.secondOpeningHours
                    ? new Date(
                        restaurant.secondOpeningHours
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Select Time"}
                </Text>
              </TouchableOpacity>
              {showPicker.secondOpeningHours && (
                <DateTimePicker
                  value={times.secondOpeningHours}
                  mode="time"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  textColor="black"
                  onChange={(e, t) =>
                    handleTimeChange(e, t, "secondOpeningHours")
                  }
                />
              )}

              <Text style={styles.label}>Second Closing Hours:</Text>
              <TouchableOpacity
                onPress={() => showTimePicker("secondClosingHours")}
                style={styles.timePicker}
              >
                <Text style={styles.timeText}>
                  {restaurant.secondClosingHours
                    ? new Date(
                        restaurant.secondClosingHours
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Select Time"}
                </Text>
              </TouchableOpacity>
              {showPicker.secondClosingHours && (
                <DateTimePicker
                  value={times.secondClosingHours}
                  mode="time"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  textColor="black"
                  onChange={(e, t) =>
                    handleTimeChange(e, t, "secondClosingHours")
                  }
                />
              )}
            </>
          )}

          <View style={styles.checksContainer}>
            <Text style={styles.checkTitle}>Keywords (Select up to 3):</Text>
            <View style={styles.keywordsContainer}>
              {availableKeywords.map((keyword) => {
                const isSelected = keywords.includes(keyword);
                return (
                  <View key={keyword} style={styles.checkboxContainer}>
                    <Checkbox
                      value={isSelected}
                      disabled={!isSelected && keywords.length >= 3}
                      onValueChange={(newValue) =>
                        handleKeywordChange(keyword, newValue)
                      }
                      color={isSelected ? "#2E7D32" : undefined}
                    />
                    <Text style={styles.checkboxLabel}>{keyword}</Text>
                  </View>
                );
              })}
            </View>
            <Text style={styles.selectedText}>
              Selected: {keywords.join(", ")}
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
            placeholderTextColor="#666"
            multiline
            numberOfLines={4}
          />

          <Text style={styles.label}>Restaurant Images:</Text>
          <View style={styles.imagesContainer}>
            {imageUris.map((uri, index) => (
              <Image key={index} source={{ uri }} style={styles.imagePreview} />
            ))}
          </View>
          <TouchableOpacity
            style={styles.button}
            onPress={pickImages}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>Select Images</Text>
          </TouchableOpacity>

          {error && <Text style={styles.errorText}>{error}</Text>}

          {loading ? (
            <ActivityIndicator
              size="large"
              color="#2E7D32"
              style={styles.loader}
            />
          ) : (
            <TouchableOpacity
              style={styles.button}
              onPress={handleSubmit}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>Create Restaurant</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.push("/profile")}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    flexGrow: 1,
    padding: 20,
    backgroundColor: "rgba(240, 236, 227, 0.7)", // Light overlay for wood texture
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2E7D32",
    textAlign: "center",
    marginBottom: 10,
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
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginTop: 10,
    marginBottom: 5,
    alignSelf: "flex-start",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#C8E6C9",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: "#FFFFFF",
    fontSize: 16,
    color: "#333",
  },
  multilineInput: {
    height: 100,
    textAlignVertical: "top",
  },
  errorText: {
    color: "#D32F2F",
    fontSize: 14,
    marginBottom: 15,
    textAlign: "center",
  },
  imagesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 15,
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 10,
    marginBottom: 10,
  },
  checksContainer: {
    width: "100%",
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#E8F5E9",
    marginVertical: 10,
  },
  checkTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2E7D32",
    marginBottom: 10,
  },
  keywordsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "48%",
    marginBottom: 10,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 14,
    color: "#333",
  },
  selectedText: {
    fontSize: 14,
    color: "#666",
    marginTop: 10,
    fontStyle: "italic",
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginVertical: 10,
  },
  timePicker: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#C8E6C9",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    marginBottom: 15,
  },
  timeText: {
    fontSize: 16,
    color: "#333",
  },
  button: {
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
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  cancelButton: {
    backgroundColor: "#D32F2F",
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
  cancelButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  loader: {
    marginVertical: 20,
  },
});
