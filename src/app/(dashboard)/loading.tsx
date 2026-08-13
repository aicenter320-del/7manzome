import { Skeleton } from "@/shared/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="grid gap-6">
      <Skeleton className="h-10 w-40" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}
