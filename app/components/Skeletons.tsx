"use client";

export function TimerCardSkeleton() {
  return (
    <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-6 animate-pulse">
      {/* Title */}
      <div className="h-6 bg-slate-700 rounded w-3/4 mb-3"></div>

      {/* Description */}
      <div className="h-4 bg-slate-700 rounded w-full mb-2"></div>
      <div className="h-4 bg-slate-700 rounded w-5/6 mb-4"></div>

      {/* Thumbnail placeholder */}
      <div className="w-full h-32 bg-slate-700 rounded-lg mb-4"></div>

      {/* Stats */}
      <div className="flex gap-4 mb-4">
        <div className="h-4 bg-slate-700 rounded w-20"></div>
        <div className="h-4 bg-slate-700 rounded w-20"></div>
      </div>

      {/* Creator info */}
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-slate-700 rounded-full"></div>
        <div className="h-3 bg-slate-700 rounded w-32"></div>
      </div>
    </div>
  );
}

export function GallerySkeletonGrid() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <TimerCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function DashboardTimerSkeleton() {
  return (
    <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="h-5 bg-slate-700 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
          <div className="flex gap-4">
            <div className="h-3 bg-slate-700 rounded w-24"></div>
            <div className="h-3 bg-slate-700 rounded w-24"></div>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="h-9 bg-slate-700 rounded w-20"></div>
          <div className="h-9 bg-slate-700 rounded w-20"></div>
        </div>
      </div>
    </div>
  );
}

export function DashboardSkeletonList() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 10 }).map((_, i) => (
        <DashboardTimerSkeleton key={i} />
      ))}
    </div>
  );
}

export function PageLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Title skeleton */}
        <div className="mb-12 animate-pulse">
          <div className="h-10 bg-slate-700 rounded w-1/3 mb-4"></div>
          <div className="h-5 bg-slate-700 rounded w-1/2"></div>
        </div>

        {/* Content skeleton */}
        <GallerySkeletonGrid />
      </div>
    </div>
  );
}
