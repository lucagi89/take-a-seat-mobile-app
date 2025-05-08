import { useEffect, useState } from "react";
import { db } from "../scripts/firebase.config";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { Region } from "react-native-maps";
import { Restaurant } from "../data/types";
import { useUser } from "../contexts/userContext";

export const useRestaurants = (region: Region | null) => {
  const [visibleRestaurants, setVisibleRestaurants] = useState<Restaurant[]>(
    []
  );
  const { user } = useUser();

  useEffect(() => {
    if (!region || !user) return;

    const { latitude, longitude, latitudeDelta, longitudeDelta } = region;
    const latMin = latitude - latitudeDelta / 2;
    const latMax = latitude + latitudeDelta / 2;
    const lonMin = longitude - longitudeDelta / 2;
    const lonMax = longitude + longitudeDelta / 2;

    const restaurantsRef = collection(db, "restaurants");

    const q = query(
      restaurantsRef,
      where("latitude", ">=", latMin),
      where("latitude", "<=", latMax),
      where("longitude", ">=", lonMin),
      where("longitude", "<=", lonMax)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const restaurants = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setVisibleRestaurants(restaurants as Restaurant[]);
      },
      (error) => {
        console.error("Real-time listener error:", error);
      }
    );

    // Clean up listener when region changes or component unmounts
    return () => unsubscribe();
  }, [region]);

  return { visibleRestaurants };
};
