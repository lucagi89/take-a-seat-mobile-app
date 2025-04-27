import { collection, addDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { db, auth } from "../../scripts/firebase.config";
import { addDocument } from "@/services/databaseActions";
import { Alert } from "react-native";
import { Table, Booking } from "../../data/types";

export const handleBooking = async (table: Table, partySize: number) => {
    if (partySize > table.capacity)
      return Alert.alert("Too Many People", "Please select a larger table.");
    if (table.capacity - partySize >= 3)
      return Alert.alert("Table Too Big", "Consider a smaller table.");

    //create booking object with tableId, partySize, timestamp and status pending

    const booking: Booking = {
      tableId: table.id,
      partySize,
      timestamp: serverTimestamp() as Timestamp,
      status: "pending",
      restaurantId: table.restaurantId,
      userId: auth.currentUser?.uid || "",
      id: "", // This will be set by Firestore
      reservationDate: new Date().toISOString(),
      reservationTime: new Date().toISOString(),
    };

    // Add booking to the database
    await addDocument(booking, "bookings");

    // send notification to restaurant owner
    // const restaurantOwnerId = table.ownerId;
    // if (restaurantOwnerId) {
    //   await sendNotification(restaurantOwnerId, "New Booking", `New booking for ${partySize} people.`);
    // }
    // send notification to user
    // const userId = auth.currentUser?.uid;
    // if (userId) {
    //   await sendNotification(userId, "Booking Confirmed", `Table booked for ${partySize} people.`);
    // }
    // Optionally, you can show a success message or navigate to another screen
    // Alert.alert("Success", "Booking confirmed.");
    // For now, just show an alert
    // Alert.alert("Success", `Table booked for ${partySize} people.`);



    Alert.alert("Booking Confirmed", `Table booked for ${partySize} people.`);
  };
