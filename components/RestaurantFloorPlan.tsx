import { View, Text, TouchableOpacity, Alert, Platform } from "react-native";
import { useState, useEffect } from "react";
import Draggable from "react-native-draggable";
import {
  updateTablePosition,
  deleteTable,
  updateTableAvailability,
  findRestaurantTables,
} from "../services/databaseActions";
import { useUser } from "../contexts/userContext";

const getTableSize = (capacity: number) => {
  if (capacity <= 4) return { width: 50, height: 50 };
  if (capacity <= 6) return { width: 100, height: 50 };
  if (capacity <= 8) return { width: 150, height: 50 };
  return { width: 200, height: 50 };
};

interface Table {
  id: string;
  x: number;
  y: number;
  capacity: number;
  isAvailable: boolean;
}

interface RestaurantFloorPlanProps {
  restaurant: any;
  restaurantId: string;
}

export default function RestaurantFloorPlan({
  restaurant,
  restaurantId,
}: RestaurantFloorPlanProps) {
  const { user } = useUser();
  const userId = user?.uid;
  const ownerId = restaurant?.userId;
  const isOwner = userId === ownerId;
  const [localTables, setLocalTables] = useState<Table[]>([]);

  // Ensure state updates when tables prop changes
  // useEffect(() => {
  //   setLocalTables(tables);
  // }, [tables]);

  useEffect(() => {
    if (!restaurant) return;

    const fetchTables = async () => {
      try {
        const tablesData = await findRestaurantTables(restaurantId);
        setLocalTables(tablesData);
      } catch (error) {
        console.error("Error fetching tables:", error);
      }
    };

    fetchTables();
  }, []);

  const handleTablePress = (table: Table) => {
    if (isOwner) {
      Alert.alert("Manage Table", "Choose an action", [
        {
          text: "Remove Table",
          onPress: () => removeTable(table.id),
          style: "destructive",
        },
        {
          text: table.isAvailable ? "Close Table" : "Open Table",
          onPress: () => toggleTableAvailability(table.id),
        },
        { text: "Cancel", style: "cancel" },
      ]);
    } else {
      if (Platform.OS === "ios") {
        Alert.prompt(
          "Book Table",
          "Enter party size",
          (partySizeStr) => {
            const partySize = parseInt(partySizeStr, 10);
            if (isNaN(partySize) || partySize <= 0) {
              Alert.alert("Invalid Input", "Enter a valid party size.");
              return;
            }
            handleBooking(table, partySize);
          },
          "plain-text"
        );
      } else {
        // TODO: Implement Android booking input modal
        Alert.alert("Booking", "Please enter your party size manually.");
      }
    }
  };

  const removeTable = (tableId: string) => {
    deleteTable(tableId); // Update database first

    setLocalTables((prevTables) =>
      prevTables.filter((table) => table.id !== tableId)
    );
  };

  const toggleTableAvailability = (tableId: string) => {
    setLocalTables((prev) =>
      prev.map((table) =>
        table.id === tableId
          ? { ...table, isAvailable: !table.isAvailable }
          : table
      )
    );

    // Ensure database update happens after state change
    const newAvailability = !localTables.find((table) => table.id === tableId)
      ?.isAvailable;
    updateTableAvailability(tableId, newAvailability);
  };

  const handleBooking = (table: Table, partySize: number) => {
    if (partySize > table.capacity) {
      Alert.alert("Too Many People", "Please select a larger table.");
    } else if (table.capacity - partySize >= 3) {
      Alert.alert("Table Too Big", "Consider choosing a smaller table.");
    } else {
      Alert.alert("Booking Confirmed", `Table booked for ${partySize} people.`);
    }
  };

  return (
    <View
      style={{
        width: "100%",
        height: 400,
        backgroundColor: "#f0f0f0",
        position: "relative",
        marginTop: 20,
        borderWidth: 1,
        borderColor: "black",
      }}
    >
      {localTables.map((table) => {
        const { width, height } = getTableSize(table.capacity);
        return (
          <Draggable
            key={table.id}
            x={table.x ?? 0}
            y={table.y ?? 0}
            disabled={!isOwner} // Only allow dragging if owner
            onDragRelease={(event, gestureState) => {
              if (isOwner) {
                const newX =
                  event.nativeEvent.pageX - gestureState.moveX + table.x;
                const newY =
                  event.nativeEvent.pageY - gestureState.moveY + table.y;

                setLocalTables((prev) =>
                  prev.map((t) =>
                    t.id === table.id ? { ...t, x: newX, y: newY } : t
                  )
                );

                // Update database with new position
                updateTablePosition(table.id, newX, newY);
              }
            }}
          >
            <TouchableOpacity onPress={() => handleTablePress(table)}>
              <View
                style={{
                  width,
                  height,
                  backgroundColor: table.isAvailable ? "green" : "red",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 5,
                  borderWidth: 1,
                  borderColor: "black",
                }}
              >
                <Text style={{ color: "white", fontWeight: "bold" }}>
                  {table.capacity}
                </Text>
              </View>
            </TouchableOpacity>
          </Draggable>
        );
      })}
    </View>
  );
}
