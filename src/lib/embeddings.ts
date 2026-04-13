import "server-only"
import OpenAI from "openai"

const client = new OpenAI()

export async function embedText(text: string): Promise<number[]> {
  const res = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  })
  return res.data[0].embedding
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return []
  const res = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: texts,
  })
  // API returns embeddings in the same order as input
  return res.data.map((d) => d.embedding)
}
