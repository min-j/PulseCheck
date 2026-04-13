import "server-only"
import type { NewsArticle, ArticleChunk, RetrievedChunk } from "@/types"
import { getLastFetched, markFetched, upsertChunks, matchChunks } from "@/lib/supabase"
import { embedText, embedTexts } from "@/lib/embeddings"

const CHUNK_SIZE = 500
const CHUNK_OVERLAP = 50
const CACHE_TTL_MS = 10 * 60 * 1000 // 1 hour

// ── Chunking ──────────────────────────────────────────────────────────────────

function chunkText(text: string, sourceUrl: string, articleTitle: string, publishedAt: string): ArticleChunk[] {
  const chunks: ArticleChunk[] = []
  let start = 0
  let index = 0

  while (start < text.length) {
    const end = Math.min(start + CHUNK_SIZE, text.length)
    chunks.push({
      content: text.slice(start, end),
      sourceUrl,
      articleTitle,
      publishedAt,
      chunkIndex: index++,
    })
    if (end === text.length) break
    start += CHUNK_SIZE - CHUNK_OVERLAP
  }

  return chunks
}

function chunkArticles(articles: NewsArticle[]): ArticleChunk[] {
  const all: ArticleChunk[] = []

  for (const article of articles) {
    // Prefer content > description > title only
    const text = article.content || article.description || article.title
    if (!text) continue
    all.push(...chunkText(text, article.url, article.title, article.publishedAt))
  }

  return all
}

// ── Indexing ──────────────────────────────────────────────────────────────────

export async function indexNews(ticker: string, articles: NewsArticle[]): Promise<void> {
  // Skip if fetched within the last 10 minutes
  const lastFetched = await getLastFetched(ticker)
  if (lastFetched) {
    const age = Date.now() - new Date(lastFetched).getTime()
    if (age < CACHE_TTL_MS) return
  }

  const chunks = chunkArticles(articles)
  if (chunks.length === 0) return

  const embeddings = await embedTexts(chunks.map((c) => c.content))

  const chunksWithEmbeddings = chunks.map((c, i) => ({
    ...c,
    ticker,
    embedding: embeddings[i],
  }))

  await upsertChunks(ticker, chunksWithEmbeddings)
  await markFetched(ticker)
}

// ── Retrieval ─────────────────────────────────────────────────────────────────

export async function retrieveChunks(
  tickers: string[],
  query: string,
  topK = 8,
): Promise<RetrievedChunk[]> {
  const queryEmbedding = await embedText(query)
  return matchChunks(tickers, queryEmbedding, topK)
}
