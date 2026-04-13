"use client"

import { useCompletion } from "@ai-sdk/react"
import type { BiasLabel } from "@/types"

const HEADER_RE = /\[JSON_HEADER\](.*?)\[\/JSON_HEADER\]/s

interface AnalyzeState {
  trigger: () => void
  label: BiasLabel | null
  confidence: number | null
  summary: string
  streaming: boolean
}

function parseCompletion(completion: string) {
  if (!completion) return { label: null, confidence: null, summary: "" }

  const match = completion.match(HEADER_RE)
  if (!match) return { label: null, confidence: null, summary: completion }

  let parsed: { label?: string; confidence?: number } = {}
  try {
    parsed = JSON.parse(match[1])
  } catch {
    // malformed header — still show whatever text follows
  }

  const validLabels: BiasLabel[] = ["Bullish", "Bearish", "Neutral"]
  const label = validLabels.includes(parsed.label as BiasLabel)
    ? (parsed.label as BiasLabel)
    : null

  const confidence =
    typeof parsed.confidence === "number" ? Math.min(100, Math.max(0, parsed.confidence)) : null

  const summary = completion.replace(HEADER_RE, "").trim()

  return { label, confidence, summary }
}

export function useAnalyze(ticker: string): AnalyzeState {
  const { complete, completion, isLoading } = useCompletion({
    api: "/api/analyze",
    body: { ticker },
    streamProtocol: "text",
  })

  const { label, confidence, summary } = parseCompletion(completion)

  return {
    trigger: () => complete(""),
    label,
    confidence,
    summary,
    streaming: isLoading,
  }
}
