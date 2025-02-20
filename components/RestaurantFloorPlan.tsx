import { View, Text } from "react-native";
import { useEffect, useState } from "react";
import { findRestaurantTables } from "../services/databaseActions";
import { DocumentData } from "firebase/firestore";
import Draggable from "react-native-draggable";
import { updateTablePosition } from "../services/databaseActions"; // Import update function

type Props = {
  restaurantId: string;
};

export default function RestaurantFloorPlan(props) {
  // useEffect(() => {
  //   if (!restaurantId) return;

  //   const fetchTables = async () => {
  //     try {
  //       const tablesData = await findRestaurantTables(restaurantId);
  //       setTables(tablesData);
  //     } catch (error) {
  //       console.error("Error fetching tables:", error);
  //     }
  //   };

  //   fetchTables();
  // }, [restaurantId]);

  const floorTables = props.tables;

  return (
    <View
      style={{
        width: 300,
        height: 400,
        backgroundColor: "#f0f0f0",
        position: "relative",
        marginTop: 20,
      }}
    >
      {floorTables.map((table) => (
        <Draggable
          key={table.id}
          x={table.x}
          y={table.y}
          onDragRelease={(event, gestureState) => {
            const newX = gestureState.moveX;
            const newY = gestureState.moveY;
            updateTablePosition(table.id, newX, newY); // Save new position
          }}
        >
          <View
            style={{
              width: table.width,
              height: table.height,
              backgroundColor: table.isAvailable ? "green" : "red",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>
              {table.capacity}
            </Text>
          </View>
        </Draggable>
      ))}
    </View>
  );
}
