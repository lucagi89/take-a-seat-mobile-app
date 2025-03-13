import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../scripts/firebase.config";
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
  const [userData, setUserData] = useState<Partial<UserData> | undefined>(
    undefined
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser({
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
        });

        try {
          const data = await fetchUserData(currentUser.uid);
          setUserData(data || undefined);
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUserData(undefined);
        }
      } else {
        setUser(null);
        setUserData(undefined);
      }
      setLoading(false); // Set loading to false after all async operations
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

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserContextProvider");
  }
  return context;
};
