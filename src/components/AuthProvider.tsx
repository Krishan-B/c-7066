
import React from "react";
import { AuthContext } from "./AuthContext";
import { useAuthProvider } from "@/hooks/auth/useAuthProvider";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const authState = useAuthProvider();
  
  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  );
};
