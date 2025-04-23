import { useEffect, useState } from "react";
import { db } from "../scripts/firebase.config"; // Adjust the import based on your project structure
import { collection, getDocs, query, where } from "firebase/firestore";
import { Region } from "react-native-maps";
import { Restaurant } from "../data/types"; // Adjust the import based on your project structure

export const useRestaurants = (region: Region | null) => {
  const [visibleRestaurants, setVisibleRestaurants] = useState<Restaurant[]>(
    []
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
      setVisibleRestaurants(fetchedRestaurants as Restaurant[]);
    } catch (error) {
      console.error("Error fetching visible restaurants:", error);
    }
  };

  useEffect(() => {
    if (region) {
      fetchVisibleRestaurants(region);
    }
  }, [region]);

  return { visibleRestaurants, fetchVisibleRestaurants };
};
