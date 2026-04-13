// ── Price ────────────────────────────────────────────────────────────────────

export interface PriceData {
  ticker: string
  price: number
  change: number
  changePercent: number
}

// ── News ─────────────────────────────────────────────────────────────────────

export interface NewsArticle {
  title: string
  description: string | null
  content: string | null
  url: string
  publishedAt: string
  source: string
}

export interface ArticleChunk {
  content: string
  sourceUrl: string
  articleTitle: string
  publishedAt: string
  chunkIndex: number
}

export interface RetrievedChunk {
  id: string
  content: string
  sourceUrl: string
  articleTitle: string
  publishedAt: string
  similarity: number
}

// ── Analysis ─────────────────────────────────────────────────────────────────

export type BiasLabel = "Bullish" | "Bearish" | "Neutral"

export interface BiasResult {
  ticker: string
  label: BiasLabel
  confidence: number        // 0–100
  summary: string
  sources: RetrievedChunk[]
  priceData: PriceData
  analyzedAt: string
}

// ── API ───────────────────────────────────────────────────────────────────────

export interface AnalyzeRequest {
  ticker: string
}

export interface AnalyzeErrorResponse {
  error: string
  code: "INVALID_INPUT" | "TICKER_NOT_FOUND" | "NO_NEWS" | "UPSTREAM_ERROR"
}
