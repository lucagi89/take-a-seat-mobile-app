// contexts/userContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../scripts/firebase.config"; // Ensure this points to your Firebase setup
import { fetchUserData } from "../services/databaseActions";

type UserData = {
  name: string;
  lastName: string;
  photoURL: string;
  streetAddress: string;
  city: string;
  country: string;
  postcode: string;
  email: string;
  phone: string;
  isOwner: boolean;
  isProfileComplete: boolean;
};

// Define types for better TypeScript support
type UserContextType = {
  user: any;
  loading: boolean;
  userData: Partial<UserData> | undefined;
  setUser: (user: any) => void;
  setUserData: (userData: Partial<UserData> | undefined) => void;
};

const UserContext = createContext<UserContextType | null>(null);

export const UserContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<{} | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser({
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
        });

        // Fetch user data from Firestore
        fetchUserData(currentUser.uid).then((data) => {
          if (data) {
            setUserData(data);
          } else {
            setUserData(undefined);
          }
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider
      value={{ user, loading, userData, setUser, setUserData }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to access user context
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserContextProvider");
  }
  return context;
};
