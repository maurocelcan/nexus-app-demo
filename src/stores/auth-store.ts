"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types/auth";

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isOnboarded: boolean;
  login: (user: User) => void;
  logout: () => void;
  setOnboarded: (v: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isOnboarded: false,
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
      setOnboarded: (v) => set({ isOnboarded: v }),
    }),
    { name: "nexus-auth" }
  )
);
