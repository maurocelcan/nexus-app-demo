import { DEMO_PROJECT_MESSAGES } from "@/data/mock-projects";
import type { Message } from "@/types/chat";
import { generateId } from "@/lib/utils";

function normalizeQuery(q: string): string {
  return q
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'");
}

type DemoIndex = Map<string, Message>;
let _index: DemoIndex | null = null;

function buildIndex(): DemoIndex {
  const index: DemoIndex = new Map();
  for (const messages of Object.values(DEMO_PROJECT_MESSAGES)) {
    for (let i = 0; i < messages.length - 1; i++) {
      const msg = messages[i];
      const next = messages[i + 1];
      if (msg.role === "user" && next.role === "assistant") {
        const key = normalizeQuery(msg.content);
        if (key && !index.has(key)) {
          index.set(key, next);
        }
      }
    }
  }
  return index;
}

function getIndex(): DemoIndex {
  if (!_index) _index = buildIndex();
  return _index;
}

/**
 * Tries to match a user query against the demo conversation corpus.
 * Returns a cloned assistant Message with fresh id/timestamp, or null if no match.
 */
export function resolveDemoResponse(query: string): Message | null {
  const index = getIndex();
  const key = normalizeQuery(query);
  const match = index.get(key);
  if (!match) return null;
  return {
    ...match,
    id: `msg-${generateId()}`,
    timestamp: new Date().toISOString(),
  };
}
