import { useUser } from "./userContext";
import { useRouter } from "expo-router";
import React from "react";
import { useEffect } from "react";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user]);

  // if (loading || !user) {
  //   return null; // Or render a loading spinner
  // }

  return <>{children}</>;
}
