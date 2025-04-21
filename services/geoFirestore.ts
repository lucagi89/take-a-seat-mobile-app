import { db } from "../scripts/firebase.config";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { GeoFirestore } from "geofirestore";

// Initialize GeoFirestore
const geoFirestore = new GeoFirestore(db);
const geoCollection = geoFirestore.collection("restaurants");

// Script to migrate existing restaurants
export const migrateRestaurants = async () => {
  try {
    const restaurantsRef = collection(db, "restaurants");
    const snapshot = await getDocs(restaurantsRef);

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const { latitude, longitude } = data;

      if (latitude && longitude) {
        // Create a GeoPoint
        const coordinates = new geoFirestore.GeoPoint(latitude, longitude);

        // Update the document with coordinates and geohash
        await geoCollection.doc(docSnap.id).set(
          {
            coordinates,
            // Other fields remain unchanged
            name: data.name,
            // Add other fields as needed
          },
          { merge: true }
        );

        console.log(`Updated restaurant ${docSnap.id}`);
      }
    }
    console.log("Migration complete!");
  } catch (error) {
    console.error("Error migrating restaurants:", error);
  }
};
