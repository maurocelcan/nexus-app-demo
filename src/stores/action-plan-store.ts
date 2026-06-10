"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ActionPlan } from "@/types/analytics";
import { generateId } from "@/lib/utils";
import { DEMO_ACTION_PLANS } from "@/data/mock-projects";

interface ActionPlanStore {
  plans: ActionPlan[];
  createPlan: (plan: Omit<ActionPlan, "id" | "createdAt" | "updatedAt">) => ActionPlan;
  updatePlan: (id: string, patch: Partial<Omit<ActionPlan, "id" | "createdAt">>) => void;
  updatePlanStatus: (id: string, status: ActionPlan["status"]) => void;
  toggleItem: (planId: string, itemId: string) => void;
  deletePlan: (id: string) => void;
  loadDemoPlans: () => void;
}

export const useActionPlanStore = create<ActionPlanStore>()(
  persist(
    (set) => ({
      plans: [],

      createPlan: (plan) => {
        const newPlan: ActionPlan = {
          ...plan,
          id: `plan-${generateId()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((s) => ({ plans: [newPlan, ...s.plans] }));
        return newPlan;
      },

      updatePlanStatus: (id, status) =>
        set((s) => ({
          plans: s.plans.map((p) =>
            p.id === id ? { ...p, status, updatedAt: new Date().toISOString() } : p
          ),
        })),

      toggleItem: (planId, itemId) =>
        set((s) => ({
          plans: s.plans.map((p) =>
            p.id === planId
              ? {
                  ...p,
                  items: p.items.map((item) =>
                    item.id === itemId ? { ...item, done: !item.done } : item
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : p
          ),
        })),

      updatePlan: (id, patch) =>
        set((s) => ({
          plans: s.plans.map((p) =>
            p.id === id ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p
          ),
        })),

      deletePlan: (id) =>
        set((s) => ({ plans: s.plans.filter((p) => p.id !== id) })),

      loadDemoPlans: () => {
        const demoIds = DEMO_ACTION_PLANS.map((p) => p.id);
        set((s) => ({
          plans: [...DEMO_ACTION_PLANS, ...s.plans.filter((p) => !demoIds.includes(p.id))],
        }));
      },
    }),
    { name: "nexus-action-plans" }
  )
);
