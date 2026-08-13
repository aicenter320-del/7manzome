import type { ReactNode } from "react";

import { cn } from "@/shared/lib/cn";
import { Card, CardContent } from "@/shared/ui/card";

export function StatCard({
  label,
  value,
  hint,
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  className?: string;
}) {
  return (
    <Card className={cn(className)}>
      <CardContent className="p-5">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
        {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}
