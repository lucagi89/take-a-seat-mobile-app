import React, { useEffect, useRef } from "react";
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
  addDocument,
} from "../services/databaseActions";
import { useUser } from "../contexts/userContext";
import { Timestamp } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import { useRestaurantTables } from "../hooks/useRestaurantTables";
import { Restaurant, Table } from "../data/types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const getTableSize = (capacity: number) => {
  if (capacity <= 4) return { width: 50, height: 50 };
  if (capacity <= 6) return { width: 80, height: 50 };
  if (capacity <= 8) return { width: 110, height: 50 };
  return { width: 140, height: 50 };
};

interface Props {
  restaurant: Restaurant;
  restaurantId: string;
}

const RestaurantFloorPlan: React.FC<Props> = ({ restaurant, restaurantId }) => {
  const { user } = useUser();
  const { tables } = useRestaurantTables(restaurantId);
  const userId = user?.uid;
  const ownerId = restaurant.userId;
  const isOwner = userId === ownerId;

  const scaleAnims = useRef<Record<string, Animated.Value>>({}).current;
  const panAnims = useRef<Record<string, Animated.ValueXY>>({}).current;

  // Sync animations on every tables update
  useEffect(() => {
    tables.forEach((table) => {
      // init scale
      if (!scaleAnims[table.id]) {
        scaleAnims[table.id] = new Animated.Value(1);
      }
      // init or update pan
      if (!panAnims[table.id]) {
        panAnims[table.id] = new Animated.ValueXY({ x: table.x, y: table.y });
      } else {
        panAnims[table.id].setValue({ x: table.x, y: table.y });
      }
    });
    // cleanup removed tables
    Object.keys(panAnims).forEach((id) => {
      if (!tables.find((t) => t.id === id)) {
        delete panAnims[id];
        delete scaleAnims[id];
      }
    });
  }, [tables]);

  const handleTablePress = (table: Table) => {
    const scale = scaleAnims[table.id];
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
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
          onPress: () => toggleAvailability(table.id),
        },
        { text: "Cancel", style: "cancel" },
      ]);
    } else {
      const promptFn = Platform.OS === "ios" ? Alert.prompt : Alert.prompt;
      promptFn(
        "Book Table",
        "Enter party size",
        async (input) => {
          const size = parseInt(input, 10);
          if (!size || size <= 0)
            return Alert.alert("Invalid Input", "Enter a valid party size.");
          await handleBooking(table, size);
        },
        "plain-text"
      );
    }
  };

  const removeTable = async (id: string) => {
    await deleteDocument("tables", id);
  };

  const toggleAvailability = async (id: string) => {
    const tbl = tables.find((t) => t.id === id);
    if (!tbl) return;
    await updateTableAvailability(id, !tbl.isAvailable);
  };

  const handleBooking = async (table: Table, partySize: number) => {
    if (partySize > table.capacity)
      return Alert.alert("Too Many People", "Please select a larger table.");
    if (table.capacity - partySize >= 3)
      return Alert.alert("Table Too Big", "Consider a smaller table.");

    const bookedTime = Timestamp.fromDate(new Date());
    const limitTime = Timestamp.fromDate(new Date(Date.now() + 15 * 60000));

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
    Alert.alert("Booking Confirmed", `Table booked for ${partySize} people.`);
  };

  const createPanResponder = (table: Table) => {
    const { width, height } = getTableSize(table.capacity);
    const cw = SCREEN_WIDTH;
    const ch = 400;

    return PanResponder.create({
      onStartShouldSetPanResponder: () => isOwner,
      onMoveShouldSetPanResponder: () => isOwner,
      onPanResponderGrant: () => panAnims[table.id].flattenOffset(),
      onPanResponderMove: (_, gs) => {
        const nx = (panAnims[table.id].x._value ?? table.x) + gs.dx;
        const ny = (panAnims[table.id].y._value ?? table.y) + gs.dy;
        panAnims[table.id].setValue({
          x: Math.max(0, Math.min(cw - width, nx)),
          y: Math.max(0, Math.min(ch - height, ny)),
        });
      },
      onPanResponderRelease: async () => {
        const x = panAnims[table.id].x._value;
        const y = panAnims[table.id].y._value;
        await updateTablePosition(table.id, x, y);
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
        {tables.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="restaurant-outline" size={40} color="#666" />
            <Text style={styles.emptyText}>No tables set</Text>
          </View>
        ) : (
          tables.map((table) => {
            const { width, height } = getTableSize(table.capacity);
            const area = Math.max(width, 48);
            const ox = (area - width) / 2;
            const oy = (area - height) / 2;

            const pan = panAnims[table.id];
            const scale = scaleAnims[table.id];
            const pr = createPanResponder(table);

            return (
              <Animated.View
                key={table.id}
                {...pr.panHandlers}
                style={[
                  styles.tableWrapper,
                  {
                    width: area,
                    height: area,
                    transform: [{ translateX: pan.x }, { translateY: pan.y }],
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
                      transform: [{ scale }],
                    },
                    { marginLeft: ox, marginTop: oy },
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
  floorPlanWrapper: { marginTop: 5 },
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
  legendColor: { width: 16, height: 16, borderRadius: 4, marginRight: 6 },
  legendText: { fontSize: 12, color: "#333", fontWeight: "500" },
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
  tableText: { color: "#FFFFFF", fontSize: 14, fontWeight: "bold" },
  tableLabel: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "500",
    opacity: 0.8,
  },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 14, color: "#666", marginTop: 8, textAlign: "center" },
});

export default RestaurantFloorPlan;
