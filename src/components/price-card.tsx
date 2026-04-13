"use client"

import type { PriceData } from "@/types"
import { cx } from "@/lib/utils"

const INDEX_NAMES: Record<string, string> = {
  SPY: "S&P 500",
  QQQ: "NASDAQ-100",
  DIA: "Dow Jones",
}

interface PriceCardProps {
  data: PriceData
}

export function PriceCard({ data }: PriceCardProps) {
  const positive = data.change >= 0

  return (
    <div className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm p-4 space-y-1">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{data.ticker}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{INDEX_NAMES[data.ticker] ?? data.ticker}</p>
      <p className="text-xl font-bold tabular-nums text-gray-900 dark:text-gray-50">
        ${data.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>
      <p className={cx("text-sm font-medium tabular-nums", positive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400")}>
        {positive ? "+" : ""}{data.change.toFixed(2)}{" "}
        <span className="text-xs">({positive ? "+" : ""}{data.changePercent.toFixed(2)}%)</span>
      </p>
    </div>
  )
}

export function PriceCardSkeleton() {
  return (
    <div className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm p-4 space-y-2 animate-pulse">
      <div className="h-3 w-10 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
    </div>
  )
}
