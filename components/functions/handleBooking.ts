import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../../scripts/firebase.config";
import { Alert } from "react-native";
import { Table } from "../../data/types";

const handleBooking = async (table: Table, partySize: number) => {
  try {
    // Create a booking request
    const bookingData = {
      tableId: table.id,
      restaurantId: table.restaurantId,
      userId: auth.currentUser.uid,
      partySize,
      status: "pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await addDoc(collection(db, "bookings"), bookingData);
    Alert.alert("Booking Requested", "Your booking request has been sent. You'll be notified once the owner responds.");
  } catch (error) {
    console.error("Error creating booking:", error);
    Alert.alert("Error", "Failed to create booking request.");
  }
};
