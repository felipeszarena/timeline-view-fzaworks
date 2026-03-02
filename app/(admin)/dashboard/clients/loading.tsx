function SkeletonBox({ className }: { className?: string }) {
  return <div className={`rounded bg-surface animate-pulse ${className ?? ''}`} />
}

export default function ClientsLoading() {
  return (
    <div className="px-6 py-8 max-w-[1400px] mx-auto flex flex-col gap-8">

      {/* Header skeleton */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <SkeletonBox className="h-7 w-28" />
          <SkeletonBox className="h-3.5 w-20" />
        </div>
        <SkeletonBox className="h-10 w-36 rounded-lg" />
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-surface border border-border rounded-xl px-6 py-5 flex flex-col gap-2">
            <SkeletonBox className="h-8 w-10 bg-border" />
            <SkeletonBox className="h-2.5 w-20 bg-border" />
          </div>
        ))}
      </div>

      {/* Search skeleton */}
      <SkeletonBox className="h-10 w-80 rounded-lg" />

      {/* Cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <SkeletonBox className="w-11 h-11 rounded-full bg-border shrink-0" />
              <div className="flex-1 flex flex-col gap-2">
                <SkeletonBox className="h-4 w-3/4 bg-border" />
                <SkeletonBox className="h-3 w-1/2 bg-border" />
              </div>
            </div>
            <SkeletonBox className="h-3 w-full bg-border" />
          </div>
        ))}
      </div>

    </div>
  )
}
