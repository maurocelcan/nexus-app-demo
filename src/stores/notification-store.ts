"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Notification } from "@/types/analytics";
import { MOCK_NOTIFICATIONS } from "@/data/mock-conversations";

interface NotificationStore {
  notifications: Notification[];
  unreadCount: () => number;
  markRead: (id: string) => void;
  markAllRead: () => void;
  addNotification: (n: Omit<Notification, "id" | "createdAt" | "read">) => void;
  loadDemoNotifications: () => void;
  resetAll: () => void;
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      notifications: [],

      loadDemoNotifications: () => set({ notifications: MOCK_NOTIFICATIONS }),

      resetAll: () => set({ notifications: [] }),

      unreadCount: () => get().notifications.filter((n) => !n.read).length,

      markRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),

      markAllRead: () =>
        set((s) => ({
          notifications: s.notifications.map((n) => ({ ...n, read: true })),
        })),

      addNotification: (n) =>
        set((s) => ({
          notifications: [
            {
              ...n,
              id: `notif-${Date.now()}`,
              read: false,
              createdAt: new Date().toISOString(),
            },
            ...s.notifications,
          ],
        })),
    }),
    {
      name: "nexus-notifications",
      version: 1,
      migrate: (_persistedState: unknown, version: number) => {
        if (version === 0) {
          return { notifications: [] };
        }
        return _persistedState;
      },
    }
  )
);
