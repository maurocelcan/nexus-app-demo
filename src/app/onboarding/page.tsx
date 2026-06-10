"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, Upload, Database, BarChart2, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { NexusLogo } from "@/components/layout/logo";
import { useAuthStore } from "@/stores/auth-store";
import { useWorkspaceStore, getDefaultWorkspace } from "@/stores/workspace-store";
import { useDataSourceStore } from "@/stores/data-source-store";
import { BUSINESS_AREAS } from "@/data/mock-workspace";
import { ROUTES } from "@/lib/routes";
import { cn, sleep } from "@/lib/utils";
import type { DataSourceType } from "@/types/data-source";

const STEPS = ["Workspace", "Áreas", "Datos", "Listo"];

const INDUSTRIES = [
  { value: "cpg", label: "Consumo Masivo / CPG" },
  { value: "alimentos", label: "Alimentos y Bebidas" },
  { value: "retail", label: "Retail" },
  { value: "farma", label: "Farmacéutica" },
  { value: "otro", label: "Otro" },
];
const SIZES = [
  { value: "1-20", label: "1–20 personas" },
  { value: "20-50", label: "20–50 personas" },
  { value: "50-200", label: "50–200 personas" },
  { value: "200+", label: "+200 personas" },
];
const REGIONS = [
  { value: "ar", label: "Argentina" },
  { value: "latam", label: "LATAM" },
  { value: "mx", label: "México" },
  { value: "br", label: "Brasil" },
  { value: "us", label: "Estados Unidos" },
];

const INTEGRATION_TABS = ["Hojas de cálculo", "CRM", "ERP", "BI", "Base de datos", "Otra fuente"] as const;
const INTEGRATIONS_BY_TAB: Record<(typeof INTEGRATION_TABS)[number], { name: string; type: DataSourceType; icon: string }[]> = {
  "Hojas de cálculo": [{ name: "Google Sheets", type: "google-sheets", icon: "google-sheets" }],
  CRM: [{ name: "HubSpot", type: "hubspot", icon: "hubspot" }, { name: "Salesforce", type: "salesforce", icon: "salesforce" }],
  ERP: [{ name: "SAP", type: "sap", icon: "sap" }],
  BI: [{ name: "Power BI", type: "power-bi", icon: "power-bi" }, { name: "Looker", type: "looker", icon: "looker" }],
  "Base de datos": [{ name: "SQL Database", type: "sql", icon: "sql" }],
  "Otra fuente": [{ name: "Otra / Custom", type: "custom", icon: "custom" }],
};

