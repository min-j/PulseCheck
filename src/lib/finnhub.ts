import "server-only"
import type { PriceData } from "@/types"

const BASE = "https://finnhub.io/api/v1"
const KEY = process.env.FINNHUB_API_KEY!

interface QuoteResponse {
  c: number   // current price
  d: number   // change
  dp: number  // percent change
}

export async function fetchQuote(ticker: string): Promise<PriceData> {
  const res = await fetch(
    `${BASE}/quote?symbol=${encodeURIComponent(ticker)}&token=${KEY}`,
    { cache: "no-store" },
  )
  if (!res.ok) throw new Error(`Finnhub quote ${ticker}: ${res.status}`)

  const q: QuoteResponse = await res.json()
  if (!q.c) throw new Error(`Ticker not found: ${ticker}`)

  return {
    ticker,
    price: q.c,
    change: q.d,
    changePercent: q.dp,
  }
}
