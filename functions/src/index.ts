/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// import {onRequest} from "firebase-functions/v2/https";
// import * as logger from "firebase-functions/logger";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

import {onSchedule} from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

export const resetExpiredBookings = onSchedule("every 10 minutes", async () => {
  const now = admin.firestore.Timestamp.now();
  const threeHoursAgo = new Date(now.toDate().getTime() - 3 * 60 * 60 * 1000);

  try {
    // Step 1: Find expired bookings (more than 3 hours old)
    const bookingsSnapshot = await db
      .collection("bookings")
      .where("isExpired", "==", false) // ✅ Fixed `isExpired` backtick issue
      .where("bookedTime", "<", threeHoursAgo) // ✅ Correct timestamp filtering
      .get();

    if (bookingsSnapshot.empty) {
      console.log("✅ No expired bookings found.");
      return;
    }

    // Step 2: Extract table IDs from expired bookings
    const tableIds = bookingsSnapshot.docs
      .map((doc) => doc.data().tableId)
      .filter((tableId) => tableId); // Ensure valid IDs

    if (tableIds.length === 0) {
      console.log("✅ No tables to update.");
      return;
    }

    // Step 3: Fetch tables in a batch
    // eslint-disable-next-line max-len
    const tableRefs = tableIds.map((tableId) => db.collection("tables").doc(tableId));
    const tableDocs = await db.getAll(...tableRefs);

    // Step 4: Prepare batch updates
    const batch = db.batch();

    // Mark tables as available
    tableDocs.forEach((doc) => {
      if (doc.exists) {
        batch.update(doc.ref, {isAvailable: true});
      }
    });

    // Mark bookings as expired
    bookingsSnapshot.docs.forEach((doc) => {
      batch.update(doc.ref, {isExpired: true});
    });

    // Step 5: Commit batch update
    await batch.commit();
    // eslint-disable-next-line max-len
    console.log(`✅ Successfully reset ${bookingsSnapshot.size} expired bookings.`);
  } catch (error) {
    console.error("❌ Error resetting bookings:", error);
  }
});
