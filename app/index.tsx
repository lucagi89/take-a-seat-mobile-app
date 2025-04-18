import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Text,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import MapView, { Marker, Callout } from "react-native-maps";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useUser } from "../contexts/userContext";
import { useLocation } from "../hooks/useLocation";
import { useRestaurants } from "../hooks/useRestaurants";
import { fetchUserData } from "../services/databaseActions";
import { useSidebarAnimation } from "../hooks/useSidebarAnimation";
import { Sidebar, SearchButton } from "../components/ComponentsForMap";
import { styles } from "../styles/main-page-style";

export default function App() {
  const router = useRouter();
  const { user, userData, loading } = useUser();
  const {
    location,
    region,
    setRegion,
    loading: locationLoading,
  } = useLocation();
  const { visibleRestaurants, fetchVisibleRestaurants } =
    useRestaurants(region);
  const [showSearchButton, setShowSearchButton] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const { slideAnim, imageScaleAnim, toggleSidebar } = useSidebarAnimation();

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        toggleSidebar(false);
        setSidebarVisible(false);
      };
    }, [])
  );

  const handleSearchHere = () => {
    if (region) {
      setShowSearchButton(false);
      fetchVisibleRestaurants(region);
    }
  };

  const restaurantSelectionHandler = async (restaurantId: string) => {
    if (!user) {
      router.push("/login");
      return;
    }
    const userHasData = await fetchUserData(user.uid);
    if (userHasData) {
      router.push(`/restaurant/${restaurantId}`);
    } else {
      Alert.alert("Complete Profile", "Please complete your profile.");
      router.push("/complete-profile");
    }
  };

  if (loading || locationLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator size="large" color="#FFCA28" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {region && (
          <>
            <MapView
              style={styles.map}
              showsUserLocation
              showsMyLocationButton
              showsCompass
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
            <SearchButton
              showSearchButton={showSearchButton}
              onPress={handleSearchHere}
            />
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => toggleSidebar(!sidebarVisible)}
            >
              <Ionicons name="menu" size={32} color="white" />
            </TouchableOpacity>
            <Sidebar
              sidebarVisible={sidebarVisible}
              toggleSidebar={() => toggleSidebar(!sidebarVisible)}
              user={user}
              userData={userData}
              slideAnim={slideAnim}
              imageScaleAnim={imageScaleAnim}
              router={router}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
