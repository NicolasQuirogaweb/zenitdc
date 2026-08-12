function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-[color:var(--color-border)] ${className}`} />
}

export function SkeletonLista({ count = 4 }: { count?: number }) {
  return (
    <ul className="mt-4 space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i} className="rounded-lg bg-[color:var(--color-bg-surface)] p-3 shadow-sm">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="mt-2 h-3 w-1/3" />
        </li>
      ))}
    </ul>
  )
}

export function SkeletonDetalleObra() {
  return (
    <div className="min-h-screen bg-[color:var(--color-bg-page)] p-4">
      <div className="mx-auto max-w-lg">
        <Skeleton className="h-6 w-40" />

        <div className="mt-4 space-y-4">
          <div className="rounded-lg bg-[color:var(--color-bg-surface)] p-4 shadow-sm">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-3 h-4 w-40" />
            <Skeleton className="mt-2 h-3 w-32" />
          </div>
          <div className="rounded-lg bg-[color:var(--color-bg-surface)] p-4 shadow-sm">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="mt-3 h-5 w-48" />
            <Skeleton className="mt-2 h-4 w-24" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Skeleton
