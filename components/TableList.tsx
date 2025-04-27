import React from "react";
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useRestaurantTables } from "../hooks/useRestaurantTables";
import { Table } from "../data/types";

interface TableListProps {
  restaurantId: string;
  tables: Table[];
  isOwner: boolean;
}

export default function TableList({
  restaurantId,
  tables,
  isOwner,
}: TableListProps) {
  const { loading, error } = useRestaurantTables(restaurantId);

  if (loading) return <ActivityIndicator />;
  if (error) return <Text>Error loading tables.</Text>;

  return (
    <View>
      {tables.map((t) => (
        <View key={t.id} style={styles.container}>
          <View>
            <Text>Table – Seats: {t.capacity}</Text>
            <Text>Status: {t.isAvailable ? "Available" : "Taken"}</Text>
          </View>

          {t.isAvailable && (
            <TouchableOpacity
              onPress={() => {
                // Handle table selection or action
                console.log(`Table ${t.id} selected`);
              }}
              style={{
                backgroundColor: t.isAvailable ? "green" : "red",
                padding: 10,
                borderRadius: 5,
              }}
            >
              <Text>Book</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    display: "flex",
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
