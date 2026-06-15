function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={`ui-card animate-pulse bg-white/80 p-6 ${className}`}
      aria-hidden="true"
    >
      <div className="h-12 w-12 rounded-2xl bg-violet-100" />
      <div className="mt-5 h-3 w-24 rounded-full bg-stone-200" />
      <div className="mt-3 h-7 w-32 rounded-full bg-stone-200" />
      <div className="mt-4 h-3 w-20 rounded-full bg-stone-100" />
    </div>
  );
}

export default function Loading() {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="space-y-3">
          <div className="h-4 w-44 animate-pulse rounded-full bg-stone-200" />
          <div className="h-10 w-56 animate-pulse rounded-full bg-stone-200" />
          <div className="h-5 w-80 max-w-full animate-pulse rounded-full bg-stone-100" />
        </div>
        <div className="h-12 w-48 animate-pulse rounded-xl bg-white shadow-sm" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SkeletonCard className="min-h-[320px]" />
        <SkeletonCard className="min-h-[320px]" />
      </div>
    </div>
  );
}
