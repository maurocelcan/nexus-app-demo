"use client";
import { ModuleEmptyState } from "@/components/workspace/module-chrome";
import type { EnterpriseModuleId } from "@/data/module-dataset-state";

export function ModuleDatasetEmptyState({ moduleId }: { moduleId: EnterpriseModuleId }) {
  return <ModuleEmptyState moduleId={moduleId} />;
}
