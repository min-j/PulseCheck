import "server-only"
import type { NewsArticle } from "@/types"

const FINNHUB_BASE = "https://finnhub.io/api/v1"
const FINNHUB_KEY = process.env.FINNHUB_API_KEY!

const ALPACA_BASE = "https://data.alpaca.markets/v1beta1"
const ALPACA_KEY = process.env.ALPACA_API_KEY!
const ALPACA_SECRET = process.env.ALPACA_SECRET_KEY!

// ── Finnhub ───────────────────────────────────────────────────────────────────

interface FinnhubArticle {
  headline: string
  summary: string
  url: string
  source: string
  datetime: number // Unix timestamp (seconds)
}

async function fetchFinnhubNews(ticker: string): Promise<NewsArticle[]> {
  const to = new Date()
  const from = new Date(to)
  from.setDate(from.getDate() - 7)

  const fmt = (d: Date) => d.toISOString().split("T")[0]

  const res = await fetch(
    `${FINNHUB_BASE}/company-news?symbol=${encodeURIComponent(ticker)}&from=${fmt(from)}&to=${fmt(to)}&token=${FINNHUB_KEY}`,
    { cache: "no-store" },
  )
  if (!res.ok) return []

  const articles: FinnhubArticle[] = await res.json()
  if (!Array.isArray(articles)) return []

  return articles
    .filter((a) => a.url && a.headline)
    .map((a) => ({
      title: a.headline,
      description: a.summary || null,
      content: null,
      url: a.url,
      publishedAt: new Date(a.datetime * 1000).toISOString(),
      source: a.source,
    }))
}

// ── Alpaca ────────────────────────────────────────────────────────────────────

interface AlpacaArticle {
  headline: string
  summary: string
  content: string
  url: string
  source: string
  created_at: string
}

async function fetchAlpacaNews(ticker: string): Promise<NewsArticle[]> {
  const res = await fetch(
    `${ALPACA_BASE}/news?symbols=${encodeURIComponent(ticker)}&limit=20&sort=desc`,
    {
      headers: {
        "APCA-API-KEY-ID": ALPACA_KEY,
        "APCA-API-SECRET-KEY": ALPACA_SECRET,
      },
      cache: "no-store",
    },
  )
  if (!res.ok) return []

  const json = await res.json()
  const articles: AlpacaArticle[] = json.news ?? []

  return articles
    .filter((a) => a.url && a.headline)
    .map((a) => ({
      title: a.headline,
      description: a.summary || null,
      content: a.content || null,
      url: a.url,
      publishedAt: a.created_at,
      source: a.source,
    }))
}

// ── Combined ──────────────────────────────────────────────────────────────────

export async function fetchNews(ticker: string): Promise<NewsArticle[]> {
  const [finnhub, alpaca] = await Promise.all([
    fetchFinnhubNews(ticker),
    fetchAlpacaNews(ticker),
  ])

  // Merge and deduplicate by URL
  const seen = new Set<string>()
  const merged: NewsArticle[] = []

  for (const article of [...finnhub, ...alpaca]) {
    if (!seen.has(article.url)) {
      seen.add(article.url)
      merged.push(article)
    }
  }

  // Sort newest first, cap at 20
  return merged
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 20)
}
