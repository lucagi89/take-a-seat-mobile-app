import React from "react";
import { Text, View } from "react-native";
import RestaurantFloorPlan from "@/components/RestaurantFloorPlan";
import TableList from "@/components/TableList";
import { useRestaurant } from "../../../contexts/RestaurantContext";
import { useRestaurantTables } from "@/hooks/useRestaurantTables";

export default function Tables() {
  const { restaurant, restaurantId } = useRestaurant();
  const { tables, loading } = useRestaurantTables(restaurantId);

  const [restaurantListView, setRestaurantListView] = React.useState(false);

  if (!restaurant) return <Text>Loading Tables...</Text>;

  return (
    <View style={{ padding: 20, height: 800 }}>
      <Text>Floorplan</Text>
      //need to add a button to toggle between list and floorplan view
      <Text
        onPress={() => setRestaurantListView((prev) => !prev)}
        style={{
          padding: 10,
          backgroundColor: restaurantListView ? "blue" : "green",
          color: "white",
          textAlign: "center",
          borderRadius: 5,
          marginBottom: 10,
        }}
      >
        {restaurantListView ? "Floorplan" : "List"}
      </Text>
      {!restaurantListView ? (
        <RestaurantFloorPlan
          restaurant={restaurant}
          restaurantId={restaurantId}
        />
      ) : (
        <TableList restaurantId={restaurantId} />
      )}
    </View>
  );
}
