import {
  addDoc,
  collection,
  getDocs,
  deleteDoc,
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



// export const getUserResaturants = async (userId: string) => {
//   try {
//     const querySnapshot = await getDocs(collection(db, "restaurants"));
//     const userRestaurants = querySnapshot.docs
//       .map((doc) => ({ id: doc.id, ...doc.data() }))
//       .filter((restaurant) => restaurant.userId === userId);
//     return userRestaurants;
//   } catch (error) {
//     console.error("Error fetching user's restaurants:", error);
//     throw error;
//   }
// };


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


// export const getRestaurantById = async (restaurantId: string) => {
//   try {
//     const restaurantDoc = await getDoc(doc(db, "restaurants", restaurantId));
//     if (restaurantDoc.exists()) {
//       return restaurantDoc.data();
//     }
//   } catch (error) {
//     console.error("Error fetching restaurant:", error);
//     throw error;
//   }
// };
