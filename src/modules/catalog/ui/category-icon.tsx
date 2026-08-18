import Link from "next/link";
import {
  CircleDotIcon,
  CoinsIcon,
  FootprintsIcon,
  GemIcon,
  Link2Icon,
  MedalIcon,
  SparklesIcon,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/shared/lib/cn";

import { categoryIconKey, type CategoryIconKey } from "../domain/category-icon";
import type { Category } from "../domain/types";

const ICONS: Record<CategoryIconKey, LucideIcon> = {
  link: Link2Icon,
  medal: MedalIcon,
  gem: GemIcon,
  coins: CoinsIcon,
  ring: CircleDotIcon,
  footprints: FootprintsIcon,
  sparkles: SparklesIcon,
};

/** آیکون Lucide دسته؛ حلقه را `CategoryCircle` می‌سازد. */
export function CategoryIcon({ slug, className }: { slug: string; className?: string }) {
  const Icon = ICONS[categoryIconKey(slug)];
  return <Icon className={cn("size-7", className)} strokeWidth={1.6} aria-hidden />;
}

/** دایرهٔ دسته با برچسب؛ لینک به فیلتر کاتالوگ. */
export function CategoryCircle({
  category,
  href,
  active = false,
  onNavigate,
}: {
  category: Pick<Category, "slug" | "title">;
  href?: string;
  active?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href ?? `/products?category=${category.slug}`}
      aria-current={active ? "page" : undefined}
      className="flex flex-col items-center gap-2 text-center"
      onClick={onNavigate}
    >
      <span
        className={cn(
          "flex size-16 items-center justify-center rounded-full text-gold-deep",
          active ? "border border-gold bg-gold-soft shadow-glow" : "bg-gold-soft",
        )}
      >
        <CategoryIcon slug={category.slug} />
      </span>
      <span className="text-[0.7rem] font-bold leading-tight text-balance">{category.title}</span>
    </Link>
  );
}
