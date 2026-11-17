export default function Loading() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-pulse">
      <div className="border-b border-line pb-4">
        <div className="h-9 w-64 rounded-md bg-paper-2" />
        <div className="h-4 w-96 rounded-md bg-paper-2 mt-2" />
      </div>

      {/* Study Card Skeleton */}
      <div className="rounded-xl border border-line bg-card p-6 h-64" />

      {/* Tiles Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-line bg-card p-4 h-32" />
        <div className="rounded-xl border border-line bg-card p-4 h-32" />
        <div className="rounded-xl border border-line bg-card p-4 h-32" />
        <div className="rounded-xl border border-line bg-card p-4 h-32" />
      </div>

      {/* Section Board Skeleton */}
      <div className="rounded-xl border border-line bg-card h-80" />
    </div>
  );
}
