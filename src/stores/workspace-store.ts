"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Workspace, Member, WorkspaceRole } from "@/types/workspace";
import { MOCK_WORKSPACE, MOCK_MEMBERS } from "@/data/mock-workspace";
import { generateId } from "@/lib/utils";

interface WorkspaceStore {
  workspace: Workspace | null;
  activeAreaIds: string[];
  members: Member[];

  setWorkspace: (ws: Workspace) => void;
  setActiveAreas: (areas: string[]) => void;
  updateWorkspace: (patch: Partial<Workspace>) => void;

  inviteMember: (member: Omit<Member, "id">) => void;
  updateMemberRole: (memberId: string, role: WorkspaceRole) => void;
  updateMemberStatus: (memberId: string, status: Member["status"]) => void;
  removeMember: (memberId: string) => void;
  updateMemberModules: (memberId: string, modules: string[]) => void;

  loadDefaultWorkspace: () => void;
  reset: () => void;
}

export const useWorkspaceStore = create<WorkspaceStore>()(
  persist(
    (set, get) => ({
      workspace: null,
      activeAreaIds: [],
      members: MOCK_MEMBERS,

      setWorkspace: (ws) => set({ workspace: ws }),
      setActiveAreas: (areas) => set({ activeAreaIds: areas }),
      updateWorkspace: (patch) =>
        set((state) => ({ workspace: state.workspace ? { ...state.workspace, ...patch } : state.workspace })),

      inviteMember: (member) =>
        set((state) => ({
          members: [...state.members, { ...member, id: `m-${generateId()}` }],
        })),

      updateMemberRole: (memberId, role) =>
        set((state) => ({
          members: state.members.map((m) => (m.id === memberId ? { ...m, role } : m)),
        })),

      updateMemberStatus: (memberId, status) =>
        set((state) => ({
          members: state.members.map((m) => (m.id === memberId ? { ...m, status } : m)),
        })),

      removeMember: (memberId) =>
        set((state) => ({
          members: state.members.filter((m) => m.id !== memberId),
        })),

      updateMemberModules: (memberId, modules) =>
        set((state) => ({
          members: state.members.map((m) => (m.id === memberId ? { ...m, modules } : m)),
        })),

      loadDefaultWorkspace: () => {
        const state = get();
        if (!state.workspace) {
          set({ workspace: MOCK_WORKSPACE, members: MOCK_MEMBERS });
        }
      },

      reset: () => set({ workspace: null, activeAreaIds: [], members: MOCK_MEMBERS }),
    }),
    { name: "nexus-workspace" }
  )
);

export function getDefaultWorkspace(): Workspace {
  return { ...MOCK_WORKSPACE, members: MOCK_MEMBERS };
}
