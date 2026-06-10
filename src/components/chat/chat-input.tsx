"use client";
import { useRef, useState, forwardRef, useImperativeHandle } from "react";
import { ArrowUp, Paperclip, X, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ChatAttachment {
  name: string;
  type: string;
  size: string;
}

export interface ChatInputHandle {
  focus: () => void;
}

interface ChatInputProps {
  onSend: (message: string, attachment?: ChatAttachment) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput = forwardRef<ChatInputHandle, ChatInputProps>(function ChatInput(
  { onSend, disabled, placeholder = "Preguntá en lenguaje natural…" },
  ref
) {
  const [value, setValue] = useState("");
  const [attachment, setAttachment] = useState<ChatAttachment | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useImperativeHandle(ref, () => ({
    focus: () => textareaRef.current?.focus(),
  }));
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleSend() {
    const trimmed = value.trim();
    if ((!trimmed && !attachment) || disabled) return;
    onSend(trimmed || (attachment ? `[Archivo adjunto: ${attachment.name}]` : ""), attachment ?? undefined);
    setValue("");
    setAttachment(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setValue(e.target.value);
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const kb = file.size / 1024;
    const size = kb < 1024 ? `${kb.toFixed(0)} KB` : `${(kb / 1024).toFixed(1)} MB`;
    setAttachment({ name: file.name, type: file.type || file.name.split(".").pop() || "file", size });
    e.target.value = "";
  }

  const canSend = (value.trim().length > 0 || attachment !== null) && !disabled;

  return (
    <div
      data-chat-composer
      className={cn(
        "border rounded-xl bg-surface-elevated transition-all duration-150 shadow-[0_2px_16px_rgba(0,0,0,0.25)]",
        "border-border",
        "focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/35 focus-within:shadow-[0_0_0_3px_rgba(139,92,246,0.10),0_4px_20px_rgba(0,0,0,0.3)]"
      )}
    >
      {/* Attachment pill */}
      {attachment && (
        <div className="flex items-center gap-2 px-4 pt-3">
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-primary/10 border border-primary/25 max-w-xs">
            <FileText className="h-3.5 w-3.5 text-primary flex-shrink-0" />
            <span className="text-xs text-text-secondary truncate">{attachment.name}</span>
            <span className="text-[10px] text-text-muted flex-shrink-0">{attachment.size}</span>
            <button
              type="button"
              onClick={() => setAttachment(null)}
              className="ml-1 text-text-muted hover:text-danger transition-colors flex-shrink-0"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={placeholder}
        rows={1}
        className="w-full bg-transparent text-text-primary placeholder:text-text-muted resize-none px-4 py-3.5 text-sm leading-relaxed disabled:opacity-50 outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
        style={{ maxHeight: 180 }}
      />

      <div className="flex items-center justify-between px-3 pb-2.5">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls,.pdf,.txt"
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "text-text-muted hover:text-text-secondary transition-colors p-1 rounded-md hover:bg-surface-soft",
            attachment && "text-primary hover:text-primary"
          )}
          title="Adjuntar archivo"
        >
          <Paperclip className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={handleSend}
          disabled={!canSend}
          className={cn(
            "h-8 w-8 rounded-lg flex items-center justify-center transition-all",
            canSend
              ? "bg-primary hover:bg-primary/90 text-white shadow-[0_0_12px_rgba(139,92,246,0.35)]"
              : "bg-surface-soft text-text-muted cursor-not-allowed"
          )}
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
});
