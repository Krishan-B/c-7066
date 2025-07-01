import { createContext } from "react";
import type { AuthContextType } from "../types";

// Re-export the type so everyone uses the same one
export type { AuthContextType };

const defaultContext: AuthContextType = {
  session: null,
  user: null,
  profile: null,
  loading: false,
  profileLoading: false,
  signOut: async () => {},
  updateProfile: async () => {},
  refreshProfile: async () => {},
  refreshSession: async () => null,
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
};

export const AuthContext = createContext<AuthContextType>(defaultContext);
