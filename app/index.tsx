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

  // Redirect to login if the user is not authenticated
  // useEffect(() => {
  //   if (!user) {
  //     router.push("/login");
  //   }
  // }, [user, router]);

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

  // Fetches restaurants within the current map region
  const fetchVisibleRestaurants = async (mapRegion: Region) => {
    if (!mapRegion) return;

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
            color="#0000ff"
            style={styles.loader}
          />
        </View>
      </SafeAreaView>
    );
  }

  // If user is not authenticated, return null (navigation is handled by useEffect)
  if (!user) {
    return null; // The useEffect above will handle the redirect
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
                <Text style={styles.searchButtonText}>Search Here</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.menuButton} onPress={toggleSidebar}>
              <Ionicons name="menu" size={32} color="white" />
            </TouchableOpacity>

            <Animated.View
              style={[
                styles.sidebar,
                { transform: [{ translateX: slideAnim }] },
              ]}
            >
              {userData?.photoURL ? (
                <Image
                  source={{ uri: userData.photoURL }}
                  style={styles.profileImage}
                />
              ) : (
                <Ionicons name="person-circle" size={60} color="black" />
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
              <TouchableOpacity onPress={handleLogout}>
                <Text style={{ color: "red", fontWeight: "bold" }}>Logout</Text>
              </TouchableOpacity>
            </Animated.View>
          </>
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
});
