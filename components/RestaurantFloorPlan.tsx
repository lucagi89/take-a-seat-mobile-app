import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Platform,
  StyleSheet,
  Animated,
  Dimensions,
  PanResponder,
} from "react-native";
import {
  updateTablePosition,
  deleteDocument,
  updateTableAvailability,
  findRestaurantTables,
  addDocument,
} from "../services/databaseActions";
import { useUser } from "../contexts/userContext";
import { Timestamp } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";

// Define table size based on capacity
const getTableSize = (capacity: number): { width: number; height: number } => {
  if (capacity <= 4) return { width: 50, height: 50 };
  if (capacity <= 6) return { width: 80, height: 50 };
  if (capacity <= 8) return { width: 110, height: 50 };
  return { width: 140, height: 50 };
};

// Define interfaces
interface Table {
  id: string;
  x: number;
  y: number;
  capacity: number;
  isAvailable: boolean;
}

interface Position {
  x: number;
  y: number;
}

interface RestaurantFloorPlanProps {
  restaurant: any; // Replace with a specific type if available
  restaurantId: string;
}

const RestaurantFloorPlan: React.FC<RestaurantFloorPlanProps> = ({
  restaurant,
  restaurantId,
}) => {
  const { user } = useUser();
  const userId = user?.uid;
  const ownerId = restaurant?.userId;
  const isOwner = userId === ownerId;
  const [localTables, setLocalTables] = useState<Table[]>([]);
  const positionsRef = useRef<Record<string, Position>>({});
  const scaleAnims = useRef<Record<string, Animated.Value>>({}).current;
  const panAnims = useRef<Record<string, Animated.ValueXY>>({}).current;

  // Initialize animations and positions
  useEffect(() => {
    localTables.forEach((table) => {
      if (!scaleAnims[table.id]) {
        scaleAnims[table.id] = new Animated.Value(1);
      }
      if (!panAnims[table.id]) {
        panAnims[table.id] = new Animated.ValueXY({
          x: table.x,
          y: table.y,
        });
      }
    });

    Object.keys(scaleAnims).forEach((id) => {
      if (!localTables.find((table) => table.id === id)) {
        delete scaleAnims[id];
      }
    });
    Object.keys(panAnims).forEach((id) => {
      if (!localTables.find((table) => table.id === id)) {
        delete panAnims[id];
      }
    });
  }, [localTables]);

  // Fetch tables on mount
  useEffect(() => {
    if (!restaurantId) return;

    const fetchTables = async () => {
      try {
        const tablesData = await findRestaurantTables(restaurantId);
        const positions = tablesData.reduce((acc, table) => {
          acc[table.id] = { x: table.x, y: table.y };
          return acc;
        }, {} as Record<string, Position>);
        positionsRef.current = positions;
        setLocalTables(tablesData);
      } catch (error) {
        console.error("Error fetching tables:", error);
      }
    };

    fetchTables();
  }, [restaurantId]);

  const handleTablePress = (table: Table) => {
    if (!scaleAnims[table.id]) {
      scaleAnims[table.id] = new Animated.Value(1);
    }

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
      delete panAnims[tableId];
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

  const createPanResponder = (table: Table) => {
    const { width, height } = getTableSize(table.capacity);
    const containerWidth = Dimensions.get("window").width;
    const containerHeight = 400; // Matches floorPlanContainer height

    return PanResponder.create({
      onStartShouldSetPanResponder: () => isOwner, // Only owner can drag
      onMoveShouldSetPanResponder: () => isOwner, // Ensure move events are captured
      onPanResponderGrant: () => {
        panAnims[table.id].flattenOffset(); // Reset accumulated offset
      },
      onPanResponderMove: (evt, gestureState) => {
        const newX =
          (positionsRef.current[table.id]?.x ?? table.x) + gestureState.dx;
        const newY =
          (positionsRef.current[table.id]?.y ?? table.y) + gestureState.dy;

        // Boundary checking
        const minX = 0;
        const maxX = containerWidth - width;
        const minY = 0;
        const maxY = containerHeight - height;

        const clampedX = Math.max(minX, Math.min(maxX, newX));
        const clampedY = Math.max(minY, Math.min(maxY, newY));

        panAnims[table.id].setValue({ x: clampedX, y: clampedY });
      },
      onPanResponderRelease: async (evt, gestureState) => {
        const newX = panAnims[table.id].x._value;
        const newY = panAnims[table.id].y._value;

        positionsRef.current[table.id] = { x: newX, y: newY };
        setLocalTables((prev) =>
          prev.map((t) => (t.id === table.id ? { ...t, x: newX, y: newY } : t))
        );

        try {
          const updateResult = await updateTablePosition(table.id, newX, newY);
          if (!updateResult?.success) {
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
      },
    });
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
            <Text style={styles.emptyText}>No tables set</Text>
          </View>
        ) : (
          localTables.map((table) => {
            const { width, height } = getTableSize(table.capacity);
            if (!scaleAnims[table.id]) {
              scaleAnims[table.id] = new Animated.Value(1);
            }
            if (!panAnims[table.id]) {
              panAnims[table.id] = new Animated.ValueXY({
                x: table.x,
                y: table.y,
              });
            }

            // Ensure a minimum touchable area of 48x48px
            const touchableArea = Math.max(width, 48);
            const offsetX = (touchableArea - width) / 2;
            const offsetY = (touchableArea - height) / 2;

            return (
              <Animated.View
                key={table.id}
                {...createPanResponder(table).panHandlers}
                style={[
                  styles.tableWrapper,
                  {
                    width: touchableArea,
                    height: touchableArea,
                    transform: [
                      { translateX: panAnims[table.id].x },
                      { translateY: panAnims[table.id].y },
                    ],
                  },
                ]}
              >
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
                      marginLeft: offsetX,
                      marginTop: offsetY,
                    },
                  ]}
                >
                  <TouchableOpacity
                    onPress={() => handleTablePress(table)}
                    style={styles.touchableOverlay}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.tableText}>{table.capacity}</Text>
                    <Text style={styles.tableLabel}>Seats</Text>
                  </TouchableOpacity>
                </Animated.View>
              </Animated.View>
            );
          })
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  floorPlanWrapper: {
    marginTop: 5,
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 5,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 12,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: "#333",
    fontWeight: "500",
  },
  floorPlanContainer: {
    width: "100%",
    height: 400,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
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
  tableWrapper: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  touchableOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  table: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
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
    fontSize: 14,
    fontWeight: "bold",
  },
  tableLabel: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "500",
    opacity: 0.8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
  },
});

export default RestaurantFloorPlan;
