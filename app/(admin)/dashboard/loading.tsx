function SkeletonBox({ className }: { className?: string }) {
  return (
    <div
      className={`rounded bg-surface animate-pulse ${className ?? ''}`}
    />
  )
}

export default function DashboardLoading() {
  return (
    <div className="px-6 py-8 max-w-[1400px] mx-auto flex flex-col gap-8">

      {/* Header skeleton */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <SkeletonBox className="h-7 w-32" />
          <SkeletonBox className="h-3.5 w-12" />
        </div>
        <SkeletonBox className="h-10 w-36 rounded-lg" />
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-surface border border-border rounded-xl px-6 py-5 flex flex-col gap-2"
          >
            <SkeletonBox className="h-8 w-10 bg-border" />
            <SkeletonBox className="h-2.5 w-20 bg-border" />
          </div>
        ))}
      </div>

      {/* Gantt skeleton */}
      <div className="flex flex-col gap-3">
        <SkeletonBox className="h-3 w-24" />
        <div className="rounded-xl border border-border bg-surface overflow-hidden">
          {/* Month header */}
          <div className="flex border-b border-border px-2 py-3 gap-1">
            {Array.from({ length: 13 }).map((_, i) => (
              <SkeletonBox key={i} className={`h-3 flex-1 bg-border ${i === 0 ? 'w-[260px] shrink-0 flex-none' : ''}`} />
            ))}
          </div>
          {/* Rows */}
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center border-b border-border px-2 py-4 gap-1">
              <div className="shrink-0 w-[260px] flex flex-col gap-2 pr-4">
                <SkeletonBox className="h-3.5 w-32 bg-border" />
                <SkeletonBox className="h-2.5 w-20 bg-border" />
              </div>
              {Array.from({ length: 12 }).map((_, j) => (
                <div key={j} className="flex-1 h-8 flex items-center px-0.5">
                  {i % 2 === 0 && j >= 2 && j <= 7 && (
                    <SkeletonBox className="w-full h-5 bg-border rounded-sm" />
                  )}
                  {i % 2 === 1 && j >= 4 && j <= 10 && (
                    <SkeletonBox className="w-full h-5 bg-border rounded-sm" />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
