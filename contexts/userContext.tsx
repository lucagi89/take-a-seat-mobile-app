import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../scripts/firebase.config";

import { fetchUserData } from "../services/databaseActions";
import { UserData, UserContextType } from "../data/types";

const UserContext = createContext<UserContextType | null>(null);

export const UserContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  console.log("UserContextProvider - Starting render");

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<Partial<UserData> | undefined>(
    undefined
  );

  useEffect(() => {
    const unsubscribeFromAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser({
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
        });

        // Don't set loading false yet — wait for Firestore
        const userRef = doc(db, "users", currentUser.uid);

        const unsubscribeFromUser = onSnapshot(
          userRef,
          (docSnap) => {
            if (docSnap.exists()) {
              // console.log(
              //   "UserContextProvider - Realtime update:",
              //   docSnap.data()
              // );
              setUserData({ id: docSnap.id, ...docSnap.data() });
            } else {
              console.warn("User document does not exist.");
              setUserData(undefined);
            }
            setLoading(false); // ✅ Success case
          },
          (error) => {
            console.error("Realtime listener error:", error);
            setLoading(false); // ✅ Error case
          }
        );

        // ✅ Return cleanup for the Firestore listener
        return () => unsubscribeFromUser();
      } else {
        setUser(null);
        setUserData(undefined);
        setLoading(false); // ✅ Logged out
      }
    });

    return () => unsubscribeFromAuth();
  }, []);

  // console.log("UserContextProvider - Rendering with state:", {
  //   user,
  //   loading,
  //   userData,
  // });

  return (
    <UserContext.Provider
      value={{ user, loading, setLoading, userData, setUser, setUserData }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  console.log("useUser - Context:", context);
  if (!context) {
    throw new Error("useUser must be used within a UserContextProvider");
  }
  return context;
};
