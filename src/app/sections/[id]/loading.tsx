export default function Loading() {
  return (
    <div className="flex h-[calc(100vh-var(--topbar-h)-var(--banner-h))] overflow-hidden bg-paper animate-pulse">
      {/* Outline Skeleton */}
      <div className="w-[260px] shrink-0 border-r border-line bg-paper-2/30 p-4 space-y-3">
        <div className="h-4 w-28 bg-paper-2 rounded" />
        <div className="h-3 w-20 bg-paper-2 rounded" />
        <div className="space-y-2 mt-4">
          <div className="h-10 bg-paper-2 rounded-lg" />
          <div className="h-10 bg-paper-2 rounded-lg" />
          <div className="h-10 bg-paper-2 rounded-lg" />
          <div className="h-10 bg-paper-2 rounded-lg" />
          <div className="h-10 bg-paper-2 rounded-lg" />
        </div>
      </div>

      {/* Canvas Skeleton */}
      <div className="flex-1 p-8 space-y-6">
        <div className="border-b border-line pb-4 flex justify-between">
          <div className="space-y-2">
            <div className="h-6 w-32 bg-paper-2 rounded" />
            <div className="h-8 w-64 bg-paper-2 rounded" />
          </div>
          <div className="h-9 w-32 bg-paper-2 rounded" />
        </div>
        <div className="space-y-4 max-w-[72ch]">
          <div className="h-4 bg-paper-2 rounded w-full" />
          <div className="h-4 bg-paper-2 rounded w-5/6" />
          <div className="h-4 bg-paper-2 rounded w-4/6" />
        </div>
      </div>

      {/* Right Panel Skeleton */}
      <div className="w-[360px] shrink-0 border-l border-line bg-paper-2/30 p-4 space-y-3">
        <div className="h-9 bg-paper-2 rounded" />
        <div className="space-y-2 mt-4">
          <div className="h-16 bg-paper-2 rounded" />
          <div className="h-16 bg-paper-2 rounded" />
          <div className="h-16 bg-paper-2 rounded" />
        </div>
      </div>
    </div>
  );
}
