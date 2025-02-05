// contexts/userContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../scripts/firebase.config"; // Ensure this points to your Firebase setup

// Define types for better TypeScript support
type UserContextType = {
  user: any;
  loading: boolean;
  setUser: (user: any) => void;
};

const UserContext = createContext<UserContextType | null>(null);

export const UserContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        // You can fetch more user details here if needed
        setUser({
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, setUser }}>
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
