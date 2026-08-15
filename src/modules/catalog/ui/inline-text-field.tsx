"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { cn } from "@/shared/lib/cn";

/** متن قابل‌کلیک برای ویرایش درون‌ویترینی. */
export function InlineTextField({
  value,
  placeholder,
  multiline = false,
  className,
  inputClassName,
  onSave,
}: {
  value: string;
  placeholder?: string;
  multiline?: boolean;
  className?: string;
  inputClassName?: string;
  onSave: (next: string) => Promise<void> | void;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const saving = useRef(false);

  const start = () => {
    setDraft(value);
    setEditing(true);
  };

  const commit = async () => {
    if (saving.current) return;
    const next = draft.trim();
    if (next === value.trim()) {
      setEditing(false);
      return;
    }
    saving.current = true;
    try {
      await onSave(next);
      setEditing(false);
      router.refresh();
    } finally {
      saving.current = false;
    }
  };

  if (!editing) {
    return (
      <button
        type="button"
        onClick={start}
        className={cn(
          "rounded-md text-start outline-none ring-offset-background hover:ring-2 hover:ring-gold/40 focus-visible:ring-2 focus-visible:ring-gold",
          !value && "text-muted-foreground",
          className,
        )}
      >
        {value || placeholder || "برای نوشتن کلیک کنید"}
      </button>
    );
  }

  if (multiline) {
    return (
      <textarea
        autoFocus
        rows={6}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => void commit()}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            setEditing(false);
            setDraft(value);
          }
        }}
        className={cn(
          "w-full rounded-lg border border-gold bg-card px-3 py-2 text-start outline-none",
          inputClassName,
        )}
      />
    );
  }

  return (
    <input
      autoFocus
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={() => void commit()}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          void commit();
        }
        if (event.key === "Escape") {
          event.preventDefault();
          setEditing(false);
          setDraft(value);
        }
      }}
      className={cn(
        "w-full rounded-lg border border-gold bg-card px-3 py-2 text-start outline-none",
        inputClassName,
      )}
    />
  );
}
