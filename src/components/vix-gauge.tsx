"use client"

import type { PriceData } from "@/types"

// Gauge is driven by VXX daily change% — rising VXX = rising fear
// Display range: -5% (easing) to +5% (spiking), centered at 0%
const RANGE = 5

function getLabel(changePct: number): string {
  if (changePct < -2) return "Easing"
  if (changePct < -0.5) return "Calming"
  if (changePct < 0.5) return "Stable"
  if (changePct < 2) return "Rising"
  return "Spiking"
}

interface VixGaugeProps {
  data: PriceData | null
}

export function VixGauge({ data }: VixGaugeProps) {
  if (data == null) {
    return (
      <div className="w-full max-w-2xl space-y-2">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Volatility (VXX)</p>
        <p className="text-xs text-gray-400">Unavailable</p>
      </div>
    )
  }

  const pct = Math.min(Math.max(((data.changePercent + RANGE) / (RANGE * 2)) * 100, 0), 100)
  const positive = data.changePercent >= 0

  return (
    <div className="w-full max-w-2xl space-y-2">
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span className="font-medium uppercase tracking-wide">Volatility (VXX)</span>
        <span className="tabular-nums font-semibold text-gray-700 dark:text-gray-300">
          ${data.price.toFixed(2)}{" "}
          <span className={positive ? "text-red-500" : "text-emerald-500"}>
            {positive ? "+" : ""}{data.changePercent.toFixed(2)}%
          </span>
          {" "}— {getLabel(data.changePercent)}
        </span>
      </div>

      {/* Bar */}
      <div
        className="relative h-3 w-full rounded-full overflow-visible"
        style={{ background: "linear-gradient(to right, #22c55e, #84cc16, #eab308, #f97316, #ef4444)" }}
      >
        {/* Marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-white border-2 border-gray-800 dark:border-gray-100 shadow"
          style={{ left: `${pct}%` }}
        />
      </div>

      {/* Scale labels */}
      <div className="flex justify-between text-xs text-gray-400 tabular-nums">
        <span>−5%</span>
        <span>−2.5%</span>
        <span>0%</span>
        <span>+2.5%</span>
        <span>+5%</span>
      </div>
    </div>
  )
}

export function VixGaugeSkeleton() {
  return (
    <div className="w-full max-w-2xl space-y-2 animate-pulse">
      <div className="flex justify-between">
        <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
      <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full" />
    </div>
  )
}
