import {
  addDoc,
  collection,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
  getDoc,
  query,
  where
} from "firebase/firestore";
import { db } from "../scripts/firebase.config";
import * as Location from 'expo-location';
import { useUser } from "../contexts/userContext";


export async function addData(data: any, myCollection: string): Promise<void> {
  try {
    const docRef = await addDoc(collection(db, myCollection), data);
    console.log("Document written with ID: ", docRef.id);
  } catch (error) {
    console.error('Error adding document:', error);
    throw error;
  }
}


export async function fetchData(myCollection: string): Promise<any[]> {
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

export async function updateData(myCollection: string, id: string, data: any): Promise<void> {
  try {
    const docRef = doc(db, myCollection, id);
    await updateDoc(docRef, data);
    console.log("Document updated with ID: ", id);
  } catch (error) {
    console.error('Error updating document:', error);
    throw error;
  }
}


export async function createElement(myCollection: string, data: any): Promise<void> {
  try {
    const docRef = await addDoc(collection(db, myCollection), data);
    console.log("Document written with ID: ", docRef.id);
  } catch (error) {
    console.error('Error adding document:', error);
    throw error;
  }
}


/**
 * Deletes a document and its associated sub-collections.
 *
 * @param {string} myCollection - The collection name (e.g., 'users', 'restaurants').
 * @param {string} id - The ID of the document to delete.
 */
export async function deleteElement(myCollection: string, id: string): Promise<void> {
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

/**
 * Deletes all restaurants associated with a specific user.
 *
 * @param {string} userId - The user's ID.
 */
async function deleteUserRestaurants(userId: string): Promise<void> {
  const restaurantsRef = collection(db, "restaurants");
  const q = query(restaurantsRef, where("ownerId", "==", userId));
  const querySnapshot = await getDocs(q);

  const deletePromises = querySnapshot.docs.map(async (docSnapshot) => {
    await deleteRestaurantTables(docSnapshot.id); // Delete associated tables first
    await deleteDoc(doc(db, "restaurants", docSnapshot.id)); // Delete the restaurant
    console.log(`Deleted restaurant with ID: ${docSnapshot.id}`);
  });

  await Promise.all(deletePromises);
}

/**
 * Deletes all tables associated with a specific restaurant.
 *
 * @param {string} restaurantId - The restaurant's ID.
 */
async function deleteRestaurantTables(restaurantId: string): Promise<void> {
  const tablesRef = collection(db, "tables");
  const q = query(tablesRef, where("restaurantId", "==", restaurantId)); // Assuming 'restaurantId' links tables to restaurant
  const querySnapshot = await getDocs(q);

  const deletePromises = querySnapshot.docs.map(async (docSnapshot) => {
    await deleteDoc(doc(db, "tables", docSnapshot.id));
    console.log(`Deleted table with ID: ${docSnapshot.id}`);
  });

  await Promise.all(deletePromises);
}


interface Table {
  id: string;
  restaurantId: string;
  capacity: number; // Adjust based on your database schema
}

export async function findRestaurantTables(restaurantId: string): Promise<Table[]> {
  try {
    const q = query(
      collection(db, "restaurantTables"),
      where("restaurantId", "==", String(restaurantId)) // 🔥 Ensure it's a string
    );
    const querySnapshot = await getDocs(q);

    // Map Firestore data to the Table type
    const tables: Table[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Table[];

    console.log("Tables fetched:", tables);
    return tables;
  } catch (error) {
    console.error("Error fetching tables:", error);
    throw error; // Let the caller handle the error
  }
}





export const geocodeAddress = async (address: string) => {
  try {
    // Request permission (iOS-specific, Android handles this differently)
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to access location was denied');
      return;
    }

    // Geocode the address
    const geocodedLocation = await Location.geocodeAsync(address);

    if (geocodedLocation.length > 0) {
      const { latitude, longitude } = geocodedLocation[0];
      return { latitude, longitude };
    } else {
      alert('No coordinates found for this address.');
    }
  } catch (error) {
    console.error('Error geocoding address:', error);
  }
};

export const createDatabaseEntry = async (data: any, myCollection: string) => {
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


export const checkUserData = async (userId: string) => {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        return data;
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


export const updateTablePosition = async (tableId, x, y) => {
  try {

    const tableRef = doc(db, "restaurantTables", tableId); // ✅ Verify collection name

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
    const tableRef = doc(db, "restaurantTables", tableId);
    await updateDoc(tableRef, { isAvailable });
    console.log("Table availability updated:", { isAvailable });
  } catch (error) {
    console.error("Error updating table availability:", error);
  }
}

export const updateTableCapacity = async (tableId: string, capacity: number) => {
  try {
    const tableRef = doc(db, "restaurantTables", tableId);
    await updateDoc(tableRef, { capacity });
    console.log("Table capacity updated:", { capacity });
  } catch (error) {
    console.error("Error updating table capacity:", error);
  }
}

export const updateTableSeatsTaken = async (tableId: string, seatsTaken: number) => {
  try {
    const tableRef = doc(db, "restaurantTables", tableId);
    await updateDoc(tableRef, { seatsTaken });
    console.log("Table seats taken updated:", { seatsTaken });
  } catch (error) {
    console.error("Error updating table seats taken:", error);
  }
}


export const deleteTable = async (tableId: string) => {
  try {
    await deleteDoc(doc(db, "restaurantTables", tableId));
    console.log("Table deleted:", tableId);
  } catch (error) {
    console.error("Error deleting table:", error);
  }
}
