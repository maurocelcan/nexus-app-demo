"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Database, TrendingUp, PieChart, DollarSign,
  ShoppingCart, Package, Calendar, Map,
} from "lucide-react";
import type { ComponentType } from "react";
import { useRouter } from "next/navigation";
import { ChatInput } from "@/components/chat/chat-input";
import { MessageItem } from "@/components/chat/message-item";
import { AgentThinking } from "@/components/chat/agent-thinking";
import { ConversationContextBanner } from "@/components/chat/conversation-context-banner";
import { Button } from "@/components/ui/button";
import { useChatStore } from "@/stores/chat-store";
import { useDataSourceStore, getActiveDataset, getWorkspaceDatasetState } from "@/stores/data-source-store";
import { useAuthStore } from "@/stores/auth-store";
import {
  AGENT_STEPS,
  MOCK_INITIAL_MESSAGE,
  getResponseForQuestion,
  generateNoDataResponse,
  generateRealDataResponse,
  getContextualAgentSteps,
} from "@/data/mock-conversations";
import { getAdvisoryResponse } from "@/data/demo-advisory-flow";
import {
  getPromptButtonsForUser,
  getChatPlaceholder,
  getScopedChatPlaceholder,
  getAreaScopedPrompts,
  detectRestrictedArea,
  generateModuleRestrictionResponse,
  getAreaDisplayName,
  AREA_META,
  type PromptButton,
} from "@/data/conversation-prompts";
import { normalizeAreaId, toRouteAreaId } from "@/data/business-areas";
import { sleep, generateId } from "@/lib/utils";
import { ROUTES } from "@/lib/routes";
import type { Message } from "@/types/chat";
import type { ChatAttachment } from "@/components/chat/chat-input";
import { canCreateChat, canSendChatMessage, canAccessModule, canEditProject } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { resolveDemoResponse } from "@/lib/demo-chat-resolver";
import type { MessageBlock } from "@/types/chat";
import type { ProjectBrief, Project } from "@/types/analytics";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractBriefFromBlocks(blocks: MessageBlock[], project: Project): ProjectBrief {
  const bpData = (blocks.find((b) => b.type === "brief-proposal")?.data ?? {}) as Partial<ProjectBrief>;
  if (bpData.problem && bpData.hypothesis && bpData.strategy && bpData.expectedOutcome) {
    return bpData as ProjectBrief;
  }
  const summary = (blocks.find((b) => b.type === "executive-summary")?.data as { summary?: string } | undefined)?.summary ?? "";
  const recs = (blocks.find((b) => b.type === "recommendations")?.data as { recommendations?: { title: string; description?: string }[] } | undefined)?.recommendations ?? [];
  return {
    problem: project.brief?.problem ?? (summary ? summary.slice(0, 200) : `Definir el problema central que aborda ${project.name}.`),
    hypothesis: project.brief?.hypothesis ?? (recs[0] ? `${recs[0].title}. ${recs[0].description ?? ""}`.trim() : "La brecha de performance responde a múltiples causas que requieren diagnóstico."),
    strategy: project.brief?.strategy ?? (recs[1] ? `${recs[1].title}. ${recs[1].description ?? ""}`.trim() : "Estructurar iniciativas priorizadas con responsables y KPIs claros."),
    expectedOutcome: project.brief?.expectedOutcome ?? "Equipo alineado con lectura compartida del problema y plan de acción priorizado.",
  };
}

function extractFollowUp(response: Message): string[] {
  const block = response.blocks?.find((b) => b.type === "follow-up-questions");
  if (!block) return [];
  const data = block.data as { questions?: string[] };
  return data.questions ?? [];
}

// ─── Area visual config ───────────────────────────────────────────────────────

type AreaColor = "primary" | "accent" | "success" | "warning" | "danger" | "info";

interface AreaVisual {
  Icon: ComponentType<{ className?: string }>;
  color: AreaColor;
  heading: string;
  subheading: string;
}

