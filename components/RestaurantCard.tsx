import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

import { Restaurant } from "../data/types";

export default function RestaurantCard({
  restaurant,
}: {
  restaurant: Restaurant;
}) {
  const {
    name,
    description,
    streetAddress,
    city,
    postcode,
    phone,
    email,
    website,
  } = restaurant;
  return (
    <View style={styles.card}>
      {/* <Image source={{ uri: image }} style={styles.image} /> */}
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.description}>{description}</Text>
      <Text style={styles.address}>
        {streetAddress}, {city}, {postcode}
      </Text>
      <Text style={styles.contact}>
        {phone} | {email} | {website}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 10,
    marginBottom: 20,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
  },
  image: {
    width: 100,
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 5,
  },
  description: {
    marginBottom: 5,
  },
  address: {
    marginBottom: 5,
  },
  contact: {
    color: "#666",
  },
});
