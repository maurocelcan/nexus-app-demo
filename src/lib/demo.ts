import { useDataSourceStore } from "@/stores/data-source-store";
import { useChatStore } from "@/stores/chat-store";
import { useNotificationStore } from "@/stores/notification-store";
import { useActionPlanStore } from "@/stores/action-plan-store";

export function activateFullDemo(): void {
  useDataSourceStore.getState().loadDemo();
  useChatStore.getState().loadDemoData();
  useNotificationStore.getState().loadDemoNotifications();
  useActionPlanStore.getState().loadDemoPlans();
}
