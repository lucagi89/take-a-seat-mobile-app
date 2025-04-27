import React, { useState, useEffect } from "react";
import { View, Text, Button, FlatList, Alert } from "react-native";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "../scripts/firebase.config";

const OwnerBookingScreen = () => {
  interface Booking {
    id: string;
    tableId?: string;
    partySize?: number;
    [key: string]: any; // Add this to allow additional fields if needed
  }

  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    // Get restaurant owned by the current user
    const restaurantQuery = query(
      collection(db, "restaurants"),
      where("userId", "==", auth.currentUser?.uid || "")
    );

    const unsubscribeRestaurant = onSnapshot(
      restaurantQuery,
      (restaurantSnap) => {
        if (!restaurantSnap.empty) {
          const restaurantId = restaurantSnap.docs[0].id;

          // Listen for pending bookings for this restaurant
          const bookingsQuery = query(
            collection(db, "bookings"),
            where("restaurantId", "==", restaurantId),
            where("status", "==", "pending")
          );

          const unsubscribeBookings = onSnapshot(bookingsQuery, (snapshot) => {
            const bookingList = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setBookings(bookingList);
          });

          console.log("Pending bookings:", bookings);

          return () => unsubscribeBookings();
        }
      }
    );

    return () => unsubscribeRestaurant();
  }, []);

  const handleAcceptBooking = async (bookingId: string) => {
    try {
      await updateDoc(doc(db, "bookings", bookingId), {
        status: "accepted",
        updatedAt: serverTimestamp(),
      });
      Alert.alert("Success", "Booking accepted.");
      // send notification to user
      // const userId = bookings.find((b) => b.id === bookingId)?.userId;
      // if (userId) {
      //   await sendNotification(userId, "Booking Accepted", "Your booking has been accepted.");
      // }
    } catch (error) {
      console.error("Error accepting booking:", error);
      Alert.alert("Error", "Failed to accept booking.");
    }
  };

  const handleRejectBooking = async (bookingId: string) => {
    try {
      await updateDoc(doc(db, "bookings", bookingId), {
        status: "rejected",
        updatedAt: serverTimestamp(),
      });
      Alert.alert("Success", "Booking rejected.");
      // send notification to user
      // const userId = bookings.find((b) => b.id === bookingId)?.userId;
      // if (userId) {
      //   await sendNotification(userId, "Booking Rejected", "Your booking has been rejected.");
      // }
    } catch (error) {
      console.error("Error rejecting booking:", error);
      Alert.alert("Error", "Failed to reject booking.");
    }
  };

  return (
    <View>
      <Text>Pending Booking Requests</Text>
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View>
            <Text>Table: {item.tableId}</Text>
            <Text>Party Size: {item.partySize}</Text>
            <Button
              title="Accept"
              onPress={() => handleAcceptBooking(item.id)}
            />
            <Button
              title="Reject"
              onPress={() => handleRejectBooking(item.id)}
            />
          </View>
        )}
      />
    </View>
  );
};

export default OwnerBookingScreen;
