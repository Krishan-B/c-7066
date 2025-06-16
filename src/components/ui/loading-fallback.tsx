import { cn } from '@/lib/utils';

export function SkeletonCard() {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="h-5 w-32 animate-pulse bg-muted rounded"></div>
            <div className="h-4 w-24 animate-pulse bg-muted rounded"></div>
          </div>
          <div className="h-8 w-8 animate-pulse bg-muted rounded-full"></div>
        </div>
        <div className="space-y-2">
          <div className="h-3 w-full animate-pulse bg-muted rounded"></div>
          <div className="h-3 w-4/5 animate-pulse bg-muted rounded"></div>
          <div className="h-3 w-3/4 animate-pulse bg-muted rounded"></div>
        </div>
        <div className="flex gap-2 pt-2">
          <div className="h-8 w-20 animate-pulse bg-muted rounded"></div>
          <div className="h-8 w-16 animate-pulse bg-muted rounded"></div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonTable() {
  return (
    <div className="rounded-lg border bg-card">
      <div className="p-4">
        <div className="h-6 w-40 animate-pulse bg-muted rounded mb-4"></div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 animate-pulse bg-muted rounded-full"></div>
                <div className="space-y-1">
                  <div className="h-4 w-20 animate-pulse bg-muted rounded"></div>
                  <div className="h-3 w-16 animate-pulse bg-muted rounded"></div>
                </div>
              </div>
              <div className="text-right space-y-1">
                <div className="h-4 w-16 animate-pulse bg-muted rounded ml-auto"></div>
                <div className="h-3 w-12 animate-pulse bg-muted rounded ml-auto"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function LoadingFallback() {
  return (
    <div className="w-full min-h-[400px] p-6 space-y-6">
      {/* Header skeleton */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="h-8 w-48 animate-pulse bg-muted rounded"></div>
          <div className="h-4 w-72 animate-pulse bg-muted rounded"></div>
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-24 animate-pulse bg-muted rounded"></div>
          <div className="h-9 w-20 animate-pulse bg-muted rounded"></div>
        </div>
      </div>

      {/* Content grid */}
      <div className={cn('grid gap-6', 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3')}>
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>

      {/* Table skeleton */}
      <SkeletonTable />
    </div>
  );
}
