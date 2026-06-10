"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { MessageBlocks } from "./message-blocks";
import type { Message } from "@/types/chat";
import { useAuthStore } from "@/stores/auth-store";

function StreamingText({ text, speed = 38 }: { text: string; speed?: number }) {
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    if (revealed >= text.length) return;
    const timer = setTimeout(() => {
      setRevealed((prev) => Math.min(prev + 5, text.length));
    }, speed);
    return () => clearTimeout(timer);
  }, [revealed, text.length, speed]);

  const isDone = revealed >= text.length;

  return (
    <>
      {text.slice(0, revealed)}
      {!isDone && (
        <span className="inline-block w-[2px] h-[0.85em] bg-text-primary/60 animate-pulse ml-px align-text-bottom" />
      )}
    </>
  );
}

interface MessageItemProps {
  message: Message;
  isStreaming?: boolean;
  onFollowUp?: (q: string) => void;
  onAction?: (action: string, blocks?: import("@/types/chat").MessageBlock[]) => void;
  onCreateProjectPlan?: (blocks: import("@/types/chat").MessageBlock[]) => void;
  onCompleteBrief?: (blocks: import("@/types/chat").MessageBlock[]) => void;
  onNavigate?: (canonicalId: string) => void;
  projectName?: string;
}

export function MessageItem({ message, isStreaming = false, onFollowUp, onAction, onCreateProjectPlan, onCompleteBrief, onNavigate, projectName }: MessageItemProps) {
  const { user } = useAuthStore();
  const isUser = message.role === "user";
  const senderName = message.userName ?? (isUser ? user?.name : undefined);
  const isOtherUser = isUser && message.userName && message.userName !== user?.name;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn("flex gap-3 py-3", isUser && "flex-row-reverse")}
    >
      <div className="flex-shrink-0 mt-1">
        {isUser ? (
          <Avatar name={senderName} size="sm" />
        ) : (
          <div className="h-7 w-7 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center">
            <span className="text-xs font-bold text-primary">N</span>
          </div>
        )}
      </div>
      <div className={cn("flex-1 min-w-0", isUser && "flex flex-col items-end")}>
        {isUser ? (
          <div className="flex flex-col items-end gap-1.5 max-w-[80%]">
            {isOtherUser && (
              <span className="text-[10px] text-text-muted font-medium">{senderName}</span>
            )}
            {message.attachment && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-elevated border border-border text-xs text-text-secondary">
                <FileText className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                <span className="truncate max-w-[160px]">{message.attachment.name}</span>
                <span className="text-text-muted flex-shrink-0">{message.attachment.size}</span>
              </div>
            )}
            {message.content && (
              <div className="rounded-xl bg-primary/15 border border-primary/25 px-4 py-2.5 text-sm text-text-primary">
                {message.content}
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-[90%]">
            {message.content && (
              <p className="text-sm text-text-primary leading-relaxed mb-2 whitespace-pre-wrap">
                {isStreaming ? <StreamingText key={message.content} text={message.content} /> : message.content}
              </p>
            )}
            {message.blocks && message.blocks.length > 0 && (
              <MessageBlocks blocks={message.blocks} onFollowUp={onFollowUp} onAction={onAction} onCreateProjectPlan={onCreateProjectPlan} onCompleteBrief={onCompleteBrief} onNavigate={onNavigate} projectName={projectName} />
            )}
          </div>
        )}
        <p className={cn("text-[10px] text-text-muted mt-1.5", isUser && "text-right")}>
          {new Date(message.timestamp).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </motion.div>
  );
}
