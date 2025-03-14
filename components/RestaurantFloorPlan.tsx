import { View, Text, TouchableOpacity, Alert, Platform } from "react-native";
import { useState, useEffect, useRef } from "react";
import Draggable from "react-native-draggable";
import {
  updateTablePosition,
  deleteDocument,
  updateTableAvailability,
  findRestaurantTables,
  addDocument,
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
  const positionsRef = useRef<Record<string, { x: number; y: number }>>({});

  // Fetch tables once on mount
  useEffect(() => {
    if (!restaurantId) return;

    const fetchTables = async () => {
      try {
        const tablesData = await findRestaurantTables(restaurantId);

        // Initialize both state and positionsRef
        const positions = tablesData.reduce((acc, table) => {
          acc[table.id] = { x: table.x, y: table.y };
          return acc;
        }, {} as Record<string, { x: number; y: number }>);

        positionsRef.current = positions;
        setLocalTables(tablesData);
      } catch (error) {
        console.error("Error fetching tables:", error);
      }
    };

    fetchTables();
  }, [restaurantId]);

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
        Alert.alert("Booking", "Please enter your party size manually.");
      }
    }
  };

  const removeTable = async (tableId: string) => {
    try {
      await deleteDocument("tables", tableId);
      setLocalTables((prevTables) =>
        prevTables.filter((table) => table.id !== tableId)
      );
      delete positionsRef.current[tableId];
    } catch (error) {
      console.error("Error removing table:", error);
    }
  };

  const toggleTableAvailability = async (tableId: string) => {
    const table = localTables.find((t) => t.id === tableId);
    if (!table) return;

    const newAvailability = !table.isAvailable;

    try {
      await updateTableAvailability(tableId, newAvailability);
      setLocalTables((prev) =>
        prev.map((t) =>
          t.id === tableId ? { ...t, isAvailable: newAvailability } : t
        )
      );
    } catch (error) {
      console.error("Error updating availability:", error);
    }
  };

  const handleBooking = async (table: Table, partySize: number) => {
    if (partySize > table.capacity) {
      Alert.alert("Too Many People", "Please select a larger table.");
    } else if (table.capacity - partySize >= 3) {
      Alert.alert("Table Too Big", "Consider choosing a smaller table.");
    } else {
      // if user paid booking fee
      await addDocument(
        {
          userId,
          restaurantId,
          tableId: table.id,
          partySize,
          bookedTime: new Date(), //now
          limitTime: new Date(new Date().getTime() + 15 * 60 * 1000), //now plus 15 minutes
          isApproved: true, //to modify later and set to false, restaurant owner will have to approve
          isFullfilled: true, //to modify later and set to false, user has to actually arrive
          isExpired: false,
        },
        "bookings"
      );

      updateTableAvailability(table.id, false);

      setLocalTables((prevTables) =>
        prevTables.map((t) =>
          t.id === table.id ? { ...t, isAvailable: false } : t
        )
      );

      Alert.alert(
        "Booking Confirmed",
        `Table booked for ${partySize} people. We will notify you once the booking is approved. Once it is approved, you will have 15 minutes to arrive before the booking falls off.`
      );
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
        const { x, y } = positionsRef.current[table.id] || {
          x: table.x,
          y: table.y,
        };

        return (
          <Draggable
            key={table.id}
            x={positionsRef.current[table.id]?.x ?? table.x}
            y={positionsRef.current[table.id]?.y ?? table.y}
            disabled={!isOwner}
            onDrag={(event, gestureState) => {
              // ✅ Update the ref live as the user drags
              const newX =
                (positionsRef.current[table.id]?.x ?? table.x) +
                gestureState.dx;
              const newY =
                (positionsRef.current[table.id]?.y ?? table.y) +
                gestureState.dy;

              positionsRef.current[table.id] = { x: newX, y: newY };

              setLocalTables((prev) =>
                prev.map((t) =>
                  t.id === table.id ? { ...t, x: newX, y: newY } : t
                )
              );
            }}
            onDragRelease={async (event, gestureState) => {
              if (!isOwner) return;

              const finalX = positionsRef.current[table.id]?.x ?? table.x;
              const finalY = positionsRef.current[table.id]?.y ?? table.y;

              // console.log(`Final table position: X:${finalX}, Y:${finalY}`);

              try {
                // ✅ Save final position to DB
                const updateResult = await updateTablePosition(
                  table.id,
                  finalX,
                  finalY
                );

                if (updateResult?.success) {
                  console.log("Database update successful", updateResult);
                } else {
                  console.error("Database update failed", updateResult);
                  Alert.alert("Error", "Failed to update table position.");
                }
              } catch (error) {
                console.error("Error during table position update:", error);
                Alert.alert(
                  "Error",
                  "An error occurred while updating table position."
                );
              }
            }}
          >
            <TouchableOpacity onPress={() => handleTablePress(table)}>
              <View
                style={{
                  width: getTableSize(table.capacity).width,
                  height: getTableSize(table.capacity).height,
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
