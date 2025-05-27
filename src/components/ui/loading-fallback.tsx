import { cn } from "@/lib/utils";

export function SkeletonCard() {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
      <div className="space-y-3">
        <div className="h-4 w-3/4 animate-pulse bg-muted rounded"></div>
        <div className="h-4 w-1/2 animate-pulse bg-muted rounded"></div>
      </div>
    </div>
  );
}

export function LoadingFallback() {
  return (
    <div className="w-full h-full min-h-[200px] p-4 space-y-4">
      <div className={cn(
        "grid gap-4",
        "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
      )}>
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}
