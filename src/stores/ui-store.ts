"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SectionState {
  projects: boolean;
  recents: boolean;
  areas: boolean;
}

interface UiStore {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  collapsedSections: SectionState;
  toggleSidebar: () => void;
  setSidebarOpen: (v: boolean) => void;
  setSidebarCollapsed: (v: boolean) => void;
  toggleSection: (key: keyof SectionState) => void;
}

export const useUiStore = create<UiStore>()(
  persist(
    (set) => ({
      sidebarOpen: false,
      sidebarCollapsed: false,
      collapsedSections: { projects: false, recents: false, areas: false },
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (v) => set({ sidebarOpen: v }),
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
      toggleSection: (key) =>
        set((s) => ({
          collapsedSections: {
            ...s.collapsedSections,
            [key]: !s.collapsedSections[key],
          },
        })),
    }),
    { name: "nexus-ui", partialize: (s) => ({ collapsedSections: s.collapsedSections }) }
  )
);
