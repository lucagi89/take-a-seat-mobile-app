import {
  Alert,
  Animated,
} from "react-native";
import { useRef } from "react";
import { Table } from "../../data/types";

export const handleTablePress = (table: Table, isOwner: boolean) => {

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
      const promptFn = Alert.prompt;
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
