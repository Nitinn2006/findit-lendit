"use client";

import { createContext, useContext, type ReactNode } from "react";

export type ClientUser = {
  id: string;
  name: string;
  email: string;
  collegeId: string;
  department: string;
  isAdmin: boolean;
  isVerified: boolean;
  ratingAvg: number;
  ratingCount: number;
};

const UserContext = createContext<ClientUser | null>(null);

export function UserProvider({ user, children }: { user: ClientUser; children: ReactNode }) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
