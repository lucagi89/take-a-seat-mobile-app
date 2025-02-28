// src/services/auth.ts
import { auth, provider } from '../scripts/firebase.config';
import { User } from 'firebase/auth';
import { useRouter } from "expo-router";

import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
  signOut

} from 'firebase/auth';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
const router = useRouter();

WebBrowser.maybeCompleteAuthSession();

interface AccessResponse {
  user: User;
}

export async function handleUser(email: string, password: string): Promise<AccessResponse> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('User signed up:', userCredential.user);
    return { user: userCredential.user };
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
}


export async function signInWithGoogle(): Promise<AccessResponse> {
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });

  if (response?.type === 'success') {
    const { id_token } = response.params;
    const credential = GoogleAuthProvider.credential(id_token);
    const auth = getAuth();
    const userCredential = await signInWithCredential(auth, credential);
    return { user: userCredential.user };
  } else {
    throw new Error('Google sign-in failed');
  }
}




export async function signUp(email: string, password: string): Promise<AccessResponse> {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user };
  }
  catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
}

export const handleLogout = async () => {
  console.log("Logging out...");
  try {
    await signOut(auth);
    router.push("/login");
  } catch (error) {
    console.error("Error signing out:", error);
  }
};
