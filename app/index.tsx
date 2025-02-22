import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Link, useRouter, useFocusEffect } from "expo-router";
import MapView, { Marker, Region, Callout } from "react-native-maps";
import * as Location from "expo-location";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../scripts/firebase.config";
import { checkUserData } from "../services/databaseActions";
import { useUser } from "../contexts/userContext"; // ✅ Import userData
import { Ionicons } from "@expo/vector-icons";
import { Animated } from "react-native";
import { logout } from "../services/auth";

export default function Map() {
  const { user, userData } = useUser(); // ✅ Use userData from context
  const router = useRouter();

  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [visibleRestaurants, setVisibleRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState<Region | null>(null);
  const [showSearchButton, setShowSearchButton] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const slideAnim = useState(new Animated.Value(-250))[0];
  const [selectedCuisineOne, setSelectedCuisineOne] = useState<string>("");
  const [selectedCuisineTwo, setSelectedCuisineTwo] = useState<string>("");

  const cuisineOptions = [
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

  useEffect(() => {
    const getLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission Denied", "Location access is required.");
          setLoading(false);
          return;
        }
        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);

        const userRegion = {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };

        setRegion(userRegion);
        await fetchVisibleRestaurants(userRegion);
      } catch (error) {
        console.error("Error fetching location:", error);
      } finally {
        setLoading(false);
      }
    };

    getLocation();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        Animated.timing(slideAnim, {
          toValue: -250,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setSidebarVisible(false));
      };
    }, [])
  );

  const fetchVisibleRestaurants = async (mapRegion: Region) => {
    if (!mapRegion) return;

    const { latitude, longitude, latitudeDelta, longitudeDelta } = mapRegion;
    const latMin = latitude - latitudeDelta / 2;
    const latMax = latitude + latitudeDelta / 2;
    const lonMin = longitude - longitudeDelta / 2;
    const lonMax = longitude + longitudeDelta / 2;

    try {
      const restaurantsRef = collection(db, "restaurants");
      const q = query(
        restaurantsRef,
        where("latitude", ">=", latMin),
        where("latitude", "<=", latMax),
        where("longitude", ">=", lonMin),
        where("longitude", "<=", lonMax)
      );
      const querySnapshot = await getDocs(q);
      const fetchedRestaurants = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Apply cuisine filters
      const filteredRestaurants = fetchedRestaurants.filter((restaurant) =>
        [
          restaurant.cuisine_one,
          restaurant.cuisine_two,
          restaurant.cuisine_three,
        ].some(
          (cuisine) =>
            (selectedCuisineOne && cuisine === selectedCuisineOne) ||
            (selectedCuisineTwo && cuisine === selectedCuisineTwo)
        )
      );

      setVisibleRestaurants(fetchedRestaurants);
    } catch (error) {
      console.error("Error fetching visible restaurants:", error);
    }
  };

  const handleSearchHere = () => {
    if (region) {
      fetchVisibleRestaurants(region);
    }
  };

  const restaurantSelectionHandler = async (restaurantId: string) => {
    const userHasData = await checkUserData(user?.uid);
    if (userHasData) {
      router.push({ pathname: `/restaurant/${restaurantId}` });
    } else {
      Alert.alert(
        "Complete Profile",
        "Please complete your profile before selecting a restaurant."
      );
      router.push("/complete-profile");
    }
  };

  const toggleSidebar = () => {
    Animated.timing(slideAnim, {
      toValue: sidebarVisible ? -250 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setSidebarVisible(!sidebarVisible));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#0000ff"
            style={styles.loader}
          />
        ) : (
          region && (
            <>
              <MapView
                style={styles.map}
                showsUserLocation={true}
                showsMyLocationButton={true}
                showsCompass={true}
                region={region}
                onRegionChangeComplete={(newRegion) => {
                  setRegion(newRegion);
                  setShowSearchButton(true);
                }}
              >
                {visibleRestaurants.map((restaurant) => (
                  <Marker
                    key={restaurant.id}
                    coordinate={{
                      latitude: restaurant.latitude,
                      longitude: restaurant.longitude,
                    }}
                    pinColor={restaurant.is_available ? "green" : "red"}
                  >
                    <Callout
                      onPress={() => restaurantSelectionHandler(restaurant.id)}
                    >
                      <View>
                        <Text style={styles.calloutTitle}>
                          {restaurant.name}
                        </Text>
                        <Text>{restaurant.address}</Text>
                        <Text>{`${restaurant.cuisine_one}, ${restaurant.cuisine_two}, ${restaurant.cuisine_three}`}</Text>
                      </View>
                    </Callout>
                  </Marker>
                ))}
              </MapView>

              <View style={styles.filterContainer}>
                <Text style={styles.filterTitle}>Filter by Cuisines:</Text>

                <Picker
                  selectedValue={selectedCuisineOne}
                  onValueChange={(itemValue) =>
                    setSelectedCuisineOne(itemValue)
                  }
                  style={styles.picker}
                >
                  <Picker.Item label="Select Cuisine One" value="" />
                  {cuisineOptions.map((cuisine) => (
                    <Picker.Item
                      key={cuisine}
                      label={cuisine}
                      value={cuisine}
                    />
                  ))}
                </Picker>

                <Picker
                  selectedValue={selectedCuisineTwo}
                  onValueChange={(itemValue) =>
                    setSelectedCuisineTwo(itemValue)
                  }
                  style={styles.picker}
                >
                  <Picker.Item label="Select Cuisine Two" value="" />
                  {cuisineOptions.map((cuisine) => (
                    <Picker.Item
                      key={cuisine}
                      label={cuisine}
                      value={cuisine}
                    />
                  ))}
                </Picker>

                <TouchableOpacity
                  style={styles.searchButton}
                  onPress={handleSearchHere}
                >
                  <Text style={styles.searchButtonText}>Filter</Text>
                </TouchableOpacity>
              </View>

              {showSearchButton && (
                <TouchableOpacity
                  style={styles.searchButton}
                  onPress={handleSearchHere}
                >
                  <Text style={styles.searchButtonText}>Search Here</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.menuButton}
                onPress={toggleSidebar}
              >
                <Ionicons name="menu" size={32} color="white" />
              </TouchableOpacity>

              <Animated.View
                style={[
                  styles.sidebar,
                  { transform: [{ translateX: slideAnim }] },
                ]}
              >
                {/* ✅ Use userData instead of user for updated info */}
                {userData?.photoURL && (
                  <Image
                    source={{ uri: userData.photoURL }}
                    style={styles.profileImage}
                  />
                )}
                <Text style={styles.sidebarText}>
                  Welcome, {userData?.name || user?.displayName}
                </Text>
                <Link href="/profile">Profile</Link>
                <Link href="/settings">Settings</Link>
                <Link href="/complete-profile">
                  {userData?.isProfileComplete
                    ? "Edit Profile"
                    : "Complete Profile"}
                </Link>
                {userData?.isOwner && (
                  <Link href="/my-restaurants">My Restaurants</Link>
                )}
                <Link href="/create-restaurant">Create a Restaurant</Link>
                <TouchableOpacity onPress={async () => await logout()}>
                  <Text style={{ color: "red", fontWeight: "bold" }}>
                    Logout
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            </>
          )
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, paddingTop: 40 },
  container: { flex: 1 },
  map: { flex: 1 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  searchButton: {
    position: "absolute",
    bottom: 80,
    alignSelf: "center",
    backgroundColor: "rgba(23, 9, 175, 0.5)",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  searchButtonText: { color: "white", fontWeight: "bold", fontSize: 16 },
  calloutTitle: { fontWeight: "bold", fontSize: 16, marginBottom: 4 },
  menuButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#1E90FF",
    padding: 12,
    borderRadius: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  sidebar: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 250,
    height: "100%",
    backgroundColor: "#fff",
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 10,
  },
  sidebarText: { fontSize: 18, fontWeight: "bold", marginBottom: 20 },
  profileImage: { width: 60, height: 60, borderRadius: 30, marginBottom: 20 },
  filterContainer: {
    position: "absolute",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    top: 20,
    padding: 10,
    borderRadius: 10,
    shadowColor: "#000",
  },

  picker: {
    width: 100,
    height: 30,
    marginBottom: 10,
    backgroundColor: "#fff",
    color: "black",
  },
});