const AREA_VISUAL: Record<string, AreaVisual> = {
  ventas:             { Icon: TrendingUp,  color: "accent",   heading: "¿Qué querés analizar en Ventas?",         subheading: "Sell-in, sell-out, canales, clientes y performance comercial" },
  "sell-through":     { Icon: Map,         color: "accent",   heading: "¿Qué querés analizar en Sell-Through?",   subheading: "Distribución numérica, passthrough y ejecución en punto de venta" },
  finanzas:           { Icon: PieChart,    color: "success",  heading: "¿Qué querés analizar en Finanzas?",       subheading: "EBITDA, márgenes, trade spend y estructura de costos" },
  rgm:                { Icon: DollarSign,  color: "primary",  heading: "¿Qué querés analizar en RGM?",            subheading: "Price index, simulaciones de precio y elasticidad de demanda" },
  "trade-marketing":  { Icon: ShoppingCart,color: "warning",  heading: "¿Qué querés analizar en Trade Marketing?",subheading: "ROI de trade spend, performance de promos y presupuesto disponible" },
  supply:             { Icon: Package,     color: "info",     heading: "¿Qué querés analizar en Supply Chain?",   subheading: "OOS, OTIF, cobertura de stock y riesgo de desabasto" },
  planning:           { Icon: Calendar,    color: "primary",  heading: "¿Qué querés analizar en Planning?",       subheading: "Forecast, escenarios de demanda y decisiones de portafolio" },
};

const ICON_COLOR_CLASSES: Record<AreaColor, { ring: string; bg: string; icon: string; badge: string; dot: string }> = {
  primary: { ring: "border-primary/25", bg: "bg-primary/10",  icon: "text-primary",      badge: "bg-primary/10 border-primary/25 text-primary-soft", dot: "bg-primary/60" },
  accent:  { ring: "border-accent/25",  bg: "bg-accent/10",   icon: "text-accent",        badge: "bg-accent/10 border-accent/25 text-accent",          dot: "bg-accent/60"  },
  success: { ring: "border-success/25", bg: "bg-success/10",  icon: "text-success",       badge: "bg-success/10 border-success/25 text-success",       dot: "bg-success/60" },
  warning: { ring: "border-warning/25", bg: "bg-warning/10",  icon: "text-warning",       badge: "bg-warning/10 border-warning/25 text-warning",       dot: "bg-warning/60" },
  danger:  { ring: "border-danger/25",  bg: "bg-danger/10",   icon: "text-danger",        badge: "bg-danger/10 border-danger/25 text-danger",          dot: "bg-danger/60"  },
  info:    { ring: "border-info/25",    bg: "bg-info/10",     icon: "text-info",          badge: "bg-info/10 border-info/25 text-info",                dot: "bg-info/60"    },
};

// ─── Empty state variants ─────────────────────────────────────────────────────

