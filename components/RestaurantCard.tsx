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
  handleToggleFavouriteRestaurant,
}: Props) {
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
  } = restaurant || {};

  console.log(restaurant?.id);

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
      {handleToggleFavouriteRestaurant && (
        <TouchableOpacity onPress={() => handleToggleFavouriteRestaurant(id)}>
          <Text>X</Text>
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
