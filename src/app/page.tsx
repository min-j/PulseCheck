"use client"

import { useState, useCallback } from "react"
import { PriceCard, PriceCardSkeleton } from "@/components/price-card"
import type { PriceData } from "@/types"

const TICKERS = ["SPY", "QQQ", "DIA"] as const

type PriceMap = Record<string, PriceData | null>
type PriceStatus = "idle" | "loading" | "done"

export default function Home() {
  const [priceStatus, setPriceStatus] = useState<PriceStatus>("idle")
  const [prices, setPrices] = useState<PriceMap>({})

  const refresh = useCallback(async () => {
    setPriceStatus("loading")

    const res = await fetch("/api/price")
    const data: PriceMap = await res.json()
    setPrices(data)
    setPriceStatus("done")
  }, [])

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center px-4 py-16 gap-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
          Market Bias Indicator
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Real-time sentiment for the three major indices, grounded in live news.
        </p>
      </div>

      {/* Refresh */}
      <button
        onClick={refresh}
        disabled={priceStatus === "loading"}
        className="rounded-lg bg-gray-900 dark:bg-gray-50 text-white dark:text-gray-900 text-sm font-medium px-5 py-2.5 hover:bg-gray-700 dark:hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {priceStatus === "loading" ? "Refreshing…" : "Refresh"}
      </button>

      {/* Price strip */}
      <div className="w-full max-w-2xl flex gap-4">
        {priceStatus === "idle" && TICKERS.map((t) => (
          <PriceCardSkeleton key={t} />
        ))}
        {priceStatus === "loading" && TICKERS.map((t) => (
          <PriceCardSkeleton key={t} />
        ))}
        {priceStatus === "done" && TICKERS.map((t) =>
          prices[t] ? <PriceCard key={t} data={prices[t]!} /> : <PriceCardSkeleton key={t} />
        )}
      </div>

      {/* Sentiment cards — coming next */}
    </main>
  )
}
