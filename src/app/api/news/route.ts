import { fetchNews } from "@/lib/news"
import type { AnalyzeErrorResponse } from "@/types"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const ticker = searchParams.get("ticker")?.toUpperCase().trim()

  if (!ticker) {
    return Response.json(
      { error: "ticker is required", code: "INVALID_INPUT" } satisfies AnalyzeErrorResponse,
      { status: 400 },
    )
  }

  try {
    const articles = await fetchNews(ticker)
    return Response.json(articles)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return Response.json(
      { error: message, code: "UPSTREAM_ERROR" } satisfies AnalyzeErrorResponse,
      { status: 502 },
    )
  }
}
