"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Message } from "@/types/chat";
import type { Conversation, Project, ProjectPriority } from "@/types/analytics";
import { MOCK_CONVERSATION_MESSAGES, MOCK_PROJECTS, MOCK_CONVERSATIONS, autoTitleFromQuestion } from "@/data/mock-conversations";
import { generateId } from "@/lib/utils";
import {
  detectConversationAreas,
  getBusinessArea,
  normalizeAreaId,
  normalizeAreaIds,
  toRouteAreaId,
  type BusinessAreaId,
} from "@/data/business-areas";

function normalizeConversation(conversation: Conversation): Conversation {
  const areaIds = normalizeAreaIds(
    conversation.areaIds?.length
      ? conversation.areaIds
      : [conversation.primaryAreaId, conversation.area, conversation.scope]
  );
  const primaryAreaId = conversation.primaryAreaId ?? areaIds[0];
  const primaryArea = getBusinessArea(primaryAreaId);

  return {
    ...conversation,
    areaIds,
    primaryAreaId,
    area: primaryArea?.label,
    scope: primaryArea ? toRouteAreaId(primaryArea.id) : conversation.scope ?? "global",
  };
}

interface ChatStore {
  // Per-conversation messages
  conversationMessages: Record<string, Message[]>;
  conversations: Conversation[];
  projects: Project[];
  activeConversationId: string | null;

  // Agent thinking UI state (not persisted between convs)
  isThinking: boolean;
  thinkingSteps: { label: string; status: "pending" | "running" | "done" }[];

  // Demo activation
  loadDemoData: () => void;
  resetAll: () => void;

  // Message actions
  getMessages: (conversationId: string) => Message[];
  addMessage: (conversationId: string, msg: Message) => void;

  // Thinking state
  setThinking: (v: boolean) => void;
  setThinkingSteps: (steps: { label: string; status: "pending" | "running" | "done" }[]) => void;
  updateThinkingStep: (index: number, status: "pending" | "running" | "done") => void;

  // Conversation actions
  setActiveConversation: (id: string | null) => void;
  createConversation: (title?: string, projectId?: string, area?: string | BusinessAreaId) => Conversation;
  updateConversationTitle: (id: string, title: string) => void;
  assignConversationToProject: (convId: string, projectId?: string) => void;
  archiveConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  setConversationTitle: (id: string, firstMessage: string) => void;
  classifyConversationArea: (id: string, area: string | BusinessAreaId) => void;
  classifyConversationAreas: (id: string, input: string) => void;
  restoreConversation: (id: string) => void;

  // Project actions
  createProject: (name: string, description?: string, area?: string, objective?: string, priority?: ProjectPriority) => Project;
  updateProject: (id: string, patch: Partial<Project>) => void;
  renameProject: (id: string, name: string) => void;
  archiveProject: (id: string) => void;
  deleteProject: (id: string, mode?: "keep-conversations" | "delete-conversations") => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      conversationMessages: {},
      conversations: [],
      projects: [],
      activeConversationId: null,
      isThinking: false,
      thinkingSteps: [],

      loadDemoData: () =>
        set({ conversations: MOCK_CONVERSATIONS, projects: MOCK_PROJECTS, conversationMessages: MOCK_CONVERSATION_MESSAGES }),

      resetAll: () =>
        set({
          conversationMessages: {},
          conversations: [],
          projects: [],
          activeConversationId: null,
          isThinking: false,
          thinkingSteps: [],
        }),

      getMessages: (conversationId) =>
        get().conversationMessages[conversationId] ?? [],

      addMessage: (conversationId, msg) =>
        set((s) => {
          const existing = s.conversationMessages[conversationId] ?? [];
          const convs = s.conversations.map((c) =>
            c.id === conversationId
              ? { ...c, messageCount: c.messageCount + 1, updatedAt: new Date().toISOString() }
              : c
          );
          return {
            conversationMessages: {
              ...s.conversationMessages,
              [conversationId]: [...existing, msg],
            },
            conversations: convs,
          };
        }),

      setThinking: (v) => set({ isThinking: v }),

      setThinkingSteps: (steps) => set({ thinkingSteps: steps }),

      updateThinkingStep: (index, status) =>
        set((s) => {
          const steps = [...s.thinkingSteps];
          if (steps[index]) steps[index] = { ...steps[index], status };
          return { thinkingSteps: steps };
        }),

      setActiveConversation: (id) => set({ activeConversationId: id }),

