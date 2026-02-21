export default function FeedLoading() {
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50/50 dark:bg-slate-950/50">
      <div className="sticky top-16 z-30 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-8 h-12">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-4 w-16 bg-slate-200 dark:bg-slate-800 animate-pulse rounded" />
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full p-4 md:p-8 space-y-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-4">
            <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-xl" />
            <div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 animate-pulse rounded" />
          </div>
          <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-xl" />
        </div>

        <div className="relative rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse aspect-[21/9] md:aspect-[3/1]" />

        <div className="space-y-8">
            <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 animate-pulse rounded" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                <div key={item} className="h-64 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-2xl" />
            ))}
            </div>
        </div>
      </div>
    </div>
  )
}
