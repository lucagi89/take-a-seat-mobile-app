import { addDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../scripts/firebase.config";
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
