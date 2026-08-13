import { cn } from "@/shared/lib/cn";

/** هالهٔ طلایی تزئینی پشت هیرو. بدون تعامل و بدون نقش معنایی. */
export function GoldGlow({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "gold-glow pointer-events-none absolute inset-x-0 top-0 -z-10 h-[min(42rem,90vh)]",
        className,
      )}
    />
  );
}