function IntegrationModal({
  onClose,
  onConnected,
}: {
  onClose: () => void;
  onConnected: (source: { name: string; type: DataSourceType; icon: string; description: string }) => void;
}) {
  const [tab, setTab] = useState<(typeof INTEGRATION_TABS)[number]>("Hojas de cálculo");
  const [custom, setCustom] = useState({ name: "", type: "ERP local", frequency: "Semanal", owner: "Mauro Celani" });

  function connect(source: { name: string; type: DataSourceType; icon: string }) {
    onConnected({
      ...source,
      description: source.type === "custom"
        ? `${custom.type || "Fuente custom"} · actualización ${custom.frequency.toLowerCase()} · owner ${custom.owner || "sin owner"}`
        : "Conexión mock creada desde onboarding",
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl rounded-xl border border-border bg-surface-elevated p-5 shadow-2xl">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-text-primary">Conectar integración</h3>
            <p className="text-xs text-text-muted mt-0.5">Elegí una fuente y simulá la conexión para continuar.</p>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors"><X className="h-4 w-4" /></button>
        </div>
        <div className="flex gap-1 overflow-x-auto border-b border-border mb-4">
          {INTEGRATION_TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)} className={cn("px-3 py-2 text-xs border-b-2 whitespace-nowrap transition-colors", tab === t ? "border-primary text-primary" : "border-transparent text-text-muted hover:text-text-secondary")}>{t}</button>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {INTEGRATIONS_BY_TAB[tab].map((source) => (
            <div key={source.name} className="rounded-lg border border-border bg-surface p-4">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-lg border border-border bg-surface-soft flex items-center justify-center">
                  <Database className="h-4 w-4 text-text-secondary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-text-primary">{source.name}</p>
                  <p className="text-xs text-text-muted mt-0.5">Conexión mock, sin APIs externas.</p>
                </div>
              </div>
              {source.type === "custom" && (
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <input value={custom.name} onChange={(e) => setCustom((c) => ({ ...c, name: e.target.value }))} placeholder="Nombre fuente" className="col-span-2 text-xs bg-surface-elevated border border-border rounded px-2 py-1.5 text-text-primary outline-none focus:border-primary" />
                  <input value={custom.type} onChange={(e) => setCustom((c) => ({ ...c, type: e.target.value }))} placeholder="Tipo" className="text-xs bg-surface-elevated border border-border rounded px-2 py-1.5 text-text-primary outline-none focus:border-primary" />
                  <input value={custom.frequency} onChange={(e) => setCustom((c) => ({ ...c, frequency: e.target.value }))} placeholder="Frecuencia" className="text-xs bg-surface-elevated border border-border rounded px-2 py-1.5 text-text-primary outline-none focus:border-primary" />
                  <input value={custom.owner} onChange={(e) => setCustom((c) => ({ ...c, owner: e.target.value }))} placeholder="Owner" className="col-span-2 text-xs bg-surface-elevated border border-border rounded px-2 py-1.5 text-text-primary outline-none focus:border-primary" />
                </div>
              )}
              <button
                onClick={() => connect(source.type === "custom" ? { ...source, name: custom.name.trim() || "Fuente custom" } : source)}
                className="mt-3 w-full rounded-md bg-primary px-3 py-2 text-xs font-medium text-white hover:bg-primary/90 transition-colors"
              >
                Conectar mock
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const { setOnboarded } = useAuthStore();
  const { setWorkspace, setActiveAreas } = useWorkspaceStore();
  const { addFile, addIntegration } = useDataSourceStore();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [wsForm, setWsForm] = useState({ name: "CPG Growth Team", industry: "cpg", size: "50-200", region: "ar" });
  const [selectedAreas, setSelectedAreas] = useState<string[]>(["ventas", "rgm", "trade-marketing", "sell-through", "finanzas"]);
  const [dataChoice, setDataChoice] = useState<"file" | "external" | "skip" | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [integrationOpen, setIntegrationOpen] = useState(false);
  const [connectedSource, setConnectedSource] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function toggleArea(id: string) {
    setSelectedAreas((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  }

  async function handleFinish() {
    setLoading(true);
    const ws = getDefaultWorkspace();
    ws.name = wsForm.name;
    ws.industry = wsForm.industry;
    ws.size = wsForm.size;
    ws.region = wsForm.region;
    ws.activeAreas = selectedAreas;
    setWorkspace(ws);
    setActiveAreas(selectedAreas);
    if (dataChoice === "file" && selectedFile) {
      addFile({
        name: selectedFile.name,
        type: selectedFile.name.split(".").pop() ?? "file",
        size: `${Math.max(0.1, selectedFile.size / 1024 / 1024).toFixed(1)} MB`,
        area: "Ventas",
        category: "sell-in",
        status: "processed",
        period: "YTD 2026",
        description: "Archivo cargado desde onboarding",
        uploadedAt: new Date().toISOString(),
        owner: "Mauro Celani",
        rows: 1200,
      });
    }
    await sleep(800);
    setOnboarded(true);
    router.push(ROUTES.WORKSPACE);
  }

  const canNext = step === 0
    ? wsForm.name.length > 0
    : step === 1
    ? selectedAreas.length > 0
    : step === 2
    ? (dataChoice !== null && (dataChoice !== "file" || selectedFile !== null))
    : true;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-xl relative">
        <div className="flex justify-center mb-8">
          <NexusLogo size="md" />
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={cn(
                "h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 transition-all",
                i < step && "bg-primary text-white",
                i === step && "bg-primary/20 border-2 border-primary text-primary",
                i > step && "bg-surface-elevated border border-border text-text-muted"
              )}>
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className={cn("text-xs hidden sm:block", i === step ? "text-text-primary font-medium" : "text-text-muted")}>{s}</span>
              {i < STEPS.length - 1 && <div className={cn("flex-1 h-px", i < step ? "bg-primary/50" : "bg-border")} />}
            </div>
          ))}
        </div>

        <div className="bg-surface-elevated border border-border rounded-xl p-8">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-lg font-semibold text-text-primary mb-1">Creá tu workspace</h2>
                <p className="text-sm text-text-muted mb-6">Configurá el espacio de trabajo para tu equipo</p>
                <div className="space-y-4">
                  <Input label="Nombre del workspace" value={wsForm.name} onChange={(e) => setWsForm((f) => ({ ...f, name: e.target.value }))} placeholder="Ej: CPG Growth Team" />
                  <Select label="Industria" value={wsForm.industry} onChange={(e) => setWsForm((f) => ({ ...f, industry: e.target.value }))} options={INDUSTRIES} />
                  <div className="grid grid-cols-2 gap-4">
                    <Select label="Tamaño" value={wsForm.size} onChange={(e) => setWsForm((f) => ({ ...f, size: e.target.value }))} options={SIZES} />
                    <Select label="Región" value={wsForm.region} onChange={(e) => setWsForm((f) => ({ ...f, region: e.target.value }))} options={REGIONS} />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-lg font-semibold text-text-primary mb-1">Elegí tus áreas activas</h2>
                <p className="text-sm text-text-muted mb-6">Seleccioná las áreas que usa tu equipo</p>
                <div className="grid grid-cols-2 gap-3">
                  {BUSINESS_AREAS.map((area) => {
                    const isSelected = selectedAreas.includes(area.id);
                    return (
                      <button
                        key={area.id}
                        onClick={() => toggleArea(area.id)}
                        className={cn(
                          "flex items-start gap-3 rounded-lg border p-3.5 text-left transition-all",
                          isSelected
                            ? "border-primary/40 bg-primary/10 text-primary-soft"
                            : "border-border bg-surface hover:border-border-soft hover:bg-surface-soft text-text-secondary"
                        )}
                      >
                        <div className={cn(
                          "h-6 w-6 rounded-md flex items-center justify-center flex-shrink-0",
                          isSelected ? "bg-primary/20" : "bg-surface-soft"
                        )}>
                          {isSelected ? <Check className="h-3.5 w-3.5 text-primary" /> : <BarChart2 className="h-3.5 w-3.5 text-text-muted" />}
                        </div>
                        <div>
                          <div className="text-sm font-medium leading-tight">{area.name}</div>
                          <div className="text-xs text-text-muted mt-0.5 line-clamp-1">{area.description}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-lg font-semibold text-text-primary mb-1">Conectá tus datos comerciales</h2>
                <p className="text-sm text-text-muted mb-6">Podés conectar una fuente ahora, subir archivos, probar una demo o continuar y hacerlo más tarde.</p>
                <div className="space-y-3">
                  {/* File upload */}
                  <div className={cn(
                    "rounded-lg border p-4 transition-all cursor-pointer",
                    dataChoice === "file" ? "border-primary/40 bg-primary/10" : "border-border bg-surface hover:border-border-soft hover:bg-surface-soft"
                  )}>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) { setSelectedFile(f); setDataChoice("file"); }
                      }}
                    />
                    <div
                      className="flex items-center gap-3"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <Upload className="h-5 w-5 text-accent" />
                      </div>
                      <div className="flex-1">
                        <span className="text-sm font-medium text-text-primary">Subir archivo</span>
                        <p className="text-xs text-text-muted mt-0.5">
                          {selectedFile ? (
                            <span className="text-success flex items-center gap-1"><FileText className="h-3 w-3" />{selectedFile.name}</span>
                          ) : "CSV, Excel o reportes exportados desde tu ERP/BI."}
                        </p>
                      </div>
                      {selectedFile && <Check className="h-4 w-4 text-primary flex-shrink-0" />}
                    </div>
                  </div>

                  {/* External */}
                  <div
                    onClick={() => setIntegrationOpen(true)}
                    className={cn(
                      "rounded-lg border p-4 transition-all cursor-pointer",
                      dataChoice === "external" ? "border-primary/40 bg-primary/10" : "border-border bg-surface hover:border-border-soft hover:bg-surface-soft"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center flex-shrink-0">
                        <Database className="h-5 w-5 text-info" />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-text-primary">Conectar fuente externa</span>
                        <p className="text-xs text-text-muted mt-0.5">{connectedSource ?? "Google Sheets, CRM, BI, ERP, SQL u otra fuente empresarial."}</p>
                      </div>
                      {connectedSource && <Check className="h-4 w-4 text-primary ml-auto" />}
                    </div>
                  </div>

                  <button onClick={() => setDataChoice("skip")} className={cn("w-full text-xs text-text-muted hover:text-text-secondary transition-colors py-2", dataChoice === "skip" && "text-primary-soft")}>
                    Omitir por ahora
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
                <div className="h-16 w-16 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-5">
                  <Check className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-text-primary mb-2">¡Tu workspace está listo!</h2>
                <p className="text-sm text-text-muted mb-6">
                  <span className="font-medium text-text-secondary">{wsForm.name}</span> fue configurado con{" "}
                  {selectedAreas.length} áreas activas.
                </p>
                <Button variant="primary" size="lg" onClick={handleFinish} loading={loading} className="w-full sm:w-auto">
                  Ir al cerebro comercial
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {step < 3 && (
          <div className="flex justify-between mt-4">
            <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
              Atrás
            </Button>
            <Button variant="primary" onClick={() => setStep((s) => s + 1)} disabled={!canNext}>
              {step === 2 ? "Finalizar" : "Siguiente"}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
        {integrationOpen && (
          <IntegrationModal
            onClose={() => setIntegrationOpen(false)}
            onConnected={(source) => {
              addIntegration({
                type: source.type,
                name: source.name,
                description: source.description,
                icon: source.icon,
                status: "connected",
                connectedAt: new Date().toISOString(),
                lastSync: new Date().toISOString(),
              });
              setConnectedSource(`${source.name} conectado`);
              setDataChoice("external");
              setIntegrationOpen(false);
            }}
          />
        )}
      </div>
    </div>
  );
}
