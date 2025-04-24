import React from "react";
import { Text, View } from "react-native";
import RestaurantFloorPlan from "@/components/RestaurantFloorPlan";
import { useRestaurant } from "../../../contexts/RestaurantContext";

export default function Floorplan() {
  const { restaurant, restaurantId } = useRestaurant();
  if (!restaurant) return <Text>Loading Floorplan...</Text>;

  return (
    <View style={{ padding: 20, height: 800 }}>
      <Text>Floorplan</Text>
      <RestaurantFloorPlan
        restaurant={restaurant}
        restaurantId={restaurantId}
      />
    </View>
  );
}
