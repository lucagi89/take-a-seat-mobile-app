// src/contexts/UserContext.ts
import { auth } from "../scripts/firebase.config";
import { User, UserCredential } from "firebase/auth";
import { createContext, useState } from "react";

interface UserContextType {
  user: User | null;
  handleSignUp: (email: string, password: string) => Promise<User>;
}

export const UserContext = createContext<UserContextType | null>(null);

export function UserContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);

  async function handleSignUp(email: string, password: string): Promise<User> {
    try {
      const userCredential: UserCredential =
        await auth.createUserWithEmailAndPassword(email, password);
      setUser(userCredential.user);
      console.log("User signed up:", userCredential.user);
      return userCredential.user;
    } catch (error) {
      console.error("Error signing up:", error);
      throw error;
    }
  }

  return (
    <UserContext.Provider value={{ user, handleSignUp }}>
      {children}
    </UserContext.Provider>
  );
}
