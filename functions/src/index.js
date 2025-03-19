

const {onSchedule} = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

exports.resetExpiredBookings = onSchedule({
  schedule: "every 10 minutes", region: "europe-west2"}, async () => {
  const now = admin.firestore.Timestamp.now();
  const threeHoursAgo = new Date(now.toDate().getTime() - 3 * 60 * 60 * 1000);

  try {
    const bookingsSnapshot = await db
      .collection("bookings")
      .where("isExpired", "==", false)
      .where("bookedTime", "<", threeHoursAgo)
      .get();

    if (bookingsSnapshot.empty) {
      console.log("✅ No expired bookings found.");
      return;
    }

    const batch = db.batch();
    bookingsSnapshot.forEach((doc) => {
      batch.update(doc.ref, {isExpired: true});
    });

    await batch.commit();
    console.log(
      `✅ Successfully reset ${bookingsSnapshot.size} expired bookings.`);
  } catch (error) {
    console.error("❌ Error resetting bookings:", error);
  }
});
