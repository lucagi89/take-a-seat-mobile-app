import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { fetchDocument } from "../services/databaseActions";
import { Restaurant } from "../data/types";

type Props = {
  restaurant?: Restaurant;
  restaurantID?: string;
  handleToggleFavouriteRestaurant?: (id: string) => void;
};

export default function RestaurantCard({
  restaurant,
  restaurantID,
  handleToggleFavouriteRestaurant,
}: Props) {
  const [fetchedRestaurant, setFetchedRestaurant] = useState<Restaurant | null>(
    null
  );

  useEffect(() => {
    const fetchData = async () => {
      if (!restaurant && restaurantID && typeof restaurantID === "string") {
        try {
          const doc = await fetchDocument("restaurants", restaurantID);
          setFetchedRestaurant(doc);
        } catch (error) {
          console.error("Failed to fetch restaurant:", error);
        }
      } else if (!restaurantID) {
        console.warn("No valid restaurantID provided to fetchDocument()");
      }
    };
    fetchData();
  }, [restaurant, restaurantID]);


  const data = restaurant || fetchedRestaurant;

  if (!data) return null;

  const {
    name,
    description,
    streetAddress,
    city,
    postcode,
    phone,
    email,
    website,
    id,
  } = data;

  return (
    <View style={styles.card}>
      {name && <Text style={styles.name}>{name}</Text>}
      {description && <Text style={styles.description}>{description}</Text>}
      {streetAddress && (
        <Text style={styles.address}>
          {streetAddress}, {city}, {postcode}
        </Text>
      )}
      {(phone || email || website) && (
        <Text style={styles.contact}>
          {phone} | {email} | {website}
        </Text>
      )}
      {handleToggleFavouriteRestaurant && id && (
        <TouchableOpacity onPress={() => handleToggleFavouriteRestaurant(id)}>
          <Text>Toggle Favourite</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginVertical: 8,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
  },
  description: {
    fontSize: 14,
    color: "#666",
  },
  address: {
    fontSize: 14,
    color: "#666",
  },
  contact: {
    fontSize: 14,
    color: "#666",
  },
});
