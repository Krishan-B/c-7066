
import { createContext } from "react";
import { type Session, type User } from "@supabase/supabase-js";
import { type UserProfile } from "@/features/profile/types";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  profileLoading: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<Session | null>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  profileLoading: false,
  signOut: async () => {},
  refreshSession: async () => null,
  updateProfile: async () => {},
  refreshProfile: async () => {},
});
