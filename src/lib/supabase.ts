import "server-only"
import { createClient } from "@supabase/supabase-js"
import type { ArticleChunk, RetrievedChunk } from "@/types"

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
)

// ── Local types ───────────────────────────────────────────────────────────────

type ArticleChunkWithEmbedding = ArticleChunk & {
  ticker: string
  embedding: number[]
}

// ── ticker_fetch_log ──────────────────────────────────────────────────────────

export async function getLastFetched(ticker: string): Promise<string | null> {
  const { data } = await supabase
    .from("ticker_fetch_log")
    .select("fetched_at")
    .eq("ticker", ticker)
    .single()

  return data?.fetched_at ?? null
}

export async function markFetched(ticker: string): Promise<void> {
  await supabase
    .from("ticker_fetch_log")
    .upsert({ ticker, fetched_at: new Date().toISOString() }, { onConflict: "ticker" })
}

// ── news_embeddings ───────────────────────────────────────────────────────────

export async function upsertChunks(
  ticker: string,
  chunks: ArticleChunkWithEmbedding[],
): Promise<void> {
  if (chunks.length === 0) return

  const rows = chunks.map((c) => ({
    ticker,
    content: c.content,
    source_url: c.sourceUrl,
    article_title: c.articleTitle,
    published_at: c.publishedAt,
    chunk_index: c.chunkIndex,
    embedding: c.embedding,
  }))

  await supabase
    .from("news_embeddings")
    .upsert(rows, { onConflict: "ticker,source_url,chunk_index" })
}

// ── vector search ─────────────────────────────────────────────────────────────

export async function matchChunks(
  tickers: string[],
  queryEmbedding: number[],
  topK: number,
): Promise<RetrievedChunk[]> {
  const results = await Promise.allSettled(
    tickers.map((ticker) =>
      supabase.rpc("match_news_embeddings", {
        query_embedding: queryEmbedding,
        match_ticker: ticker,
        match_count: topK,
      }),
    ),
  )

  const all: RetrievedChunk[] = []

  for (const result of results) {
    if (result.status === "fulfilled" && result.value.data) {
      for (const row of result.value.data) {
        all.push({
          id: String(row.id),
          content: row.content,
          sourceUrl: row.source_url,
          articleTitle: row.article_title,
          publishedAt: row.published_at,
          similarity: row.similarity,
        })
      }
    }
  }

  // Merge across tickers, sort by similarity desc, return top topK
  return all.sort((a, b) => b.similarity - a.similarity).slice(0, topK)
}
