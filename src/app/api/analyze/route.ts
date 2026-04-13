import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"
import { fetchNews } from "@/lib/news"
import { indexNews, retrieveChunks } from "@/lib/rag"
import { systemPrompt, userMessage } from "@/lib/prompt"
import type { AnalyzeErrorResponse } from "@/types"

const VALID_TICKERS = ["SPY", "QQQ", "DIA", "MARKET"] as const
type ValidTicker = (typeof VALID_TICKERS)[number]

const TICKER_MAP: Record<ValidTicker, string[]> = {
  SPY: ["SPY"],
  QQQ: ["QQQ"],
  DIA: ["DIA"],
  MARKET: ["SPY", "QQQ", "DIA"],
}

function errorResponse(error: string, code: AnalyzeErrorResponse["code"], status: number) {
  return Response.json({ error, code } satisfies AnalyzeErrorResponse, { status })
}

export async function POST(req: Request) {
  let ticker: string
  try {
    const body = await req.json()
    ticker = body.ticker
  } catch {
    return errorResponse("Invalid request body", "INVALID_INPUT", 400)
  }

  if (!VALID_TICKERS.includes(ticker as ValidTicker)) {
    return errorResponse(`Invalid ticker: ${ticker}`, "INVALID_INPUT", 400)
  }

  const tickers = TICKER_MAP[ticker as ValidTicker]

  try {
    // Fetch news for all resolved tickers in parallel
    const newsResults = await Promise.allSettled(tickers.map((t) => fetchNews(t)))
    const newsMap = Object.fromEntries(
      tickers.map((t, i) => {
        const r = newsResults[i]
        return [t, r.status === "fulfilled" ? r.value : []]
      }),
    )

    const allNews = tickers.flatMap((t) => newsMap[t])
    if (allNews.length === 0) {
      return errorResponse("No news found for this ticker", "NO_NEWS", 502)
    }

    // Index news per ticker (cache-aware — skips if fetched < 1 hour ago)
    await Promise.allSettled(tickers.map((t) => indexNews(t, newsMap[t])))

    // Retrieve relevant chunks
    const query = `${ticker} stock market outlook bullish bearish sentiment`
    const chunks = await retrieveChunks(tickers, query)

    // Stream LLM response
    const result = streamText({
      model: openai("gpt-4o-mini"),
      system: systemPrompt(),
      prompt: userMessage(ticker, chunks),
    })

    return result.toTextStreamResponse()
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return errorResponse(message, "UPSTREAM_ERROR", 502)
  }
}
