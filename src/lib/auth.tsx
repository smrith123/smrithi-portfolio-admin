"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, getToken, setToken } from "./api";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
}

interface AuthValue {
  user: AdminUser | null;
  status: "loading" | "signed-in" | "signed-out";
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [status, setStatus] = useState<AuthValue["status"]>("loading");

  useEffect(() => {
    // No token means signed out; asking the API would only log a 401.
    const session = getToken()
      ? api.get<{ user: AdminUser }>("/auth/me")
      : Promise.reject(new Error("no stored session"));

    session
      .then(({ user }) => {
        setUser(user);
        setStatus("signed-in");
      })
      .catch(() => setStatus("signed-out"));
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { token, user } = await api.post<{ token: string; user: AdminUser }>("/auth/login", { email, password });
    setToken(token);
    setUser(user);
    setStatus("signed-in");
  }, []);

  const signOut = useCallback(() => {
    setToken(null);
    setUser(null);
    setStatus("signed-out");
    /* A full reload, not a router push: it guarantees no loaded content stays
       in memory after signing out. */
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = "/login";
  }, []);

  const value = useMemo(() => ({ user, status, signIn, signOut }), [user, status, signIn, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
