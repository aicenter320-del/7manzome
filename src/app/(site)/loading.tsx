import { Skeleton } from "@/shared/ui/skeleton";

export default function SiteLoading() {
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-10 sm:px-6">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-24 w-full" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Skeleton className="aspect-square" />
        <Skeleton className="aspect-square" />
        <Skeleton className="aspect-square" />
        <Skeleton className="aspect-square" />
      </div>
    </div>
  );
}
