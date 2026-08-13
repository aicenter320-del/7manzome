"use client";

import { cn } from "@/shared/lib/cn";

import { GlassButton, type GlassButtonProps } from "./glass-button";

/** دیسک شیشه‌ای طلایی برای دکمه‌های آیکونی. */
export function GlassIconButton({ className, ...props }: GlassButtonProps) {
  return <GlassButton variant="icon" className={cn("shrink-0", className)} {...props} />;
}
