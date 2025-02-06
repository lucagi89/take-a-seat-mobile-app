import React from "react";
import { useState, useEffect } from "react";
import { StyleSheet, View, Text, SafeAreaView } from "react-native";
import { Link } from "expo-router";
import MapView, { Marker, AnimatedRegion } from "react-native-maps";
import * as Location from "expo-location";

export default function Map() {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );

  useEffect(() => {
    (async () => {
      // Request permission
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }

      // Get current location
      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);

      // Watch for continuous updates
      const locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000, // Update every second
          distanceInterval: 1, // Update every 1 meter
        },
        (newLocation) => {
          setLocation(newLocation);
        }
      );

      // Clean up the subscription on unmount
      return () => {
        locationSubscription.remove();
      };
    })();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ height: 50, backgroundColor: "lightblue" }}>
        <Text>London Map</Text>
        <Link href="/">Go back</Link>
      </View>

      <MapView
        style={styles.map}
        showsUserLocation={true} // ✅ Shows the blue dot
        followsUserLocation={true} // ✅ Keeps the map centered on the user
        showsMyLocationButton={true}
        showsCompass={true}
        initialRegion={{
          latitude: 51.5074, // London Latitude
          longitude: -0.1278, // London Longitude
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        <Marker
          coordinate={{ latitude: 51.5074, longitude: -0.1278 }}
          title="London"
        />
      </MapView>
    </SafeAreaView>
  );
}

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   map: {
//     flex: 1,
//   },
// });

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  arrowContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  arrow: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderTopWidth: 20,
    borderRightWidth: 10,
    borderBottomWidth: 0,
    borderLeftWidth: 10,
    borderTopColor: "blue",
    borderRightColor: "transparent",
    borderBottomColor: "transparent",
    borderLeftColor: "transparent",
    transform: [{ rotate: "0deg" }],
  },
});
