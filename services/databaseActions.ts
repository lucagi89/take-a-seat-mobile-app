import { addDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../scripts/firebase.config";


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
