"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, TOKEN_KEY } from "./api";
import type { User } from "./types";

interface AuthState {
  user: User | null;
  loading: boolean;
  signIn: (token: string, user: User) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let token: string | null = null;
    try {
      token = localStorage.getItem(TOKEN_KEY);
    } catch {}
    (token ? api.me() : Promise.resolve(null))
      .then(setUser)
      .catch(() => {
        try {
          localStorage.removeItem(TOKEN_KEY);
        } catch {}
      })
      .finally(() => setLoading(false));
  }, []);

  const signIn = useCallback((token: string, u: User) => {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {}
    setUser(u);
  }, []);

  const signOut = useCallback(async () => {
    await api.logout().catch(() => {});
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {}
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
