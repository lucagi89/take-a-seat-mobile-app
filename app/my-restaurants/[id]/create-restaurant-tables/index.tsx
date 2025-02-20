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
import { createElement } from "../../../../services/databaseActions";
import { useUser } from "../../../../contexts/userContext";

const FLOOR_WIDTH = 300;
const FLOOR_HEIGHT = 400;
const PADDING = 10;

const getTableSize = (capacity: number) => {
  if (capacity <= 4) return { width: 50, height: 50 };
  if (capacity <= 6) return { width: 70, height: 50 };
  return { width: 90, height: 50 };
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
    return;
  }

  const [loading, setLoading] = useState(false);
  const [tables, setTables] = useState([{ capacity: "", count: "" }]);

  // Store assigned positions to prevent overlap
  const assignedPositions: {
    x: number;
    y: number;
    width: number;
    height: number;
  }[] = [];

  // Generate non-overlapping positions
  const getNonOverlappingPosition = (width: number, height: number) => {
    let x: Number, y: Number;
    let maxAttempts = 50; // Prevent infinite loops

    do {
      x = Math.floor(Math.random() * (FLOOR_WIDTH - width));
      y = Math.floor(Math.random() * (FLOOR_HEIGHT - height));
      maxAttempts--;
    } while (
      assignedPositions.some(
        (pos) =>
          Math.abs(pos.x - x) < pos.width + PADDING &&
          Math.abs(pos.y - y) < pos.height + PADDING
      ) &&
      maxAttempts > 0
    );

    assignedPositions.push({ x, y, width, height });
    return { x, y };
  };

  // Handle input changes
  const handleInputChange = (
    index: number,
    field: keyof (typeof tables)[0],
    value: string
  ) => {
    const updatedTables = [...tables];
    updatedTables[index][field] = value;
    setTables(updatedTables);
  };

  // Add another table type
  const addTableType = () => {
    if (!loading) {
      setTables([...tables, { capacity: "", count: "" }]);
    }
  };

  // Remove a table type
  const removeTableType = (index: number) => {
    if (!loading) {
      const updatedTables = tables.filter((_, i) => i !== index);
      setTables(updatedTables);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (tables.some((table) => !table.capacity || !table.count)) {
      Alert.alert("Error", "Please fill in all fields before submitting.");
      return;
    }

    setLoading(true);
    try {
      const tableEntries = tables.flatMap((table) => {
        const size = getTableSize(Number(table.capacity));
        return Array.from({ length: Number(table.count) }, () => {
          const { x, y } = getNonOverlappingPosition(size.width, size.height);
          return {
            restaurantId,
            capacity: Number(table.capacity),
            seatsTaken: 0,
            isAvailable: true,
            x,
            y,
            width: size.width,
            height: size.height,
            createdBy: user?.uid,
          };
        });
      });

      // Insert tables into the database
      const promises = tableEntries.map(async (table) =>
        createElement("restaurantTables", table)
      );

      await Promise.all(promises);

      Alert.alert(
        "Success",
        `${tableEntries.length} tables added successfully!`
      );
      router.push(`/my-restaurants/${restaurantId}`);
    } catch (error) {
      console.error("Error adding tables:", error);
      Alert.alert("Error", "Could not add tables. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Tables for Restaurant</Text>

      {tables.map((table, index) => (
        <View key={index} style={styles.tableRow}>
          <TextInput
            style={styles.input}
            placeholder="Capacity (e.g., 2, 4, 10)"
            keyboardType="numeric"
            placeholderTextColor="gray"
            value={table.capacity}
            onChangeText={(text) => handleInputChange(index, "capacity", text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Number of Tables"
            keyboardType="numeric"
            placeholderTextColor="gray"
            value={table.count}
            onChangeText={(text) => handleInputChange(index, "count", text)}
          />
          {index > 0 && (
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeTableType(index)}
            >
              <Text style={styles.removeButtonText}>X</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}

      <TouchableOpacity style={styles.addButton} onPress={addTableType}>
        <Text style={styles.addButtonText}>+ Add Another Table Type</Text>
      </TouchableOpacity>

      <Button title="Submit Tables" onPress={handleSubmit} disabled={loading} />

      {loading && <Text style={styles.loadingText}>Submitting...</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    color: "black",
  },
  addButton: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  addButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  removeButton: {
    backgroundColor: "red",
    padding: 10,
    borderRadius: 5,
  },
  removeButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "gray",
  },
});
