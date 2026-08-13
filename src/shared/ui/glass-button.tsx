"use client";

import { type ComponentProps, type ReactNode, useRef } from "react";

import { cn } from "@/shared/lib/cn";

import { GLASS_GOLD_RGB, GlassSurface, type GlassSurfaceHandle } from "./glass";
import { Track, easeGel, easeSoft, glide, PRESS, RELEASE } from "./glass-motion";

export interface GlassButtonProps extends ComponentProps<"button"> {
  tint?: number;
  variant?: "icon" | "capsule";
  children?: ReactNode;
}

export function GlassButton({
  tint = 0.22,
  variant = "icon",
  children,
  className,
  onPointerDown,
  onPointerUp,
  onPointerLeave,
  onPointerCancel,
  type = "button",
  ...props
}: GlassButtonProps) {
  const surface = useRef<GlassSurfaceHandle | null>(null);
  const scaleEl = useRef<HTMLSpanElement | null>(null);
  const scale = useRef(new Track(1));
  const isIcon = variant === "icon";

  const press = () => {
    scale.current.watch((v) => {
      if (scaleEl.current) scaleEl.current.style.scale = String(v);
    });
    surface.current?.setTintLift(-0.08);
    glide(scale.current, 0.92, PRESS, easeGel);
  };

  const release = () => {
    surface.current?.setTintLift(0);
    glide(scale.current, 1, RELEASE, easeSoft);
  };

  return (
    <button
      type={type}
      className={cn(
        "relative inline-flex select-none outline-none transition-[filter] focus-visible:brightness-110",
        isIcon ? "rounded-full" : "rounded-2xl",
        className,
      )}
      onPointerDown={(event) => {
        press();
        onPointerDown?.(event);
      }}
      onPointerUp={(event) => {
        release();
        onPointerUp?.(event);
      }}
      onPointerLeave={(event) => {
        release();
        onPointerLeave?.(event);
      }}
      onPointerCancel={(event) => {
        release();
        onPointerCancel?.(event);
      }}
      {...props}
    >
      <span ref={scaleEl} className="block origin-center" style={{ scale: "1" }}>
        <GlassSurface
          handleRef={surface}
          tint={tint}
          tintColor={isIcon ? GLASS_GOLD_RGB : undefined}
          radius={isIcon ? 999 : 18}
          className={cn("text-foreground", isIcon ? "size-12" : "h-12 min-h-11 px-6")}
          contentClassName="flex items-center justify-center"
        >
          <span
            className={cn(
              "relative z-10 inline-flex items-center justify-center gap-2 text-sm font-medium",
              isIcon && "text-gold-deep [&_svg]:size-5",
            )}
          >
            {children}
          </span>
        </GlassSurface>
      </span>
    </button>
  );
}
