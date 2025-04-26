import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useRestaurantTables } from "../hooks/useRestaurantTables";

interface TableListProps {
  restaurantId: string;
}

export default function TableList({ restaurantId }: TableListProps) {
  const { tables, loading, error } = useRestaurantTables(restaurantId);

  if (loading) return <ActivityIndicator />;
  if (error) return <Text>Error loading tables.</Text>;

  return (
    <View>
      {tables.map((t) => (
        <View key={t.id} style={{ padding: 10, borderBottomWidth: 1 }}>
          <Text>
            Table {t.id} – Seats: {t.capacity}
          </Text>
          <Text>Status: {t.isAvailable ? "Open" : "Closed"}</Text>
        </View>
      ))}
    </View>
  );
}
