"use client";

import {
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { createPortal } from "react-dom";

import { cn } from "@/shared/lib/cn";

import { GlassSurface, useHydrated } from "./glass";

interface SheetCtx {
  open: boolean;
  setOpen: (value: boolean) => void;
}

const SheetContext = createContext<SheetCtx>({
  open: false,
  setOpen: () => undefined,
});

export function GlassSheet({
  open: controlled,
  defaultOpen = false,
  onOpenChange,
  children,
}: {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (value: boolean) => void;
  children?: ReactNode;
}) {
  const [internal, setInternal] = useState(defaultOpen);
  const open = controlled !== undefined ? controlled : internal;
  const setOpen = useCallback(
    (value: boolean) => {
      if (controlled === undefined) setInternal(value);
      onOpenChange?.(value);
    },
    [controlled, onOpenChange],
  );
  return <SheetContext.Provider value={{ open, setOpen }}>{children}</SheetContext.Provider>;
}

export function GlassSheetTrigger({ children, className, ...props }: ComponentProps<"button">) {
  const { setOpen } = useContext(SheetContext);
  return (
    <button
      type="button"
      className={cn("outline-none", className)}
      onClick={() => setOpen(true)}
      {...props}
    >
      {children}
    </button>
  );
}

type Side = "start" | "end" | "top" | "bottom";

const hidden: Record<Side, string> = {
  start: "translateX(100%)",
  end: "translateX(-100%)",
  top: "translateY(-100%)",
  bottom: "translateY(100%)",
};

const posClass: Record<Side, string> = {
  start: "start-0 top-0 h-full w-[min(24rem,90vw)]",
  end: "end-0 top-0 h-full w-[min(24rem,90vw)]",
  top: "inset-x-0 top-0 h-[min(24rem,80vh)] w-full",
  bottom: "inset-x-0 bottom-0 h-[min(32rem,88vh)] w-full",
};

interface SheetContentProps extends ComponentProps<"div"> {
  side?: Side;
  tint?: number;
}

export function GlassSheetContent({
  side = "end",
  tint = 0.55,
  className,
  children,
  ...props
}: SheetContentProps) {
  const { open, setOpen } = useContext(SheetContext);
  const mounted = useHydrated();
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, setOpen]);

  if (!mounted || !open) return null;

  const sheetStyle = {
    ["--sheet-from" as string]: hidden[side],
    animation: "glass-sheet-in 0.34s cubic-bezier(0.22,1,0.36,1) both",
  } as CSSProperties;

  return createPortal(
    <div className="fixed inset-0 z-[100]">
      <style>{`@keyframes glass-sheet-in{from{transform:var(--sheet-from)}to{transform:translate(0,0)}}`}</style>
      <div
        className="absolute inset-0 bg-foreground/25 backdrop-blur-[2px] animate-in fade-in-0 duration-200"
        onClick={() => setOpen(false)}
      />
      <GlassSurface
        role="dialog"
        aria-modal="true"
        tint={tint}
        radius={side === "bottom" || side === "top" ? 28 : 24}
        className={cn("absolute text-foreground", posClass[side], className)}
        contentClassName="h-full overflow-auto p-6"
        style={sheetStyle}
        {...props}
      >
        {children}
      </GlassSurface>
    </div>,
    document.body,
  );
}

export function GlassSheetTitle({ className, ...props }: ComponentProps<"h2">) {
  return <h2 className={cn("text-lg font-semibold text-foreground", className)} {...props} />;
}

export function GlassSheetDescription({ className, ...props }: ComponentProps<"p">) {
  return <p className={cn("mt-1.5 text-sm text-muted-foreground", className)} {...props} />;
}

export function GlassSheetClose({ children, className, ...props }: ComponentProps<"button">) {
  const { setOpen } = useContext(SheetContext);
  return (
    <button
      type="button"
      className={cn("outline-none", className)}
      onClick={() => setOpen(false)}
      {...props}
    >
      {children}
    </button>
  );
}
