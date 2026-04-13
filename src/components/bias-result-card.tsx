"use client"

import { useState } from "react"
import type { BiasLabel, RetrievedChunk, NewsArticle } from "@/types"
import { cx } from "@/lib/utils"

const INDEX_NAMES: Record<string, string> = {
  SPY: "S&P 500",
  QQQ: "NASDAQ-100",
  DIA: "Dow Jones",
  MARKET: "General Market",
}

interface BiasResultCardProps {
  ticker: string
  label: BiasLabel | null
  confidence: number | null
  summary: string
  sources: RetrievedChunk[]
  news?: NewsArticle[]
  streaming?: boolean
}

const LABEL_STYLES: Record<BiasLabel, string> = {
  Bullish: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  Bearish: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  Neutral: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
}

const CONFIDENCE_BAR_COLOR: Record<BiasLabel, string> = {
  Bullish: "bg-emerald-500",
  Bearish: "bg-red-500",
  Neutral: "bg-gray-400",
}

export function BiasResultCard({
  ticker,
  label,
  confidence,
  summary,
  sources,
  news = [],
  streaming,
}: BiasResultCardProps) {
  const [newsExpanded, setNewsExpanded] = useState(false)

  return (
    <div className="w-full max-w-2xl rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm p-6 space-y-4">
      {/* Ticker header */}
      <div>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{ticker}</p>
        <p className="text-base font-semibold text-gray-900 dark:text-gray-50">
          {INDEX_NAMES[ticker] ?? ticker}
        </p>
      </div>

      {/* Label + confidence */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {label ? (
            <span className={cx("rounded-full px-3 py-1 text-sm font-semibold", LABEL_STYLES[label])}>
              {label}
            </span>
          ) : (
            <span className="rounded-full px-3 py-1 text-sm font-semibold bg-gray-100 text-gray-400 dark:bg-gray-800">
              Pending analysis
            </span>
          )}
        </div>

        {confidence != null && (
          <span className="text-sm text-gray-500 dark:text-gray-400 tabular-nums">
            {confidence}% confidence
          </span>
        )}
      </div>

      {/* Confidence bar */}
      {label && confidence != null && (
        <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
          <div
            className={cx("h-full rounded-full transition-all duration-700", CONFIDENCE_BAR_COLOR[label])}
            style={{ width: `${confidence}%` }}
          />
        </div>
      )}

      {/* Summary */}
      <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 min-h-[3rem]">
        {summary || <span className="text-gray-400 dark:text-gray-500">Analysis will appear here after refresh.</span>}
        {streaming && <span className="ml-0.5 inline-block w-1 h-3.5 bg-blue-500 animate-pulse" />}
      </p>

      {/* RAG sources */}
      {sources.length > 0 && (
        <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Sources</p>
          <ul className="space-y-1">
            {sources.map((s) => (
              <li key={s.id} className="text-xs text-gray-500 dark:text-gray-400 truncate">
                <a href={s.sourceUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {s.articleTitle}
                </a>
                <span className="ml-2 text-gray-400">
                  {new Date(s.publishedAt).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Expandable news section */}
      {news.length > 0 && (
        <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={() => setNewsExpanded((v) => !v)}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <span>{newsExpanded ? "Hide" : "Show"} articles ({news.length})</span>
            <span className="text-gray-300 dark:text-gray-600">{newsExpanded ? "▴" : "▾"}</span>
          </button>

          {newsExpanded && (
            <ul className="mt-3 space-y-2">
              {news.map((a) => (
                <li key={a.url} className="text-xs">
                  <a
                    href={a.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-700 dark:text-gray-300 hover:underline leading-snug line-clamp-2"
                  >
                    {a.title}
                  </a>
                  <p className="text-gray-400 mt-0.5">
                    {a.source} · {new Date(a.publishedAt).toLocaleDateString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

export function BiasResultCardSkeleton() {
  return (
    <div className="w-full max-w-2xl rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm p-6 space-y-4 animate-pulse">
      <div className="space-y-1">
        <div className="h-3 w-10 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
      <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
      <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full" />
      <div className="space-y-2">
        <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-3 w-5/6 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-3 w-4/6 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    </div>
  )
}
