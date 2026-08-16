import { Skeleton } from "@/shared/ui/skeleton";

export default function SiteLoading() {
  return (
    <div className="grid gap-6 px-4 py-6">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-24 w-full" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="aspect-square" />
        <Skeleton className="aspect-square" />
        <Skeleton className="aspect-square" />
        <Skeleton className="aspect-square" />
      </div>
    </div>
  );
}