      createConversation: (title, projectId, area) => {
        const areaIds = normalizeAreaIds(area);
        const primaryAreaId = areaIds[0];
        const routeArea = toRouteAreaId(primaryAreaId);
        const conv: Conversation = {
          id: `conv-${generateId()}`,
          title: title ?? "Nueva consulta",
          projectId,
          areaIds,
          primaryAreaId,
          area: primaryAreaId ? getBusinessArea(primaryAreaId)?.label : undefined,
          scope: routeArea ?? "global",
          messageCount: 0,
          status: "active",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((s) => ({
          conversations: [conv, ...s.conversations],
          activeConversationId: conv.id,
          // Update project conv count
          projects: projectId
            ? s.projects.map((p) =>
                p.id === projectId
                  ? { ...p, conversationCount: p.conversationCount + 1 }
                  : p
              )
            : s.projects,
        }));
        return conv;
      },

      updateConversationTitle: (id, title) =>
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === id ? { ...c, title } : c
          ),
        })),

      setConversationTitle: (id, firstMessage) => {
        const title = autoTitleFromQuestion(firstMessage);
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === id && c.title === "Nueva consulta" ? { ...c, title } : c
          ),
        }));
      },

      classifyConversationArea: (id, area) =>
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === id
              ? normalizeConversation({
                  ...c,
                  areaIds: normalizeAreaIds([...(c.areaIds ?? []), area]),
                  primaryAreaId: c.primaryAreaId ?? normalizeAreaId(area) ?? undefined,
                })
              : c
          ),
        })),

      classifyConversationAreas: (id, input) =>
        set((s) => {
          const detected = detectConversationAreas(input);
          if (detected.areaIds.length === 0) return s;
          return {
            conversations: s.conversations.map((c) =>
              c.id === id
                ? normalizeConversation({
                    ...c,
                    areaIds: normalizeAreaIds([...(c.areaIds ?? []), ...detected.areaIds]),
                    primaryAreaId: c.primaryAreaId ?? detected.primaryAreaId,
                  })
                : c
            ),
          };
        }),

      assignConversationToProject: (convId, projectId) =>
        set((s) => {
          const current = s.conversations.find((c) => c.id === convId);
          const previousProjectId = current?.projectId;
          return {
            conversations: s.conversations.map((c) =>
              c.id === convId ? { ...c, projectId, updatedAt: new Date().toISOString() } : c
            ),
            projects: s.projects.map((p) => {
              if (p.id === previousProjectId && previousProjectId !== projectId) {
                return { ...p, conversationCount: Math.max(0, p.conversationCount - 1), updatedAt: new Date().toISOString() };
              }
              if (p.id === projectId && previousProjectId !== projectId) {
                return { ...p, conversationCount: p.conversationCount + 1, updatedAt: new Date().toISOString() };
              }
              return p;
            }),
          };
        }),

      archiveConversation: (id) =>
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === id ? { ...c, status: "archived" } : c
          ),
          activeConversationId: s.activeConversationId === id ? null : s.activeConversationId,
        })),

      restoreConversation: (id) =>
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === id ? { ...c, status: "active", updatedAt: new Date().toISOString() } : c
          ),
        })),

      deleteConversation: (id) =>
        set((s) => ({
          conversations: s.conversations.filter((c) => c.id !== id),
          conversationMessages: Object.fromEntries(
            Object.entries(s.conversationMessages).filter(([k]) => k !== id)
          ),
          activeConversationId: s.activeConversationId === id ? null : s.activeConversationId,
        })),

      createProject: (name, description, area, objective, priority = "medium") => {
        const project: Project = {
          id: `proj-${generateId()}`,
          name,
          description,
          area,
          objective,
          priority,
          owner: "Mauro Celani",
          status: "active",
          conversationCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((s) => ({ projects: [project, ...s.projects] }));
        return project;
      },

      renameProject: (id, name) =>
        set((s) => ({
          projects: s.projects.map((p) => (p.id === id ? { ...p, name, updatedAt: new Date().toISOString() } : p)),
        })),

      updateProject: (id, patch) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === id ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p
          ),
        })),

      archiveProject: (id) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === id ? { ...p, status: "archived", updatedAt: new Date().toISOString() } : p
          ),
        })),

      deleteProject: (id, mode = "keep-conversations") =>
        set((s) => ({
          projects: s.projects.filter((p) => p.id !== id),
          conversations: mode === "delete-conversations"
            ? s.conversations.filter((c) => c.projectId !== id)
            : s.conversations.map((c) =>
                c.projectId === id ? { ...c, projectId: undefined, updatedAt: new Date().toISOString() } : c
              ),
          conversationMessages: mode === "delete-conversations"
            ? Object.fromEntries(
                Object.entries(s.conversationMessages).filter(([k]) => {
                  const conv = s.conversations.find((c) => c.id === k);
                  return conv?.projectId !== id;
                })
              )
            : s.conversationMessages,
          activeConversationId: mode === "delete-conversations" && s.conversations.find((c) => c.id === s.activeConversationId)?.projectId === id
            ? null
            : s.activeConversationId,
        })),
    }),
    {
      name: "nexus-chat",
      version: 3,
      migrate: (persistedState: unknown, version: number) => {
        if (version === 0) {
          return { conversationMessages: {}, conversations: [], projects: [], activeConversationId: null } as Partial<ChatStore>;
        }
        if (version === 1) {
          // Backfill scope for existing conversations
          const s = persistedState as { conversations?: Conversation[] };
          return {
            ...s,
            conversations: (s.conversations ?? []).map((c) => normalizeConversation({
              ...c,
              scope: c.scope ?? c.area ?? "global",
            })),
          } as Partial<ChatStore>;
        }
        const s = persistedState as { conversations?: Conversation[]; projects?: Project[] };
        return {
          ...s,
          conversations: (s.conversations ?? []).map((c) => normalizeConversation(c)),
        } as Partial<ChatStore>;
      },
      // Don't persist thinking state
      partialize: (state) => ({
        conversationMessages: state.conversationMessages,
        conversations: state.conversations,
        projects: state.projects,
        activeConversationId: state.activeConversationId,
      }),
    }
  )
);
