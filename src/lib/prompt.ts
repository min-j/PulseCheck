import type { RetrievedChunk } from "@/types"

const INDEX_NAMES: Record<string, string> = {
  SPY: "S&P 500",
  QQQ: "NASDAQ-100",
  DIA: "Dow Jones",
  MARKET: "General Market (SPY, QQQ, DIA)",
}

export function systemPrompt(): string {
  return `You are a financial sentiment analyst. Your job is to assess current market sentiment based on recent news.

You MUST respond in exactly this format — no exceptions:
1. First line: [JSON_HEADER]{"label":"Bullish"|"Bearish"|"Neutral","confidence":<0-100>}[/JSON_HEADER]
2. Then: a 2-3 sentence plain-English summary of the current market sentiment based on the provided news.

Rules:
- label must be exactly one of: "Bullish", "Bearish", or "Neutral"
- confidence is an integer 0-100 reflecting your certainty
- The summary must be grounded in the news provided — do not invent facts
- Do not repeat the label in the summary
- Write in present tense, concise and direct`
}

export function userMessage(ticker: string, chunks: RetrievedChunk[]): string {
  const name = INDEX_NAMES[ticker] ?? ticker
  const header = `Analyze current market sentiment for: ${ticker} (${name})\n\nRecent news:\n`

  const body = chunks
    .map(
      (c) =>
        `[Source: ${c.articleTitle} | Date: ${new Date(c.publishedAt).toLocaleDateString()}]\n${c.content}`,
    )
    .join("\n\n")

  return header + body
}
