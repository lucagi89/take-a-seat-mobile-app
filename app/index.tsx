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
import { Slot, useRouter, useFocusEffect } from "expo-router";
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

export default function App() {
  const router = useRouter();
  const { user, userData, loading } = useUser();

  const [redirectTimerStarted, setRedirectTimerStarted] = useState(false);

  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [visibleRestaurants, setVisibleRestaurants] = useState<Restaurant[]>(
    []
  );
  // const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState<Region | null>(null);
  const [showSearchButton, setShowSearchButton] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [appUserData, setAppUserData] = useState<any>(null);
  const slideAnim = useState(new Animated.Value(-250))[0];
  const imageScaleAnim = useState(new Animated.Value(0))[0];


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

  // Animate sidebar out when screen loses focus
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

  // Animate profile image when sidebar opens
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

  // Fetch restaurants within the current map region
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

      setVisibleRestaurants(fetchedRestaurants as Restaurant[]);
    } catch (error) {
      console.error("Error fetching visible restaurants:", error);
    }
  };

  // Handle "Search Here" button
  const handleSearchHere = () => {
    if (region) {
      setShowSearchButton(false);
      setRegion({ ...region });
    }
  };

  // Update restaurants on region change
  useEffect(() => {
    if (region) {
      fetchVisibleRestaurants(region);
    }
  }, [region]);

  // Navigate to restaurant page
  const restaurantSelectionHandler = async (restaurantId: string) => {
    if (!user) {
      router.push("/login");
      return;
    }
    const userHasData = await fetchUserData(user?.uid);
    if (userHasData) {
      router.push(`/restaurant/${restaurantId}`);
    } else {
      Alert.alert("Complete Profile", "Please complete your profile.");
      router.push("/complete-profile");
    }
  };

  // Toggle sidebar animation
  const toggleSidebar = () => {
    Animated.timing(slideAnim, {
      toValue: sidebarVisible ? -250 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setSidebarVisible(!sidebarVisible));
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator size="large" color="#FFCA28" />
      </SafeAreaView>
    );
  }

  // Render the map and slot even if user is not authenticated (navigation handled by useEffect)
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
                <Text style={styles.searchButtonText}>Search Here</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.menuButton} onPress={toggleSidebar}>
              <Ionicons name="menu" size={32} color="white" />
            </TouchableOpacity>

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
                colors={["#2E7D32", "#4CAF50"]}
                style={styles.sidebarGradient}
              >
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

              <View style={styles.sidebarLinks}>
                <TouchableOpacity
                  style={styles.sidebarButton}
                  onPress={() => router.push("/profile")}
                >
                  <Ionicons name="person-outline" size={20} color="#2E7D32" />
                  <Text style={styles.sidebarLinkText}>Profile</Text>
                </TouchableOpacity>
                <View style={styles.divider} />
                <TouchableOpacity
                  style={styles.sidebarButton}
                  onPress={() => router.push("/settings")}
                >
                  <Ionicons name="settings-outline" size={20} color="#2E7D32" />
                  <Text style={styles.sidebarLinkText}>Settings</Text>
                </TouchableOpacity>
                <View style={styles.divider} />
                <TouchableOpacity
                  style={styles.sidebarButton}
                  onPress={() => router.push("/complete-profile")}
                >
                  <Ionicons name="create-outline" size={20} color="#2E7D32" />
                  <Text style={styles.sidebarLinkText}>
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
                      onPress={() => router.push("/my-restaurants")}
                    >
                      <Ionicons
                        name="restaurant-outline"
                        size={20}
                        color="#2E7D32"
                      />
                      <Text style={styles.sidebarLinkText}>My Restaurants</Text>
                    </TouchableOpacity>
                  </>
                )}
                <View style={styles.divider} />
                <TouchableOpacity
                  style={styles.sidebarButton}
                  onPress={() => router.push("/create-restaurant")}
                >
                  <Ionicons
                    name="add-circle-outline"
                    size={20}
                    color="#2E7D32"
                  />
                  <Text style={styles.sidebarLinkText}>
                    Create a Restaurant
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.sidebarFooter}>
                <TouchableOpacity
                  style={styles.logoutButton}
                  onPress={handleLogout}
                >
                  <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>

            {/* <View style={styles.slotContainer}>
              <Slot />
            </View> */}
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F5F5F5" },
  container: { flex: 1 },
  map: { flex: 1 },
  slotContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
  },
  searchButton: {
    position: "absolute",
    bottom: 90,
    alignSelf: "center",
    backgroundColor: "#2E7D32",
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
    color: "#2E7D32",
    marginBottom: 4,
  },
  menuButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#FFCA28",
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
    backgroundColor: "rgba(0, 0, 0, 0.4)",
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
  sidebarHeader: { alignItems: "center" },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: "#FFCA28",
    marginBottom: 15,
  },
  sidebarText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  sidebarLinks: { flex: 1, paddingVertical: 10, paddingHorizontal: 15 },
  sidebarButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: "#F5F5F5",
    marginVertical: 5,
  },
  sidebarLinkText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  icon: { marginRight: 10 },
  divider: { height: 1, backgroundColor: "#E0E0E0", marginVertical: 5 },
  sidebarFooter: { padding: 15, borderTopWidth: 1, borderTopColor: "#E0E0E0" },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D32F2F",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    justifyContent: "center",
  },
  logoutText: { fontSize: 16, color: "#FFFFFF", fontWeight: "600" },
});
