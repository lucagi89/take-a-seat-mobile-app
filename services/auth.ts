// src/services/auth.ts
import { auth } from '../scripts/firebase.config';
import { User } from 'firebase/auth';
import { createUserWithEmailAndPassword } from 'firebase/auth';

interface SignUpResponse {
  user: User;
}

export async function handleSignUp(email: string, password: string): Promise<SignUpResponse> {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log('User signed up:', userCredential.user);
    return { user: userCredential.user };
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
}
