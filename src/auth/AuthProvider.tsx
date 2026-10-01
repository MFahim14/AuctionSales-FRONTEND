"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getCurrentUser, getGroups, getSession, signOut as cognitoSignOut } from "./session";
import { isAdminFromGroups } from "./groups";

type AuthContextValue = {
  ready: boolean;
  signedIn: boolean;
  isAdmin: boolean;
  groups: string[];
  refresh: () => Promise<void>;
  signOutAndGo: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [groups, setGroups] = useState<string[]>([]);

  const refresh = async () => {
    const user = getCurrentUser();
    if (!user) {
      setSignedIn(false);
      setGroups([]);
      setReady(true);
      return;
    }
    try {
      await getSession();
      const nextGroups = await getGroups();
      setGroups(nextGroups);
      setSignedIn(true);
    } catch {
      setSignedIn(false);
      setGroups([]);
    } finally {
      setReady(true);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ready,
      signedIn,
      isAdmin: isAdminFromGroups(groups),
      groups,
      refresh,
      signOutAndGo: async () => {
        await cognitoSignOut();
        setSignedIn(false);
        setGroups([]);
        window.location.assign("/sign-in");
      },
    }),
    [ready, signedIn, groups],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
