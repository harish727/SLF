export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-white/[0.06] rounded-xl ${className}`} />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-5 pt-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-3 w-56" />
        </div>
        <Skeleton className="w-11 h-11 rounded-xl" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-36 rounded-2xl" />)}
      </div>
      <Skeleton className="h-24 rounded-2xl" />
    </div>
  );
}

export function TrainSkeleton() {
  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 pb-32 space-y-5">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-3 w-48" />
        </div>
        <div className="flex gap-1.5">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="w-2 h-2 rounded-full" />)}
        </div>
      </div>
      <Skeleton className="h-32 rounded-2xl" />
      {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}
    </div>
  );
}

export function ProgressSkeleton() {
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-5 pt-6">
      <Skeleton className="h-8 w-32" />
      <div className="flex gap-2">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-9 w-20 rounded-xl" />)}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
      </div>
      <Skeleton className="h-56 rounded-2xl" />
      <Skeleton className="h-40 rounded-2xl" />
    </div>
  );
}
