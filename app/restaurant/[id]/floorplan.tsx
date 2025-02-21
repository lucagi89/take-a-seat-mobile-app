import React from "react";
import { Text, View } from "react-native";
import RestaurantFloorPlan from "@/components/RestaurantFloorPlan";
import { useRestaurant } from "./RestaurantContext";

export default function Floorplan() {
  const { restaurant, restaurantId } = useRestaurant();
  if (!restaurant) return <Text>Loading Floorplan...</Text>;

  return (
    <View>
      <Text>Floorplan</Text>;
      <RestaurantFloorPlan
        restaurant={restaurant}
        restaurantId={restaurantId}
      />
    </View>
  );
}
