"use client"

import { useState, useCallback } from "react"
import { PriceCard, PriceCardSkeleton } from "@/components/price-card"
import { VixGauge, VixGaugeSkeleton } from "@/components/vix-gauge"
import { BiasResultCard, BiasResultCardSkeleton } from "@/components/bias-result-card"
import { useAnalyze } from "@/hooks/use-analyze"
import type { PriceData, NewsArticle } from "@/types"

const TICKERS = ["SPY", "QQQ", "DIA"] as const

type Status = "idle" | "loading" | "done"

export default function Home() {
  const [priceStatus, setPriceStatus] = useState<Status>("idle")
  const [prices, setPrices] = useState<Record<string, PriceData | null>>({})

  const [newsStatus, setNewsStatus] = useState<Status>("idle")
  const [news, setNews] = useState<Record<string, NewsArticle[]>>({})

  const spyAnalysis = useAnalyze("SPY")
  const qqqAnalysis = useAnalyze("QQQ")
  const diaAnalysis = useAnalyze("DIA")
  const marketAnalysis = useAnalyze("MARKET")

  const analyses = { SPY: spyAnalysis, QQQ: qqqAnalysis, DIA: diaAnalysis }

  const refresh = useCallback(async () => {
    setPriceStatus("loading")
    setNewsStatus("loading")

    // Prices + news in parallel
    const [priceRes, ...newsResults] = await Promise.all([
      fetch("/api/price").then((r) => r.json()),
      ...TICKERS.map((t) =>
        fetch(`/api/news?ticker=${t}`)
          .then((r) => r.json())
          .catch(() => []),
      ),
    ])

    setPrices(priceRes)
    setPriceStatus("done")

    const newsMap: Record<string, NewsArticle[]> = {}
    TICKERS.forEach((t, i) => {
      newsMap[t] = Array.isArray(newsResults[i]) ? newsResults[i] : []
    })
    setNews(newsMap)
    setNewsStatus("done")

    // Trigger analysis for all cards in parallel
    spyAnalysis.trigger()
    qqqAnalysis.trigger()
    diaAnalysis.trigger()
    marketAnalysis.trigger()
  }, [spyAnalysis, qqqAnalysis, diaAnalysis, marketAnalysis])

  const allNews = Object.values(news).flat()
  const anyAnalyzing =
    spyAnalysis.streaming || qqqAnalysis.streaming || diaAnalysis.streaming || marketAnalysis.streaming

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center px-4 py-16 gap-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
          Pulse Check
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Real-time sentiment for the three major indices, grounded in live news.
        </p>
      </div>

      {/* Refresh */}
      <button
        onClick={refresh}
        disabled={priceStatus === "loading" || anyAnalyzing}
        className="rounded-lg bg-gray-900 dark:bg-gray-50 text-white dark:text-gray-900 text-sm font-medium px-5 py-2.5 hover:bg-gray-700 dark:hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {priceStatus === "loading"
          ? "Fetching data…"
          : anyAnalyzing
            ? "Analyzing…"
            : "Refresh"}
      </button>

      {/* Price strip */}
      <div className="w-full max-w-2xl flex gap-4">
        {TICKERS.map((t) =>
          priceStatus === "done" && prices[t]
            ? <PriceCard key={t} data={prices[t]!} />
            : <PriceCardSkeleton key={t} />
        )}
      </div>

      {/* VXX volatility gauge */}
      {priceStatus === "done"
        ? <VixGauge data={prices["VXX"] ?? null} />
        : <VixGaugeSkeleton />
      }

      {/* General market card */}
      {newsStatus === "done"
        ? (
          <BiasResultCard
            ticker="MARKET"
            label={marketAnalysis.label}
            confidence={marketAnalysis.confidence}
            summary={marketAnalysis.summary}
            sources={[]}
            news={allNews}
            streaming={marketAnalysis.streaming}
          />
        )
        : <BiasResultCardSkeleton />
      }

      {/* Individual sentiment cards */}
      {TICKERS.map((t) =>
        newsStatus === "done"
          ? (
            <BiasResultCard
              key={t}
              ticker={t}
              label={analyses[t].label}
              confidence={analyses[t].confidence}
              summary={analyses[t].summary}
              sources={[]}
              news={news[t] ?? []}
              streaming={analyses[t].streaming}
            />
          )
          : <BiasResultCardSkeleton key={t} />
      )}
    </main>
  )
}
