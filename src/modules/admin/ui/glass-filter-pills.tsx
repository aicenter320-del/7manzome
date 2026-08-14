import Link from "next/link";

import { cn } from "@/shared/lib/cn";

export function GlassFilterPills({
  items,
  ariaLabel,
}: {
  items: readonly { href: string; label: string; isActive: boolean }[];
  ariaLabel: string;
}) {
  return (
    <nav className="flex flex-wrap gap-2" aria-label={ariaLabel}>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "rounded-full px-3 py-1.5 text-sm transition-colors",
            item.isActive
              ? "bg-primary text-primary-foreground"
              : "glass text-muted-foreground hover:text-foreground",
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
