import { addDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../scripts/firebase.config.node";
import * as Location from 'expo-location';


export async function addData(data: any, myCollection: any): Promise<void> {
  try {
    const docRef = await addDoc(collection(db, myCollection), data);
    console.log("Document written with ID: ", docRef.id);
  } catch (error) {
    console.error('Error adding document:', error);
    throw error;
  }
}


export async function fetchData(myCollection: any): Promise<void> {
  try {
    const querySnapshot = await getDocs(collection(db, myCollection));
    const data = querySnapshot.forEach((doc) => {
      return doc.data();
    });
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
