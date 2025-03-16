import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Platform,
  StyleSheet,
  Animated,
} from "react-native";
import Draggable from "react-native-draggable";
import {
  updateTablePosition,
  deleteDocument,
  updateTableAvailability,
  findRestaurantTables,
  addDocument,
} from "../services/databaseActions";
import { useUser } from "../contexts/userContext";
import { Timestamp } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons"; // For legend icons

const getTableSize = (capacity: number) => {
  if (capacity <= 4) return { width: 50, height: 50 };
  if (capacity <= 6) return { width: 80, height: 50 };
  if (capacity <= 8) return { width: 110, height: 50 };
  return { width: 140, height: 50 };
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
  const scaleAnims = useRef<Record<string, Animated.Value>>({}).current;

  // Initialize scale animations for all tables when localTables changes
  useEffect(() => {
    localTables.forEach((table) => {
      if (!scaleAnims[table.id]) {
        scaleAnims[table.id] = new Animated.Value(1);
      }
    });

    // Clean up unused animations
    Object.keys(scaleAnims).forEach((id) => {
      if (!localTables.find((table) => table.id === id)) {
        delete scaleAnims[id];
      }
    });
  }, [localTables]);

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
  }, [restaurantId, localTables.length]);

  const handleTablePress = (table: Table) => {
    // Ensure animation exists before triggering
    if (!scaleAnims[table.id]) {
      scaleAnims[table.id] = new Animated.Value(1);
    }

    // Animate on press
    Animated.sequence([
      Animated.timing(scaleAnims[table.id], {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnims[table.id], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

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
      delete scaleAnims[tableId];
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
      try {
        const bookedTime = Timestamp.fromDate(new Date());
        const limitTime = Timestamp.fromDate(
          new Date(new Date().getTime() + 15 * 60 * 1000)
        );

        await addDocument(
          {
            userId,
            restaurantId,
            tableId: table.id,
            partySize,
            bookedTime,
            limitTime,
            isApproved: true,
            isFullfilled: true,
            isExpired: false,
          },
          "bookings"
        );

        await updateTableAvailability(table.id, false);

        setLocalTables((prevTables) =>
          prevTables.map((t) =>
            t.id === table.id ? { ...t, isAvailable: false } : t
          )
        );

        Alert.alert(
          "Booking Confirmed",
          `Table booked for ${partySize} people. We will notify you once the booking is approved. Once it is approved, you will have 15 minutes to arrive before the booking falls off.`
        );
      } catch (error) {
        console.error("Error creating booking:", error);
        Alert.alert("Error", "Could not create booking. Please try again.");
      }
    }
  };

  return (
    <View style={styles.floorPlanWrapper}>
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: "#2E7D32" }]} />
          <Text style={styles.legendText}>Available</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: "#D32F2F" }]} />
          <Text style={styles.legendText}>Unavailable</Text>
        </View>
      </View>
      <View style={styles.floorPlanContainer}>
        {localTables.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="restaurant-outline" size={40} color="#666" />
            <Text style={styles.emptyText}>No tables available</Text>
          </View>
        ) : (
          localTables.map((table) => {
            const { width, height } = getTableSize(table.capacity);
            const { x, y } = positionsRef.current[table.id] || {
              x: table.x,
              y: table.y,
            };

            // Ensure animation exists
            if (!scaleAnims[table.id]) {
              scaleAnims[table.id] = new Animated.Value(1);
            }

            return (
              <Draggable
                key={table.id}
                x={positionsRef.current[table.id]?.x ?? table.x}
                y={positionsRef.current[table.id]?.y ?? table.y}
                disabled={!isOwner}
                onDrag={(event, gestureState) => {
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

                  try {
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
                  <Animated.View
                    style={[
                      styles.table,
                      {
                        width,
                        height,
                        backgroundColor: table.isAvailable
                          ? "#2E7D32"
                          : "#D32F2F",
                        transform: [{ scale: scaleAnims[table.id] }],
                      },
                    ]}
                  >
                    <Text style={styles.tableText}>{table.capacity}</Text>
                    <Text style={styles.tableLabel}>Seats</Text>
                  </Animated.View>
                </TouchableOpacity>
              </Draggable>
            );
          })
        )}
      </View>
    </View>
  );
}

// In RestaurantFloorPlan.js
const styles = StyleSheet.create({
  floorPlanWrapper: {
    marginTop: 5, // Reduced margin
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 5, // Reduced margin
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 12, // Reduced margin
  },
  legendColor: {
    width: 16, // Reduced size
    height: 16, // Reduced size
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12, // Reduced font size
    color: "#333",
    fontWeight: "500",
  },
  floorPlanContainer: {
    width: "100%",
    height: 400, // Reduced height to fit within parent container
    backgroundColor: "#FFFFFF",
    borderRadius: 12, // Reduced border radius
    borderWidth: 1,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    position: "relative",
    overflow: "hidden",
  },
  table: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6, // Reduced border radius
    borderWidth: 2,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  tableText: {
    color: "#FFFFFF",
    fontSize: 14, // Reduced font size
    fontWeight: "bold",
  },
  tableLabel: {
    color: "#FFFFFF",
    fontSize: 10, // Reduced font size
    fontWeight: "500",
    opacity: 0.8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14, // Reduced font size
    color: "#666",
    marginTop: 8,
    textAlign: "center",
  },
});
