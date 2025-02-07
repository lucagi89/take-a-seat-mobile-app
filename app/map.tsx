import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, SafeAreaView, Alert } from "react-native";
import { Link } from "expo-router";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { generateFakeRestaurants } from "@/data/data";

export default function Map() {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [fakeRestaurants, setFakeRestaurants] = useState<any[]>([]);

  useEffect(() => {
    let locationSubscription: Location.LocationSubscription | null = null;

    const initialize = async () => {
      try {
        // Request location permission
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission Denied", "Location access is required.");
          return;
        }

        // Generate fake restaurant data
        const restaurants = await generateFakeRestaurants();
        setFakeRestaurants(restaurants);

        // Get current location
        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);

        // Watch for continuous location updates
        locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 1000,
            distanceInterval: 1,
          },
          (newLocation) => setLocation(newLocation)
        );
      } catch (error) {
        console.error("Error initializing app:", error);
      }
    };

    initialize();

    // Cleanup location watcher on unmount
    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>London Map</Text>
        <Link href="/">Go back</Link>
      </View>

      <MapView
        style={styles.map}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
        initialRegion={{
          latitude: 51.5074, // London Latitude
          longitude: -0.1278, // London Longitude
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {fakeRestaurants.map((restaurant) =>
          restaurant.latitude && restaurant.longitude ? (
            <Marker
              key={restaurant.id}
              coordinate={{
                latitude: restaurant.latitude,
                longitude: restaurant.longitude,
              }}
              title={restaurant.name}
              pinColor={restaurant.is_available ? "green" : "red"}
              description={restaurant.address}
            />
          ) : null
        )}

        <Marker
          coordinate={{ latitude: 51.5074, longitude: -0.1278 }}
          title="London"
        />
      </MapView>
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
});
