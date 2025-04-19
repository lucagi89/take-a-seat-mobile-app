const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.notifyOwnerOnBooking = functions.firestore
  .document("bookings/{bookingId}")
  .onCreate(async (snap, context) => {
    const booking = snap.data();
    const { restaurantId, partySize, userId, tableId } = booking;

    // Get restaurant details to find the owner
    const restaurantDoc = await admin
      .firestore()
      .collection("restaurants")
      .doc(restaurantId)
      .get();
    const restaurant = restaurantDoc.data();
    const ownerId = restaurant.ownerId;

    // Get user details for notification message
    const userDoc =
      await admin.firestore().collection("users").doc(userId).get();
    const user = userDoc.data();
    const userName = user.displayName || "A customer";

    // Create notification for the owner
    const notification = {
      userId: ownerId,
      title: "New Booking Request",
      body: `
      ${userName} requested to book Table ${tableId} for ${partySize} people.`,
      type: "booking_request",
      bookingId: snap.id,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      read: false,
    };

    // Save notification to Firestore
    await admin
      .firestore()
      .collection("notifications")
      .add(notification);

    // Send FCM notification (assuming owner has an FCM token)
    const ownerDoc =
      await admin.firestore().collection("users").doc(ownerId).get();
    const owner = ownerDoc.data();
    const fcmToken = owner.fcmToken; // Store FCM token in user document

    if (fcmToken) {
      const message = {
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: {
          bookingId: snap.id,
          type: "booking_request",
        },
        token: fcmToken,
      };

      await admin.messaging().send(message);
    }

    return null;
  });


exports.notifyUserOnBookingStatus = functions.firestore
  .document("bookings/{bookingId}")
  .onUpdate(async (change, context) => {
    const newData = change.after.data();
    const oldData = change.before.data();

    // Check if status changed
    if (newData.status === oldData.status) {
      return null;
    }

    const {userId, tableId, status} = newData;

    // Create notification message based on status
    let title;
    let body;
    let type;
    if (status === "accepted") {
      title = "Booking Confirmed";
      body = `Your booking for Table ${tableId} has been confirmed!`;
      type = "booking_accepted";
    } else if (status === "rejected") {
      title = "Booking Rejected";
      body = `Your booking for Table ${tableId} was not approved.`;
      type = "booking_rejected";
    } else {
      return null;
    }

    // Save notification to Firestore
    const notification = {
      userId,
      title,
      body,
      type,
      bookingId: change.after.id,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      read: false,
    };

    await admin
      .firestore()
      .collection("notifications")
      .add(notification);

    // Send FCM notification to user
    const userDoc =
      await admin.firestore().collection("users").doc(userId).get();
    const user = userDoc.data();
    const fcmToken = user.fcmToken;

    if (fcmToken) {
      const message = {
        notification: {title, body},
        data: {
          bookingId: change.after.id,
          type,
        },
        token: fcmToken,
      };

      await admin.messaging().send(message);
    }

    // Update table's isBooked status if accepted
    if (status === "accepted") {
      await admin
        .firestore()
        .collection("tables")
        .doc(tableId)
        .update({isBooked: true});
    }

    return null;
  });
