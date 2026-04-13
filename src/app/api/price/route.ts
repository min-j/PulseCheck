import { fetchQuote } from "@/lib/finnhub"

const TICKERS = ["SPY", "QQQ", "DIA", "VXX"] as const

export async function GET() {
  const results = await Promise.allSettled(TICKERS.map((t) => fetchQuote(t)))

  const data = Object.fromEntries(
    TICKERS.map((ticker, i) => {
      const result = results[i]
      return [ticker, result.status === "fulfilled" ? result.value : null]
    })
  )

  return Response.json(data)
}
