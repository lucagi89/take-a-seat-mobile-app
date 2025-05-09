import React, { useEffect } from "react";
import { useRouter, usePathname } from "expo-router";
import { useUser } from "./userContext";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const router = useRouter();
  const pathname = usePathname(); // ✅ Get current route

  const isLogin = pathname === "/login"; // ✅ exclude login route

  useEffect(() => {
    if (!loading && !user && !isLogin) {
      console.log("User not logged in, redirecting to /login");
      router.replace("/login");
    }
  }, [user, loading, isLogin]);

  if ((loading || !user) && !isLogin) {
    return null; // loading spinner or null while redirecting
  }

  return <>{children}</>;
}
