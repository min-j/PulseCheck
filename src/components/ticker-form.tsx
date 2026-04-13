"use client"

import { useState, type FormEvent } from "react"
import { cx } from "@/lib/utils"

interface TickerFormProps {
  onSubmit: (ticker: string) => void
  disabled?: boolean
}

export function TickerForm({ onSubmit, disabled }: TickerFormProps) {
  const [value, setValue] = useState("")

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const ticker = value.trim().toUpperCase()
    if (ticker) onSubmit(ticker)
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-md">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value.toUpperCase())}
        placeholder="Enter ticker (e.g. AAPL)"
        disabled={disabled}
        maxLength={10}
        className={cx(
          "flex-1 rounded-lg border border-gray-300 dark:border-gray-700",
          "bg-white dark:bg-gray-900 px-4 py-2 text-sm",
          "placeholder:text-gray-400 dark:placeholder:text-gray-500",
          "focus:outline-none focus:ring-2 focus:ring-blue-500",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "font-mono tracking-wider",
        )}
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className={cx(
          "rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white",
          "hover:bg-blue-700 active:bg-blue-800",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "transition-colors",
        )}
      >
        Analyze
      </button>
    </form>
  )
}
