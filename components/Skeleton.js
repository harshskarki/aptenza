export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-xl bg-gray-200 dark:bg-gray-800 ${className}`} />
}

export function PageSkeleton() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Navbar placeholder */}
      <div className="border-b border-gray-200 dark:border-white/5 px-4 sm:px-6 py-4 flex items-center justify-between bg-white dark:bg-gray-950">
        <div className="flex items-center gap-2">
          <Skeleton className="w-7 h-7" />
          <Skeleton className="w-20 h-5" />
        </div>
        <Skeleton className="w-32 h-8" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Heading */}
        <Skeleton className="w-64 h-9 mb-3" />
        <Skeleton className="w-96 max-w-full h-4 mb-10" />

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[0, 1, 2].map(i => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-white/5">
              <Skeleton className="w-24 h-4 mb-3" />
              <Skeleton className="w-16 h-8" />
            </div>
          ))}
        </div>

        {/* Content blocks */}
        <div className="space-y-4">
          {[0, 1, 2].map(i => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-white/5">
              <Skeleton className="w-40 h-5 mb-4" />
              <Skeleton className="w-full h-4 mb-2" />
              <Skeleton className="w-3/4 h-4" />
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

export function MessageSkeleton() {
  return (
    <div className="flex justify-start mb-4">
      <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-xs font-bold text-white mr-2 shrink-0">AI</div>
      <div className="bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-white/5 rounded-2xl rounded-tl-none px-4 py-3 w-72 max-w-[80%] space-y-2">
        <Skeleton className="w-full h-3" />
        <Skeleton className="w-5/6 h-3" />
        <Skeleton className="w-2/3 h-3" />
      </div>
    </div>
  )
}