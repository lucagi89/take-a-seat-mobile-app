import React from "react";
import { Text, View, TouchableOpacity } from "react-native";
import RestaurantFloorPlan from "@/components/RestaurantFloorPlan";
import TableList from "@/components/TableList";
import { useRestaurant } from "../../../contexts/RestaurantContext";
import { useRestaurantTables } from "@/hooks/useRestaurantTables";

export default function Tables() {
  const { restaurant, restaurantId } = useRestaurant();
  const { tables, loading } = useRestaurantTables(restaurantId);

  const [restaurantListView, setRestaurantListView] = React.useState(true);

  if (!restaurant) return <Text>Loading Tables...</Text>;

  const handleSwitchView = () => {
    setRestaurantListView((prev) => !prev);
  };

  return (
    <View style={styles.container}>
      <Text>Tables</Text>
      <TouchableOpacity
        onPress={() => handleSwitchView()}
        style={styles.switch}
      >
        <Text
          style={[
            styles.buttonSwitch,
            restaurantListView ? styles.lighter : styles.darker,
          ]}
        >
          List
        </Text>
        <Text
          style={[
            styles.buttonSwitch,
            !restaurantListView ? styles.lighter : styles.darker,
          ]}
        >
          Floorplan
        </Text>
      </TouchableOpacity>
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

import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    height: 800,
    width: "100%",
  },
  switch: {
    margin: "auto",
    width: "80%",
    height: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    borderRadius: 5,
    marginTop: 40,
    marginBottom: 10,
  },
  buttonSwitch: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ccc",
  },
  lighter: {
    backgroundColor: "#f0f0f0",
  },
  darker: {
    backgroundColor: "#ccc",
  },
});
