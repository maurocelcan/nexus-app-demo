import { cn } from "@/lib/utils";
import { BUSINESS_AREAS, getBusinessArea, normalizeAreaId, normalizeAreaIds, type BusinessAreaId } from "@/data/business-areas";

type AreaBadgeSize = "xs" | "sm";

const COLOR_CLASSES = {
  accent: {
    dot: "bg-accent/70",
    badge: "bg-accent/10 border-accent/25 text-accent",
  },
  default: {
    dot: "bg-text-muted/60",
    badge: "bg-surface-soft border-border text-text-secondary",
  },
  info: {
    dot: "bg-info/70",
    badge: "bg-info/10 border-info/25 text-info",
  },
  warning: {
    dot: "bg-warning/70",
    badge: "bg-warning/10 border-warning/25 text-warning",
  },
  primary: {
    dot: "bg-primary/70",
    badge: "bg-primary/10 border-primary/25 text-primary-soft",
  },
  success: {
    dot: "bg-success/70",
    badge: "bg-success/10 border-success/25 text-success",
  },
} as const;

const SIZE_CLASSES: Record<AreaBadgeSize, string> = {
  xs: "px-1.5 py-0.5 text-[10px]",
  sm: "px-2 py-0.5 text-xs",
};

function resolveArea(areaId: BusinessAreaId | string | null | undefined) {
  return getBusinessArea(typeof areaId === "string" ? normalizeAreaId(areaId) : areaId ?? null);
}

export function AreaDot({ areaId, className }: { areaId: BusinessAreaId | string | null | undefined; className?: string }) {
  const area = resolveArea(areaId);
  const color = area ? COLOR_CLASSES[area.color] : COLOR_CLASSES.default;
  return <span className={cn("h-1.5 w-1.5 rounded-full flex-shrink-0", color.dot, className)} />;
}

export function AreaBadge({
  areaId,
  short = false,
  size = "sm",
  className,
}: {
  areaId: BusinessAreaId | string | null | undefined;
  short?: boolean;
  size?: AreaBadgeSize;
  className?: string;
}) {
  const area = resolveArea(areaId);
  if (!area) return null;
  const color = COLOR_CLASSES[area.color];

  return (
    <span
      title={area.label}
      className={cn(
        "inline-flex max-w-full items-center gap-1 rounded-full border font-medium leading-none",
        color.badge,
        SIZE_CLASSES[size],
        className
      )}
    >
      <AreaDot areaId={area.id} />
      <span className="truncate">{short ? area.shortLabel : area.label}</span>
    </span>
  );
}

export function AreaList({
  areaIds,
  max = 2,
  short = false,
  size = "xs",
  className,
}: {
  areaIds: unknown;
  max?: number;
  short?: boolean;
  size?: AreaBadgeSize;
  className?: string;
}) {
  const ids = normalizeAreaIds(areaIds);
  if (ids.length === 0) return null;
  const visible = ids.slice(0, max);
  const hidden = ids.length - visible.length;

  return (
    <div className={cn("flex min-w-0 flex-wrap items-center gap-1", className)}>
      {visible.map((id) => (
        <AreaBadge key={id} areaId={id} short={short} size={size} />
      ))}
      {hidden > 0 && (
        <span
          title={ids.map((id) => getBusinessArea(id)?.label).filter(Boolean).join(", ")}
          className="inline-flex rounded-full border border-border bg-surface-soft px-1.5 py-0.5 text-[10px] font-medium leading-none text-text-muted"
        >
          +{hidden}
        </span>
      )}
    </div>
  );
}

export function ConversationAreaBadge({ conversation, compact = false }: { conversation: { areaIds?: unknown; primaryAreaId?: unknown; area?: unknown; scope?: unknown }; compact?: boolean }) {
  const areaIds = normalizeAreaIds(
    Array.isArray(conversation.areaIds) && conversation.areaIds.length > 0
      ? conversation.areaIds
      : [conversation.primaryAreaId, conversation.area, conversation.scope]
  );

  if (areaIds.length === 0) return null;

  if (compact) {
    return (
      <div className="flex min-w-0 items-center gap-1.5" title={areaIds.map((id) => getBusinessArea(id)?.label).join(", ")}>
        <AreaDot areaId={areaIds[0]} />
        <span className="truncate text-xs text-text-muted">{getBusinessArea(areaIds[0])?.shortLabel}</span>
      </div>
    );
  }

  return <AreaList areaIds={areaIds} max={2} short size="xs" />;
}

export const BUSINESS_AREA_OPTIONS = BUSINESS_AREAS.map((area) => ({
  value: area.id,
  label: area.label,
}));
