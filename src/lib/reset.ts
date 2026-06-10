import { useDataSourceStore } from "@/stores/data-source-store";
import { useChatStore } from "@/stores/chat-store";
import { useNotificationStore } from "@/stores/notification-store";

/**
 * Resets all workspace stores to their empty initial state.
 * Call on login, register, or when the user explicitly resets the demo.
 */
export function resetWorkspace(): void {
  useDataSourceStore.getState().reset();
  useChatStore.getState().resetAll();
  useNotificationStore.getState().resetAll();
}
