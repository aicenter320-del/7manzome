import {
  CakeIcon,
  CalendarHeartIcon,
  Flower2Icon,
  MoonStarIcon,
  SmileIcon,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/shared/lib/cn";

import { occasionIconKey, type OccasionIconKey } from "../domain/occasion-icon";

const ICONS: Record<OccasionIconKey, LucideIcon> = {
  cake: CakeIcon,
  smile: SmileIcon,
  flower: Flower2Icon,
  "moon-star": MoonStarIcon,
  "calendar-heart": CalendarHeartIcon,
};

const SIZE = {
  sm: { wrap: "size-7", icon: "size-3.5" },
  md: { wrap: "size-11", icon: "size-5" },
  lg: { wrap: "size-14", icon: "size-7" },
} as const;

export function OccasionIcon({
  slug,
  emoji,
  size = "md",
  variant = "disc",
  className,
}: {
  slug: string;
  emoji?: string | null;
  size?: keyof typeof SIZE;
  variant?: "disc" | "plain" | "watermark";
  className?: string;
}) {
  const Icon = ICONS[occasionIconKey(slug, emoji)];
  const s = SIZE[size];

  if (variant === "watermark") {
    return (
      <span
        className={cn(
          "pointer-events-none absolute end-0 bottom-0 z-0 text-gold opacity-15",
          "translate-y-1/4 ltr:translate-x-1/4 rtl:-translate-x-1/4",
          className,
        )}
        aria-hidden
      >
        <Icon className="size-28 sm:size-32" strokeWidth={1.15} />
      </span>
    );
  }

  if (variant === "plain") {
    return <Icon className={cn("shrink-0 text-gold-deep", s.icon, className)} strokeWidth={1.75} aria-hidden />;
  }

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-gold-soft text-gold-deep shadow-glow",
        s.wrap,
        className,
      )}
      aria-hidden
    >
      <Icon className={s.icon} strokeWidth={1.75} />
    </span>
  );
}

export function OccasionLabel({
  slug,
  title,
  emoji,
  size = "sm",
  variant = "disc",
  className,
}: {
  slug: string;
  title: string;
  emoji?: string | null;
  size?: keyof typeof SIZE;
  variant?: "disc" | "plain";
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <OccasionIcon slug={slug} emoji={emoji} size={size} variant={variant} />
      <span>{title}</span>
    </span>
  );
}