function GlobalEmptyState({
  hasData,
  datasetLabel,
  suggestedPrompts,
  placeholder,
  canChat,
  onSend,
  onGoToDataSources,
  accessibleModules,
}: {
  hasData: boolean;
  datasetLabel: string;
  suggestedPrompts: PromptButton[];
  placeholder: string;
  canChat: boolean;
  onSend: (msg: string) => void;
  onGoToDataSources: () => void;
  accessibleModules: string[];
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 flex flex-col items-center justify-center p-6 text-center"
    >
      <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5">
        <Sparkles className="h-7 w-7 text-primary" />
      </div>

      {!hasData ? (
        <>
          <h1 className="text-2xl font-bold text-text-primary mb-2">Conectá tus datos para activar tu cerebro comercial</h1>
          <p className="text-text-muted max-w-md mb-4 leading-relaxed">
            Nexus centraliza la información de tu empresa para ayudarte a analizar ventas, rentabilidad, marketing, supply chain, finanzas y generar planes de acción en lenguaje natural.
          </p>
          {accessibleModules.length > 0 && (
            <div className="flex flex-wrap gap-1.5 justify-center mb-5">
              {accessibleModules.map((moduleId) => {
                const meta = AREA_META.find((a) => a.id === moduleId);
                if (!meta) return null;
                return (
                  <span key={moduleId} className="text-[10px] font-medium px-2 py-0.5 rounded-full border bg-surface-soft border-border text-text-muted">
                    {meta.name}
                  </span>
                );
              })}
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <Button variant="primary" onClick={onGoToDataSources} size="lg">
              <Database className="h-4 w-4" />
              Ir a Fuentes de datos
            </Button>
          </div>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-bold text-text-primary mb-2">¿Qué querés analizar hoy?</h1>
          <p className="text-text-muted max-w-md mb-2 leading-relaxed">
            Preguntá en lenguaje natural. Nexus traduce tu consulta a datos, métricas, gráficos y acciones.
          </p>
          {accessibleModules.length > 0 && (
            <div className="flex flex-wrap gap-1.5 justify-center mb-3">
              {accessibleModules.map((moduleId) => {
                const meta = AREA_META.find((a) => a.id === moduleId);
                if (!meta) return null;
                return (
                  <span key={moduleId} className="text-[10px] font-medium px-2 py-0.5 rounded-full border bg-surface-soft border-border text-text-muted">
                    {meta.name}
                  </span>
                );
              })}
            </div>
          )}
          <p className="text-xs text-text-muted mb-6">{datasetLabel}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-8 w-full max-w-xl">
            {suggestedPrompts.map((p) => (
              <button
                key={p.question}
                onClick={() => { if (canChat) onSend(p.question); }}
                disabled={!canChat}
                className="text-left text-xs text-text-secondary hover:text-text-primary border border-border hover:border-primary/30 hover:bg-surface-soft rounded-lg px-3.5 py-2.5 transition-all leading-snug"
              >
                {p.display}
              </button>
            ))}
          </div>
        </>
      )}

      <div className="w-full max-w-xl">
        <ChatInput onSend={onSend} disabled={!canChat} placeholder={placeholder} />
      </div>
    </motion.div>
  );
}

function ScopedEmptyState({
  area,
  hasData,
  datasetLabel,
  suggestedPrompts,
  placeholder,
  canChat,
  onSend,
  onGoToDataSources,
}: {
  area: string;
  hasData: boolean;
  datasetLabel: string;
  suggestedPrompts: PromptButton[];
  placeholder: string;
  canChat: boolean;
  onSend: (msg: string) => void;
  onGoToDataSources: () => void;
}) {
  const visual = AREA_VISUAL[area];
  const areaName = getAreaDisplayName(area);

  if (!visual) {
    // Fallback to global if area is unrecognised
    return null;
  }

  const { Icon, color, heading, subheading } = visual;
  const colors = ICON_COLOR_CLASSES[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 flex flex-col items-center justify-center p-6 text-center"
    >
      {/* Area badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.05 }}
        className="mb-4"
      >
        <span className={cn(
          "inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded-full border",
          colors.badge
        )}>
          <span className={cn("h-1.5 w-1.5 rounded-full", colors.dot)} />
          {areaName}
        </span>
      </motion.div>

      {/* Area icon */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.08 }}
        className={cn(
          "h-14 w-14 rounded-2xl border flex items-center justify-center mb-5",
          colors.bg, colors.ring
        )}
      >
        <Icon className={cn("h-7 w-7", colors.icon)} />
      </motion.div>

      {/* Heading */}
      {!hasData ? (
        <>
          <h1 className="text-2xl font-bold text-text-primary mb-2">Conectá datos para analizar {areaName}</h1>
          <p className="text-text-muted max-w-md mb-2 leading-relaxed">{subheading}</p>
          <p className="text-xs text-text-muted mb-6">Cargá un dataset o activá la demo CPG para comenzar.</p>
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <Button variant="primary" onClick={onGoToDataSources} size="lg">
              <Database className="h-4 w-4" />
              Ir a Fuentes de datos
            </Button>
          </div>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-bold text-text-primary mb-2">{heading}</h1>
          <p className="text-text-muted max-w-sm mb-2 text-sm leading-relaxed">{subheading}</p>
          <p className="text-xs text-text-muted mb-6">{datasetLabel}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-8 w-full max-w-xl">
            {suggestedPrompts.map((p) => (
              <button
                key={p.question}
                onClick={() => { if (canChat) onSend(p.question); }}
                disabled={!canChat}
                className={cn(
                  "text-left text-xs border rounded-lg px-3.5 py-2.5 transition-all leading-snug",
                  "text-text-secondary hover:text-text-primary",
                  "border-border hover:border-primary/30 hover:bg-surface-soft"
                )}
              >
                {p.display}
              </button>
            ))}
          </div>
        </>
      )}

      <div className="w-full max-w-xl">
        <ChatInput onSend={onSend} disabled={!canChat} placeholder={placeholder} />
      </div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function WorkspacePage() {
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);

  const {
    activeConversationId,
    conversations,
    projects,
    getMessages,
    addMessage,
    isThinking,
    setThinking,
    thinkingSteps,
    setThinkingSteps,
    updateThinkingStep,
    createConversation,
    setConversationTitle,
    classifyConversationAreas,
    updateProject,
  } = useChatStore();
  const { hasDemoLoaded, fileDataset, integrationDataset, activeDatasetSource } = useDataSourceStore();
  const { user } = useAuthStore();
  const processedDataset = getActiveDataset({ activeDatasetSource, fileDataset, integrationDataset, hasDemoLoaded });
  const datasetState = getWorkspaceDatasetState({ activeDatasetSource, fileDataset, integrationDataset, hasDemoLoaded });
  const hasData = datasetState !== "empty";
  const datasetLabel = datasetState === "demo"
    ? "Demo CPG Portfolio 2025-2026 conectada — consumo masivo · YTD 2026"
    : processedDataset
      ? `${processedDataset.fileName} conectado — dataset real · ${processedDataset.sheets.reduce((total, sheet) => total + sheet.rows, 0).toLocaleString("es-AR")} filas`
      : "Dataset activo";
  const canChat = canCreateChat(user) && canSendChatMessage(user);
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = activeConversationId ? getMessages(activeConversationId) : [];
  const activeConversation = activeConversationId ? conversations.find((c) => c.id === activeConversationId) : undefined;
  const activeProject = activeConversation?.projectId ? projects.find((p) => p.id === activeConversation.projectId) : undefined;
  const activeArea = activeConversation?.primaryAreaId ?? activeConversation?.areaIds?.[0] ?? normalizeAreaId(activeConversation?.area);
  // scope drives prompts + placeholder + empty state visual
  const activeScope = activeConversation?.scope ?? toRouteAreaId(activeArea);
  const isScoped = activeScope && activeScope !== "global";

  // Best available area for context bar: classified area if set, else scope if scoped
  const contextArea = activeArea ?? (isScoped ? activeScope : undefined);

  // Accessible modules for the current user (used in global empty state chips)
  const accessibleModules = (user?.enabledModules ?? []).filter((m) => canAccessModule(user, m));

  // Prompts: follow-up from last message > area-scoped > global
  const lastAssistantMsg = [...messages].reverse().find((m) => m.role === "assistant");
  const followUpFromLastResponse = lastAssistantMsg ? extractFollowUp(lastAssistantMsg) : [];
  const suggestedPrompts: PromptButton[] = followUpFromLastResponse.length > 0
    ? followUpFromLastResponse.map((q) => ({ display: q, question: q }))
    : isScoped
      ? getAreaScopedPrompts(activeScope, user)
      : getPromptButtonsForUser(user);

  // Placeholder: area-scoped or role-based
  const placeholder = canChat
    ? isScoped
      ? getScopedChatPlaceholder(activeScope, user)
      : getChatPlaceholder(user)
    : "Modo solo lectura: no podés enviar mensajes.";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  async function sendMessage(content: string, attachment?: ChatAttachment) {
    if (!canChat) return;

    // Check module restriction before doing anything
    const restrictedArea = detectRestrictedArea(content, user);
    if (restrictedArea) {
      let convId = activeConversationId;
      if (!convId) {
        const conv = createConversation();
        convId = conv.id;
      }
      const isFirst = getMessages(convId).length === 0;
      addMessage(convId, {
        id: `msg-${generateId()}`,
        role: "user",
        content,
        attachment,
        timestamp: new Date().toISOString(),
      });
      if (isFirst) setConversationTitle(convId, content);
      addMessage(convId, generateModuleRestrictionResponse(restrictedArea));
      return;
    }

    let convId = activeConversationId;
    if (!convId) {
      const conv = createConversation();
      convId = conv.id;
    }

    const isFirst = getMessages(convId).length === 0;

    addMessage(convId, {
      id: `msg-${generateId()}`,
      role: "user",
      content,
      attachment,
      timestamp: new Date().toISOString(),
    });

    if (isFirst) {
      setConversationTitle(convId, content);
      // Auto-classify area only when conversation has no area yet
      const conv = conversations.find((c) => c.id === convId);
      if (!conv?.areaIds?.length) classifyConversationAreas(convId, content);
    }

    setThinking(true);
    const contextualLabels = getContextualAgentSteps(content);
    const steps = contextualLabels.map((label) => ({ label, status: "pending" as const }));
    setThinkingSteps(steps);

    for (let i = 0; i < steps.length; i++) {
      updateThinkingStep(i, "running");
      await sleep(300 + Math.random() * 220);
      updateThinkingStep(i, "done");
    }

    await sleep(280);
    setThinking(false);

    let response: Message;
    const projectDemoResponse = activeProject ? resolveDemoResponse(content) : null;
    const advisory = hasData ? getAdvisoryResponse(content) : null;
    if (projectDemoResponse) {
      response = projectDemoResponse;
    } else if (advisory) {
      response = advisory;
    } else if (hasDemoLoaded && activeDatasetSource === "demo") {
      response = getResponseForQuestion(content);
    } else if (processedDataset) {
      response = generateRealDataResponse(content, processedDataset.salesKpis, processedDataset.fileName);
    } else {
      response = generateNoDataResponse(content);
    }

    if (response.content) {
      setStreamingMessageId(response.id);
      const streamDuration = Math.ceil(response.content.length / 5) * 38 + 600;
      setTimeout(() => setStreamingMessageId(null), streamDuration);
    }

    addMessage(convId, response);
  }

  function handleCompleteBrief(blocks: MessageBlock[]) {
    if (!activeProject) return;
    const brief = extractBriefFromBlocks(blocks, activeProject);
    updateProject(activeProject.id, { brief });
    router.push(`/workspace/projects/${activeProject.id}?tab=resumen`);
  }

  const canCompleteBrief = activeProject ? canEditProject(user, activeProject) : false;

  const hasMessages = messages.length > 0;
  const showEmpty = !hasMessages && !isThinking;

  return (
    <div className="flex flex-col h-full">
      {/* Empty state — scoped */}
      {showEmpty && isScoped && AREA_VISUAL[activeScope] && (
        <ScopedEmptyState
          area={activeScope}
          hasData={hasData}
          datasetLabel={datasetLabel}
          suggestedPrompts={suggestedPrompts}
          placeholder={placeholder}
          canChat={canChat}
          onSend={(msg) => void sendMessage(msg)}
          onGoToDataSources={() => router.push(ROUTES.DATA_SOURCES)}
        />
      )}

      {/* Empty state — global (no data) */}
      {showEmpty && (!isScoped || !AREA_VISUAL[activeScope!]) && !hasData && (
        <GlobalEmptyState
          hasData={false}
          datasetLabel={datasetLabel}
          suggestedPrompts={suggestedPrompts}
          placeholder={placeholder}
          canChat={canChat}
          onSend={(msg) => void sendMessage(msg)}
          onGoToDataSources={() => router.push(ROUTES.DATA_SOURCES)}
          accessibleModules={accessibleModules}
        />
      )}

      {/* Empty state — global (data loaded) */}
      {showEmpty && (!isScoped || !AREA_VISUAL[activeScope!]) && hasData && (
        <GlobalEmptyState
          hasData={true}
          datasetLabel={datasetLabel}
          suggestedPrompts={suggestedPrompts}
          placeholder={placeholder}
          canChat={canChat}
          onSend={(msg) => void sendMessage(msg)}
          onGoToDataSources={() => router.push(ROUTES.DATA_SOURCES)}
          accessibleModules={accessibleModules}
        />
      )}

      {/* Chat view */}
      {(hasMessages || isThinking) && (
        <>
          {/* Sticky context bar — sits above the scroll area, always visible */}
          {activeConversation && (contextArea || activeProject) && (
            <ConversationContextBanner
              conversation={activeConversation}
              project={activeProject}
              area={contextArea}
            />
          )}

          <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 max-w-3xl w-full mx-auto">
            {hasData && messages.length === 0 && !isThinking && (
              <MessageItem message={MOCK_INITIAL_MESSAGE} onFollowUp={canChat ? sendMessage : undefined} />
            )}
            {messages.map((msg) => (
              <MessageItem
                key={msg.id}
                message={msg}
                isStreaming={msg.id === streamingMessageId}
                onFollowUp={canChat ? sendMessage : undefined}
                onCompleteBrief={canCompleteBrief ? handleCompleteBrief : undefined}
                projectName={activeProject?.name}
              />
            ))}
            <AnimatePresence>
              {isThinking && <AgentThinking steps={thinkingSteps} />}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-border bg-background/80 backdrop-blur px-4 md:px-6 py-4">
            <div className="max-w-3xl mx-auto">
              <ChatInput
                onSend={(msg, att) => void sendMessage(msg, att)}
                disabled={isThinking || !canChat}
                placeholder={placeholder}
              />
              {!canChat && (
                <p className="text-center text-[10px] text-text-muted mt-2">
                  Modo solo lectura: no podés enviar mensajes.
                </p>
              )}
              <p className="text-center text-[10px] text-text-muted mt-2">
                Nexus puede cometer errores. Verificá información crítica antes de tomar decisiones.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
