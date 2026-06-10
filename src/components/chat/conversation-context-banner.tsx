"use client";

import { FolderOpen, ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Conversation, Project } from "@/types/analytics";
import { getBusinessArea, normalizeAreaId, normalizeAreaIds } from "@/data/business-areas";
import { AreaDot } from "@/components/ui/area-badge";

interface ConversationContextBannerProps {
  conversation: Conversation;
  project?: Project;
  area?: string;
}


export function ConversationContextBanner({ conversation, project, area }: ConversationContextBannerProps) {
  const router = useRouter();
  const areaId = normalizeAreaIds(conversation.areaIds).at(0) ?? normalizeAreaId(area ?? conversation.primaryAreaId ?? conversation.area ?? conversation.scope);
  const areaMeta = getBusinessArea(areaId);

  if (!areaMeta && !project) return null;

  function goToProject() {
    if (!project) return;
    router.push(`/workspace/projects/${project.id}?tab=chat`);
  }

  return (
    <div className="flex-shrink-0 border-b border-border/25 bg-surface/20 backdrop-blur-sm">
      <div className="px-4 md:px-6 h-10 flex items-center gap-3">

        {/* Left: project (primary entity) or area name */}
        <div className="flex-1 flex items-center gap-2 min-w-0">
          {project ? (
            <button onClick={goToProject} className="flex items-center gap-1.5 min-w-0 group">
              <FolderOpen className="h-3.5 w-3.5 text-text-muted flex-shrink-0 group-hover:text-text-secondary transition-colors" />
              <span className="text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors truncate">
                {project.name}
              </span>
            </button>
          ) : (
            areaMeta && (
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <AreaDot areaId={areaMeta.id} className="h-1 w-1" />
                <span className="text-sm font-medium text-text-secondary">{areaMeta.label}</span>
              </div>
            )
          )}

          {/* Area as secondary attribute when project is present */}
          {project && areaMeta && (
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="text-border/50 select-none">·</span>
              <AreaDot areaId={areaMeta.id} className="h-1 w-1" />
              <span className="text-xs text-text-muted">{areaMeta.label}</span>
            </div>
          )}
        </div>

        {/* Navigate to project chat */}
        {project && (
          <button
            onClick={goToProject}
            title="Ir al proyecto"
            className="flex-shrink-0 p-1.5 rounded-md text-text-muted hover:text-text-secondary hover:bg-surface-soft transition-colors"
          >
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        )}

      </div>
    </div>
  );
}
