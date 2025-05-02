import {
  addDoc,
  collection,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
  getDoc,
  query,
  where,
  setDoc,
} from "firebase/firestore";
import { db } from "../scripts/firebase.config";
import {geocodeAddress} from "./geolocation";
import { Restaurant, Dish, Review, Table, User } from "../data/types";
import { getAuth } from "firebase/auth";
// import { User } from "firebase/auth";





//GENERAL DATABASE ACTIONS

// Add a document with a random ID
export const addDocument = async (data: any, collectionName: string, customId: string = "") => {
  try {
    if (customId) {
      const docRef = doc(db, collectionName, customId);
      await setDoc(docRef, data, { merge: true }); // Optional: merge to avoid overwriting existing data
      return customId;
    } else {
      const docRef = await addDoc(collection(db, collectionName), data);
      return docRef.id;
    }
  } catch (error) {
    console.error(`Error adding document to ${collectionName}:`, error);
    throw error;
  }
};

export async function updateDocument(myCollection: string, id: string, data: any): Promise<void> {
  try {
    const docRef = doc(db, myCollection, id);
    await updateDoc(docRef, data);
    console.log("Document updated with ID: ", id);
  } catch (error) {
    console.error('Error updating document:', error);
    throw error;
  }
}

export async function checkIfDocumentExists(myCollection: string, id: string): Promise<boolean> {
  try {
    const docRef = doc(db, myCollection, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists();
  } catch (error) {
    console.error('Error checking document:', error);
    throw error;
  }
}



export async function fetchDocument(myCollection: string, id: string): Promise<any> {
  try {
    const docRef = doc(db, myCollection, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      console.log("No such document!");
      return null;
    }
  } catch (error) {
    console.error('Error fetching document:', error);
    throw error;
  }
}



export async function deleteDocument(myCollection: string, id: string): Promise<void> {
  try {
    // Delete associated data based on the main collection
    if (myCollection === "users") {
      await deleteUserRestaurants(id);
    } else if (myCollection === "restaurants") {
      await deleteRestaurantTables(id);
    }

    // Delete the main document
    await deleteDoc(doc(db, myCollection, id));
    console.log(`Document with ID: ${id} deleted from ${myCollection}`);
  } catch (error) {
    console.error("Error deleting document:", error);
    throw error;
  }
}

// COLLECTION ACTIONS

export async function fetchCollectionData(myCollection: string): Promise<any[]> {
  try {
    const querySnapshot = await getDocs(collection(db, myCollection));
    const data: any[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,          // Include document ID
      ...doc.data(),       // Spread the document data
    }));

    console.log('Data fetched:', data);
    return data;
  } catch (error) {
    console.error('Error fetching document:', error);
    throw error;
  }
}

// ✅ Check if Collection Has Documents
export const checkIfCollectionHasDocuments = async (myCollection: string) => {
  try {
    const querySnapshot = await getDocs(collection(db, myCollection));
    const hasDocuments = !querySnapshot.empty;
    console.log(`Collection '${myCollection}' has documents: ${hasDocuments}`);
    return hasDocuments;
  } catch (error) {
    console.error("Error checking collection:", error);
    throw error;
  }
};

// ✅ Delete All Documents in a Collection
export const deleteAllDocuments = async (myCollection: string) => {
  try {
    const querySnapshot = await getDocs(collection(db, myCollection));

    if (querySnapshot.empty) {
      console.log(`Collection '${myCollection}' is already empty.`);
      return;
    }

    const deletePromises = querySnapshot.docs.map((docItem) =>
      deleteDoc(doc(db, myCollection, docItem.id))
    );

    await Promise.all(deletePromises); // ✅ Delete all documents in parallel
    console.log(`✅ All documents in '${myCollection}' have been deleted.`);
  } catch (error) {
    console.error(`🚨 Error deleting documents from '${myCollection}':`, error);
    throw error;
  }
};


// USER ACTIONS

