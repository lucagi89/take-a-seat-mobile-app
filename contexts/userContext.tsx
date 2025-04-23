import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../scripts/firebase.config";
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
    console.log("UserContextProvider - Setting up onAuthStateChanged listener");
    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        console.log("UserContextProvider - Auth state changed:", currentUser);
        if (currentUser) {
          console.log("UserContextProvider - Setting user:", currentUser.uid);
          setUser({
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
          });

          try {
            console.log(
              "UserContextProvider - Fetching user data for UID:",
              currentUser.uid
            );
            const data = await fetchUserData(currentUser.uid);
            console.log("UserContextProvider - Fetched user data:", data);
            setUserData(data || undefined);
          } catch (error) {
            console.error(
              "UserContextProvider - Error fetching user data:",
              error
            );
            setUserData(undefined);
          }
        } else {
          console.log(
            "UserContextProvider - No user, clearing user and userData"
          );
          setUser(null);
          setUserData(undefined);
        }
        console.log("UserContextProvider - Setting loading to false");
        setLoading(false);
      },
      (error) => {
        console.error("UserContextProvider - onAuthStateChanged error:", error);
        setLoading(false);
      }
    );
  }, []);

  console.log("UserContextProvider - Rendering with state:", {
    user,
    loading,
    userData,
  });

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
