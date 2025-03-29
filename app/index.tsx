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
import { Link, useRouter, useFocusEffect } from "expo-router";
import MapView, { Marker, Region, Callout } from "react-native-maps";
import * as Location from "expo-location";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../scripts/firebase.config";
import { fetchUserData } from "../services/databaseActions";
import { useUser } from "../contexts/userContext";
import { Ionicons } from "@expo/vector-icons";
import { Animated } from "react-native";
import { handleLogout } from "../services/auth";
import { Restaurant } from "../data/types";
import { LinearGradient } from "expo-linear-gradient";

export default function Map() {
  const { user, userData } = useUser();
  const router = useRouter();

  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [visibleRestaurants, setVisibleRestaurants] = useState<Restaurant[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState<Region | null>(null);
  const [showSearchButton, setShowSearchButton] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const slideAnim = useState(new Animated.Value(-250))[0];
  const imageScaleAnim = useState(new Animated.Value(0))[0];

  // Fetches and sets the user's current location and nearby restaurants on component mount.
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

  // Animates the sidebar out of view when the screen loses focus.
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

  // Animates the profile image when the sidebar opens
  useEffect(() => {
    if (sidebarVisible) {
      Animated.spring(imageScaleAnim, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } else {
      imageScaleAnim.setValue(0);
    }
  }, [sidebarVisible]);

  // Fetches restaurants within the current map region
  const fetchVisibleRestaurants = async (mapRegion: Region) => {
    if (!mapRegion) return;
    if (!user) return;

    const { latitude, longitude, latitudeDelta, longitudeDelta } = mapRegion;
    const latMin = latitude - latitudeDelta / 2;
    const latMax = latitude + latitudeDelta / 2;
    const lonMin = longitude - longitudeDelta / 2;
    const lonMax = longitude + longitudeDelta / 2;

    try {
      const restaurantsRef = collection(db, "restaurants");
      if (!restaurantsRef) return;
      const q = query(
        restaurantsRef,
        where("latitude", ">=", latMin),
        where("latitude", "<=", latMax),
        where("longitude", ">=", lonMin),
        where("longitude", "<=", lonMax)
      );
      console.log("Querying for visible restaurants...", q);
      const querySnapshot = await getDocs(q);
      const fetchedRestaurants = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setVisibleRestaurants(fetchedRestaurants as Restaurant[]);
    } catch (error) {
      console.error("Error fetching visible restaurants:", error);
    }
  };

  // Handles the "search here" button press to fetch restaurants within the current map region.
  const handleSearchHere = () => {
    if (region) {
      setShowSearchButton(false);
      setRegion({ ...region });
    }
  };

  // Fetches and sets the visible restaurants whenever the map region changes.
  useEffect(() => {
    if (region) {
      fetchVisibleRestaurants(region);
    }
  }, [region]);

  // Navigates to the selected restaurant's page.
  const restaurantSelectionHandler = async (restaurantId: string) => {
    if (!user) {
      router.push("/login");
    }
    const userHasData = await fetchUserData(user?.uid);
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

  // Animates the sidebar in and out of view.
  const toggleSidebar = () => {
    Animated.timing(slideAnim, {
      toValue: sidebarVisible ? -250 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setSidebarVisible(!sidebarVisible));
  };

  // If loading, show the activity indicator
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <ActivityIndicator
            size="large"
            color="#FFCA28"
            style={styles.loader}
          />
        </View>
      </SafeAreaView>
    );
  }

  // If user is not authenticated, return null (navigation is handled by useEffect)
  if (!user) {
    return null;
  }

  // Main render when user is authenticated and loading is complete
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {region && (
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
                  pinColor={restaurant.isAvailable ? "green" : "red"}
                >
                  <Callout
                    onPress={() => restaurantSelectionHandler(restaurant.id)}
                  >
                    <View>
                      <Text style={styles.calloutTitle}>{restaurant.name}</Text>
                      <Text>{restaurant.streetAddress}</Text>
                      <Text>{`${restaurant.cuisine_one}, ${restaurant.cuisine_two}, ${restaurant.cuisine_three}`}</Text>
                    </View>
                  </Callout>
                </Marker>
              ))}
            </MapView>

            {showSearchButton && (
              <TouchableOpacity
                style={styles.searchButton}
                onPress={handleSearchHere}
              >
                <Text style={styles.searchButtonText} selectable={false}>
                  Search Here
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.menuButton} onPress={toggleSidebar}>
              <Ionicons name="menu" size={32} color="white" />
            </TouchableOpacity>

            {/* Overlay to close sidebar when tapping outside */}
            {sidebarVisible && (
              <TouchableOpacity
                style={styles.overlay}
                onPress={toggleSidebar}
                activeOpacity={1}
              />
            )}

            <Animated.View
              style={[
                styles.sidebar,
                { transform: [{ translateX: slideAnim }] },
              ]}
            >
              <LinearGradient
                colors={["#2E7D32", "#4CAF50"]} // Gradient from deep green to lighter green
                style={styles.sidebarGradient}
              >
                {/* Header Section */}
                <View style={styles.sidebarHeader}>
                  <Animated.View
                    style={{ transform: [{ scale: imageScaleAnim }] }}
                  >
                    {userData?.photoURL ? (
                      <Image
                        source={{ uri: userData.photoURL }}
                        style={styles.profileImage}
                      />
                    ) : (
                      <Ionicons
                        name="person-circle"
                        size={70}
                        color="#FFCA28"
                      />
                    )}
                  </Animated.View>
                  <Text style={styles.sidebarText}>
                    Welcome, {userData?.name || user?.displayName || "Guest"}
                  </Text>
                </View>
              </LinearGradient>

              {/* Navigation Links */}
              <View style={styles.sidebarLinks}>
                <TouchableOpacity
                  style={styles.sidebarButton}
                  activeOpacity={0.7}
                  onPress={() => router.push("/profile")}
                >
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color="#2E7D32"
                    style={styles.icon}
                  />
                  <Text style={styles.sidebarLinkText} selectable={false}>
                    Profile
                  </Text>
                </TouchableOpacity>
                <View style={styles.divider} />
                <TouchableOpacity
                  style={styles.sidebarButton}
                  activeOpacity={0.7}
                  onPress={() => router.push("/settings")}
                >
                  <Ionicons
                    name="settings-outline"
                    size={20}
                    color="#2E7D32"
                    style={styles.icon}
                  />
                  <Text style={styles.sidebarLinkText} selectable={false}>
                    Settings
                  </Text>
                </TouchableOpacity>
                <View style={styles.divider} />
                <TouchableOpacity
                  style={styles.sidebarButton}
                  activeOpacity={0.7}
                  onPress={() => router.push("/complete-profile")}
                >
                  <Ionicons
                    name="create-outline"
                    size={20}
                    color="#2E7D32"
                    style={styles.icon}
                  />
                  <Text style={styles.sidebarLinkText} selectable={false}>
                    {userData?.isProfileComplete
                      ? "Edit Profile"
                      : "Complete Profile"}
                  </Text>
                </TouchableOpacity>
                {userData?.isOwner && (
                  <>
                    <View style={styles.divider} />
                    <TouchableOpacity
                      style={styles.sidebarButton}
                      activeOpacity={0.7}
                      onPress={() => router.push("/my-restaurants")}
                    >
                      <Ionicons
                        name="restaurant-outline"
                        size={20}
                        color="#2E7D32"
                        style={styles.icon}
                      />
                      <Text style={styles.sidebarLinkText} selectable={false}>
                        My Restaurants
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
                <View style={styles.divider} />
                <TouchableOpacity
                  style={styles.sidebarButton}
                  activeOpacity={0.7}
                  onPress={() => router.push("/create-restaurant")}
                >
                  <Ionicons
                    name="add-circle-outline"
                    size={20}
                    color="#2E7D32"
                    style={styles.icon}
                  />
                  <Text style={styles.sidebarLinkText} selectable={false}>
                    Create a Restaurant
                  </Text>
                </TouchableOpacity>
              </View>
              {/* Footer Section (Logout) */}
              <View style={styles.sidebarFooter}>
                <TouchableOpacity
                  style={styles.logoutButton}
                  onPress={handleLogout}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="log-out-outline"
                    size={20}
                    color="#FFFFFF"
                    style={styles.icon}
                  />
                  <Text style={styles.logoutText} selectable={false}>
                    Logout
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F5F5", // Light gray background
  },
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.1)", // Light overlay for loading
  },
  searchButton: {
    position: "absolute",
    bottom: 90,
    alignSelf: "center",
    backgroundColor: "#2E7D32", // Deep green for restaurant theme
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  searchButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
    textTransform: "uppercase",
  },
  calloutTitle: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#2E7D32", // Deep green for restaurant name
    marginBottom: 4,
  },
  menuButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#FFCA28", // Gold for a warm accent
    padding: 12,
    borderRadius: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)", // Semi-transparent black overlay
  },
  sidebar: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 250,
    height: "100%",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 10,
  },
  sidebarGradient: {
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  sidebarHeader: {
    alignItems: "center",
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: "#FFCA28", // Gold border for profile image
    marginBottom: 15,
  },
  sidebarText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF", // White text for contrast on gradient
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  sidebarLinks: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  sidebarButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: "#F5F5F5", // Light gray for buttons
    marginVertical: 5,
  },
  sidebarLinkText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
    textDecorationLine: "none", // Remove default link underline
  },
  icon: {
    marginRight: 10,
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 5,
  },
  sidebarFooter: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D32F2F", // Red for logout button
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    justifyContent: "center",
  },
  logoutText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
