import { createContext } from "react";
import type { User } from "../lib/auth";

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void> | void;
  error: string | null;
}

export const AuthContext = createContext<AuthState | undefined>(undefined);
