import React, { useState } from "react";
import {
  Text,
  View,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { addDocument } from "../../../../services/databaseActions";
import { useUser } from "../../../../contexts/userContext";

const FLOOR_WIDTH = 300;
const FLOOR_HEIGHT = 400;

const getTableSize = (capacity: number) => {
  if (capacity <= 4) return { width: 50, height: 50 };
  if (capacity <= 6) return { width: 70, height: 50 };
  return { width: 90, height: 50 };
};

const getRandomPosition = (width: number, height: number) => {
  const x = Math.floor(Math.random() * (FLOOR_WIDTH - width));
  const y = Math.floor(Math.random() * (FLOOR_HEIGHT - height));
  return { x, y };
};

export default function CreateRestaurantTables() {
  const { id: restaurantId, ownerId } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useUser();

  if (!user) {
    router.push("/login");
    return null;
  } else if (!restaurantId) {
    router.push("/");
    return null;
  } else if (ownerId !== user.uid) {
    Alert.alert("Error", "You do not have permission to view this page.");
    router.push("/");
    return null;
  }

  const [loading, setLoading] = useState(false);
  const [tables, setTables] = useState<
    {
      capacity: string;
      count: string;
      positions?: { x: number; y: number }[];
    }[]
  >([{ capacity: "", count: "" }]);

  const handleInputChange = (
    index: number,
    field: keyof (typeof tables)[0],
    value: string
  ) => {
    const updatedTables = [...tables];
    updatedTables[index][field] = value;
    setTables(updatedTables);
  };

  const addTableType = () => {
    if (!loading) {
      setTables([...tables, { capacity: "", count: "" }]);
    }
  };

  const removeTableType = (index: number) => {
    if (!loading) {
      const updatedTables = tables.filter((_, i) => i !== index);
      setTables(updatedTables);
    }
  };

  const handleSubmit = async () => {
    if (tables.some((table) => !table.capacity || !table.count)) {
      Alert.alert("Error", "Please fill in all fields before submitting.");
      return;
    }

    setLoading(true);
    try {
      const tableEntries = tables.flatMap((table) => {
        const size = getTableSize(Number(table.capacity));

        const positions = Array.from({ length: Number(table.count) }, () =>
          getRandomPosition(size.width, size.height)
        );

        return positions.map(({ x, y }) => ({
          restaurantId,
          capacity: Number(table.capacity),
          seatsTaken: 0,
          isAvailable: true,
          x,
          y,
          width: size.width,
          height: size.height,
          createdBy: user?.uid,
          ownerId: user?.uid,
        }));
      });

      const promises = tableEntries.map(async (table) =>
        addDocument(table, "restaurantTables")
      );

      await Promise.all(promises);

      Alert.alert(
        "Success",
        `${tableEntries.length} tables added successfully!`
      );

      router.push(`/my-restaurants/${restaurantId}`);
      setTables([{ capacity: "", count: "" }]);
    } catch (error) {
      console.error("Error adding tables:", error);
      Alert.alert("Error", "Could not add tables. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Tables for Your Restaurant</Text>
      <View style={styles.card}>
        {tables.map((table, index) => (
          <View key={index} style={styles.tableRow}>
            <TextInput
              style={styles.input}
              placeholder="Capacity (e.g., 2, 4, 6)"
              keyboardType="numeric"
              placeholderTextColor="#666"
              value={table.capacity}
              onChangeText={(text) =>
                handleInputChange(index, "capacity", text)
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Number of Tables"
              keyboardType="numeric"
              placeholderTextColor="#666"
              value={table.count}
              onChangeText={(text) => handleInputChange(index, "count", text)}
            />
            {index > 0 && (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeTableType(index)}
                activeOpacity={0.7}
              >
                <Text style={styles.removeButtonText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

        <TouchableOpacity
          style={styles.addButton}
          onPress={addTableType}
          activeOpacity={0.7}
        >
          <Text style={styles.addButtonText}>+ Add Another Table Type</Text>
        </TouchableOpacity>

        <Button
          title="Submit Tables"
          onPress={handleSubmit}
          disabled={loading}
          color="#4CAF50" // Custom green color
        />

        {loading && <Text style={styles.loadingText}>Submitting...</Text>}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#F5F5F5", // Light gray background for a clean look
    alignItems: "center",
  },
  card: {
    backgroundColor: "#FFFFFF", // White card for content
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5, // For Android shadow
    width: "100%",
    maxWidth: 400, // Cap width for larger screens
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2E7D32", // Deep green for a restaurant feel
    textAlign: "center",
    marginBottom: 20,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    backgroundColor: "#E8F5E9", // Light green background for table rows
    borderRadius: 10,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#C8E6C9", // Soft green border
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginRight: 10,
    backgroundColor: "#FFFFFF",
    fontSize: 16,
    color: "#333",
  },
  addButton: {
    backgroundColor: "#FFCA28", // Gold/yellow for a warm accent
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  removeButton: {
    backgroundColor: "#D32F2F", // Red for remove action
    padding: 10,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    width: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  removeButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});
