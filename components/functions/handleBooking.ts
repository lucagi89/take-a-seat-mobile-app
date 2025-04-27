import { collection, addDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { db, auth } from "../../scripts/firebase.config";
import { addDocument } from "@/services/databaseActions";
import { Alert } from "react-native";
import { Table } from "../../data/types";

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
