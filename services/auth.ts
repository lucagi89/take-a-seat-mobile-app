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

interface SignUpResponse {
  user: User;
}

export async function handleUser(email: string, password: string): Promise<SignUpResponse> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('User signed up:', userCredential.user);
    return { user: userCredential.user };
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
}
