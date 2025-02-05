// src/services/auth.ts
import { auth } from '../scripts/firebase.config';
import { User } from 'firebase/auth';
import {
  createUserWithEmailAndPassword,
  Auth,
  UserCredential,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  AuthCredential,

} from 'firebase/auth';

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

export async function handleSignUp(email: string, password: string): Promise<AccessResponse> {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log('User signed up:', userCredential.user);
    return { user: userCredential.user };
  }
  catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
}
