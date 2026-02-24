export default function FeedSkeleton() {
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-white dark:bg-background">
      {/* Category Navigation Skeleton */}
      <div className="sticky top-16 z-30 w-full bg-white/90 dark:bg-background/90 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between py-4 gap-4">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth w-full">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-8 w-20 shrink-0 bg-slate-100 dark:bg-secondary animate-pulse rounded-full border border-slate-200 dark:border-slate-800" />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 py-8 md:py-12 space-y-12">
        {/* Featured Content Carousel Skeleton */}
        <div className="relative rounded-[2.5rem] bg-slate-100 dark:bg-zinc-900 animate-pulse aspect-[21/9] md:aspect-[3/1] border border-slate-200 dark:border-slate-800" />

        {/* Content Section Skeleton */}
        <div className="space-y-8">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="space-y-2">
              <div className="h-8 w-64 bg-slate-200 dark:bg-zinc-800 animate-pulse rounded-lg" />
              <div className="h-4 w-48 bg-slate-100 dark:bg-zinc-900 animate-pulse rounded" />
            </div>
            <div className="hidden md:flex items-center gap-2 bg-slate-100 dark:bg-zinc-900 p-1 rounded-full">
                <div className="h-8 w-24 bg-white dark:bg-zinc-800 rounded-full animate-pulse" />
                <div className="h-8 w-24 bg-transparent rounded-full border border-slate-200 dark:border-slate-800 animate-pulse" />
            </div>
          </div>

          <div className="max-w-4xl mx-auto flex flex-col w-full">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="py-12 first:pt-0 border-b border-slate-100 dark:border-slate-800 last:border-0 w-full">
                <div className="flex flex-col-reverse md:flex-row gap-8 md:items-start justify-between">
                  {/* Left content skeleton */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-zinc-900 animate-pulse" />
                      <div className="h-4 w-48 bg-slate-100 dark:bg-zinc-900 animate-pulse rounded" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-8 w-3/4 bg-slate-200 dark:bg-zinc-800 animate-pulse rounded-lg" />
                      <div className="h-10 w-full bg-slate-100 dark:bg-zinc-900 animate-pulse rounded-lg" />
                    </div>
                    <div className="flex items-center gap-6 pt-6">
                      <div className="h-4 w-12 bg-slate-100 dark:bg-zinc-900 animate-pulse rounded" />
                      <div className="h-4 w-12 bg-slate-100 dark:bg-zinc-900 animate-pulse rounded" />
                      <div className="h-4 w-12 bg-slate-100 dark:bg-zinc-900 animate-pulse rounded" />
                    </div>
                  </div>
                  {/* Right image skeleton */}
                  <div className="w-full md:w-40 lg:w-48 aspect-[4/3] bg-slate-100 dark:bg-zinc-900 animate-pulse rounded-xl border border-slate-200 dark:border-slate-800 flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