export const fetchUserData = async (uid: string) => {
  try {
    const userDocRef = doc(db, "users", uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      return userDoc.data();
    } else {
      console.log("No user data found for UID:", uid);
      return null;
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error; // Re-throw to be caught in the useEffect
  }
};




export const deleteUser = (userId: string): Promise<void> => {
  return new Promise<void>(async (resolve, reject) => {
    try {
      // Delete user data from Firestore
      await deleteDoc(doc(db, "users", userId));
      console.log(`User with ID: ${userId} deleted from Firestore`);
      // Delete user restaurants
      await deleteUserRestaurants(userId);
      console.log(`User's restaurants deleted for ID: ${userId}`);
      // Optionally, delete user authentication (if using Firebase Auth)
      await deleteUserAuth(userId);
      // console.log(`User authentication deleted for ID: ${userId}`);
      resolve();
    } catch (error) {
      console.error("Error deleting user:", error);
      reject(error);
    }
  });
};

export async function deleteUserAuth(userId: string): Promise<void> {
  try {
    // Assuming you have a Firebase Auth instance
    const auth = getAuth();
    const user = auth.currentUser;
    if (user && user.uid === userId) {
      await deleteUser(user);
      console.log(`User authentication deleted for ID: ${userId}`);
    } else {
      console.log(`No authenticated user found for ID: ${userId}`);
    }
  } catch (error) {
    console.error("Error deleting user authentication:", error);
    throw error;
  }
}


async function deleteUserRestaurants(userId: string): Promise<void> {
  const restaurantsRef = collection(db, "restaurants");
  const q = query(restaurantsRef, where("ownerId", "==", userId));
  const querySnapshot = await getDocs(q);

  const deletePromises = querySnapshot.docs.map(async (docSnapshot) => {
    await deleteAllRestaurantData(docSnapshot.id); // Delete associated restaurant data first
    await deleteDoc(doc(db, "restaurants", docSnapshot.id)); // Delete the restaurant
    console.log(`Deleted restaurant with ID: ${docSnapshot.id}`);
  });

  await Promise.all(deletePromises);
}


// RESTAURANT ACTIONS


async function deleteAllRestaurantData(restaurantId: string): Promise<void> {
  await deleteRestaurantTables(restaurantId);
  await deleteRestaurantDishes(restaurantId);
  await deleteRestaurantReviews(restaurantId);
}

async function deleteRestaurantTables(restaurantId: string): Promise<void> {
  const tablesRef = collection(db, "restaurantTables");
  const q = query(tablesRef, where("restaurantId", "==", restaurantId));
  const querySnapshot = await getDocs(q);

  const deletePromises = querySnapshot.docs.map((doc) =>
    deleteDoc(doc.ref)
  );

  await Promise.all(deletePromises);
  console.log(`Deleted tables for restaurant: ${restaurantId}`);
}

async function deleteRestaurantDishes(restaurantId: string): Promise<void> {
  const dishesRef = collection(db, "dishes");
  const q = query(dishesRef, where("restaurantId", "==", restaurantId));
  const querySnapshot = await getDocs(q);

  const deletePromises = querySnapshot.docs.map((doc) =>
    deleteDoc(doc.ref)
  );

  await Promise.all(deletePromises);
  console.log(`Deleted dishes for restaurant: ${restaurantId}`);
}

async function deleteRestaurantReviews(restaurantId: string): Promise<void> {
  const reviewsRef = collection(db, "reviews");
  const q = query(reviewsRef, where("restaurantId", "==", restaurantId));
  const querySnapshot = await getDocs(q);

  const deletePromises = querySnapshot.docs.map((doc) =>
    deleteDoc(doc.ref)
  );

  await Promise.all(deletePromises);
  console.log(`Deleted reviews for restaurant: ${restaurantId}`);
}



// export async function findRestaurantTables(restaurantId: string): Promise<Partial<Table[]>> {
//   try {
//     const q = query(
//       collection(db, "tables"),
//       where("restaurantId", "==", String(restaurantId)) // 🔥 Ensure it's a string
//     );
//     const querySnapshot = await getDocs(q);

//     // Map Firestore data to the Table type
//     const tables: Table[] = querySnapshot.docs.map((doc) => ({
//       id: doc.id,
//       ...doc.data(),
//     })) as Table[];

//     console.log("Tables fetched:", tables);
//     return tables;
//   } catch (error) {
//     console.error("Error fetching tables:", error);
//     throw error; // Let the caller handle the error
//   }
// }


export async function findRestaurantDishes(restaurantId: string): Promise<Partial<Dish[]> | undefined> {
  try {
    const q = query(
      collection(db, "dishes"),
      where("restaurantId", "==", String(restaurantId))
    );
    const querySnapshot = await getDocs(q);

    const dishes = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log("Dishes fetched:", dishes);
    return dishes;
  } catch (error) {
    console.error("Error fetching dishes:", error);
    throw error;
  }
}




export async function createNewRestaurant(data: any, myCollection: string): Promise<any> {
  try {
    const { address, city, postcode } = data;
    const fullAddress = `${address}, ${city}, ${postcode}`;

    // ✅ Geocoding the address
    const geocodedLocation = await geocodeAddress(fullAddress);
    if (!geocodedLocation) {
      console.warn(`Geocoding failed for address: ${fullAddress}`);
      return { success: false, message: `Geocoding failed for ${fullAddress}` };
    }

    const { latitude, longitude } = geocodedLocation;
    const newData = { ...data, latitude, longitude };

    // ✅ Adding data to Firebase
    await addDoc(collection(db, myCollection), newData);
    console.log(`Successfully added: ${data.name}`);

    return { success: true, message: `Added ${data.name}` };
  } catch (error) {
    console.error(`Error creating entry for ${data.name}:`, error);
    return { success: false, message: `Error adding ${data.name}` };
  }
};




export const getUserRestaurants = async (userId: string) => {
  try {
    // Assuming the field name is "owner"
    const restaurantsRef = collection(db, "restaurants");
    const q = query(restaurantsRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    const userRestaurants = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return userRestaurants;
  } catch (error) {
    console.error("Error fetching user's restaurants:", error);
    throw error;
  }
};


export const getRestaurantById = async (restaurantId: string) => {
  try {
    const restaurantDoc = await getDoc(doc(db, "restaurants", restaurantId));
    if (restaurantDoc.exists()) {
      return restaurantDoc.data();
    }
  } catch (error) {
    console.error("Error fetching restaurant:", error);
    throw error;
  }
};


// Helper to fetch the current favourites array (or [])
async function getUserFavourites(userId: string): Promise<string[]> {
  const userRef = doc(db, "users", userId);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return [];
  return (snap.data().favourites as string[]) || [];
}

/**
 * Returns true if the given restaurantId is in the user's favourites.
 */
export async function seeIfRestaurantIsInFavourites(
  userId: string,
  restaurantId: string
): Promise<boolean> {
  try {
    const favourites = await getUserFavourites(userId);
    return favourites.includes(restaurantId);
  } catch (err) {
    console.error("Error checking favourites:", err);
    return false;
  }
}

/**
 * Adds the given restaurantId to the user's favourites array (if not already present).
 */
export async function toggleRestaurantToFavourites(
  userId: string,
  restaurantId: string
): Promise<void> {
  try {
    const userRef = doc(db, "users", userId);
    const favourites = await getUserFavourites(userId);

    if (favourites.includes(restaurantId)) {
      await updateDoc(userRef, {
        favourites: favourites.filter((id) => id !== restaurantId),
      });
      console.log("Removed from favourites:", restaurantId);
      return;
    }

    await updateDoc(userRef, {
      favourites: [...favourites, restaurantId],
    });
    console.log("Added to favourites:", restaurantId);
  } catch (err) {
    console.error("Error adding to favourites:", err);
  }
}



export const updateTablePosition = async (tableId: string, x: number, y: number) => {
  try {

    const tableRef = doc(db, "tables", tableId); // ✅ Verify collection name

    await updateDoc(tableRef, {
      x: x,
      y: y,
    });

    console.log("Table position updated successfully");
    return { success: true };
  } catch (error) {
    console.error("Error updating table position:", error);
    return { success: false, error };
  }
};


export const updateTableAvailability = async (tableId: string, isAvailable: boolean) => {
  try {
    const tableRef = doc(db, "tables", tableId);
    await updateDoc(tableRef, { isAvailable });
    console.log("Table availability updated:", { isAvailable });
  } catch (error) {
    console.error("Error updating table availability:", error);
  }
}

export const updateTableCapacity = async (tableId: string, capacity: number) => {
  try {
    const tableRef = doc(db, "tables", tableId);
    await updateDoc(tableRef, { capacity });
    console.log("Table capacity updated:", { capacity });
  } catch (error) {
    console.error("Error updating table capacity:", error);
  }
}

export const updateTableSeatsTaken = async (tableId: string, seatsTaken: number) => {
  try {
    const tableRef = doc(db, "tables", tableId);
    await updateDoc(tableRef, { seatsTaken });
    console.log("Table seats taken updated:", { seatsTaken });
  } catch (error) {
    console.error("Error updating table seats taken:", error);
  }
}





//REVIEWS


export const addReview = async (data: Review) => {
  try {
    await addDoc(collection(db, "reviews"), data);
    console.log("Review added successfully");
  } catch (error) {
    console.error("Error adding review:", error);
  }
};

// Explicitly define return type as `Promise<Review[]>`
export const getReviews = async (restaurantId: string): Promise<Review[]> => {
  try {
    const q = query(collection(db, "reviews"), where("restaurantId", "==", restaurantId));
    const querySnapshot = await getDocs(q);

    // Ensure Firestore data is correctly typed
    const reviews: Review[] = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || "",
        body: data.body || "",
        rating: data.rating ?? 0, // Ensure rating is a number (fallback to 0)
        userId: data.userId || "",
        restaurantId: data.restaurantId || restaurantId, // Ensure restaurantId exists
      };
    });

    return reviews;
  } catch (error) {
    console.error("Error fetching reviews:", error);
    throw error;
  }
};


export const deleteReview = async (reviewId: string) => {
  try {
    await deleteDoc(doc(db, "reviews", reviewId));
    console.log("Review deleted:", reviewId);
  } catch (error) {
    console.error("Error deleting review:", error);
  }
};


export const updateReview = async (reviewId: string, data: Partial<Review>) => {
  try {
    const reviewRef = doc(db, "reviews", reviewId);
    await updateDoc(reviewRef, data);
    console.log("Review updated:", reviewId);
  } catch (error) {
    console.error("Error updating review:", error);
  }
};
