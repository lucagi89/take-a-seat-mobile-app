import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Link, useRouter } from "expo-router";
import MapView, { Marker, Region, Callout } from "react-native-maps";
import * as Location from "expo-location";
// import { fakeRestaurants } from "../data/data";
import { fetchData } from "../services/databaseActions";

export default function Map() {
  const router = useRouter();

  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [allRestaurants, setAllRestaurants] = useState<any[]>([]);
  const [visibleRestaurants, setVisibleRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState<Region | null>(null);
  const [showSearchButton, setShowSearchButton] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const restaurants = await fetchData("restaurants");
        setAllRestaurants(restaurants);
      } catch (error) {
        console.error("Error loading restaurants:", error);
      }
    };

    fetchRestaurants();
  }, []);

  useEffect(() => {
    const getLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission Denied", "Location access is required.");
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
        filterMarkersInRegion(userRegion, allRestaurants);
      } catch (error) {
        console.error("Error fetching location:", error);
      } finally {
        setLoading(false);
      }
    };

    getLocation();
  }, []);

  const filterMarkersInRegion = useCallback(
    (mapRegion: Region, restaurants = allRestaurants) => {
      const { latitude, longitude, latitudeDelta, longitudeDelta } = mapRegion;

      const latMin = latitude - latitudeDelta / 2;
      const latMax = latitude + latitudeDelta / 2;
      const lonMin = longitude - longitudeDelta / 2;
      const lonMax = longitude + longitudeDelta / 2;

      const filtered = restaurants.filter(
        (restaurant) =>
          restaurant.latitude >= latMin &&
          restaurant.latitude <= latMax &&
          restaurant.longitude >= lonMin &&
          restaurant.longitude <= lonMax
      );

      setVisibleRestaurants(filtered);
      setShowSearchButton(false);
    },
    [allRestaurants]
  );

  const handleSearchHere = () => {
    if (region) {
      filterMarkersInRegion(region);
      setRefreshKey((prevKey) => prevKey + 1);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Map</Text>
        <Link href="/">Go back</Link>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
      ) : (
        region && (
          <>
            <MapView
              key={refreshKey}
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
                    onPress={() => router.push(`/restaurant/${restaurant.id}`)}
                  >
                    <View>
                      <Text style={styles.calloutTitle}>{restaurant.name}</Text>
                      <Text>{restaurant.address}</Text>
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
          </>
        )
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 50,
    backgroundColor: "lightblue",
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  map: {
    flex: 1,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
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
  searchButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  calloutTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
  },
});
