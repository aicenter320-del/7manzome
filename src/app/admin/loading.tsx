import { Skeleton } from "@/shared/ui/skeleton";

export default function AdminLoading() {
  return (
    <div className="grid gap-6">
      <Skeleton className="h-10 w-48" />
      <div className="grid gap-4 sm:grid-cols-3">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
    </div>
  );
}
