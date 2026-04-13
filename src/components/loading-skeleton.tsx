export function LoadingSkeleton() {
  return (
    <div className="w-full max-w-2xl rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm p-6 space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-7 w-24 rounded-full bg-gray-200 dark:bg-gray-700" />
        <div className="h-4 w-28 rounded bg-gray-200 dark:bg-gray-700" />
      </div>
      <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700" />
      <div className="space-y-2">
        <div className="h-3 w-full rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-3 w-5/6 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-3 w-4/6 rounded bg-gray-200 dark:bg-gray-700" />
      </div>
    </div>
  )
}
