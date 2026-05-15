# PulseCheck

Real-time market sentiment dashboard for the three major US indices.

**[Live Demo](https://pulse-check-snowy.vercel.app/)**

Ingests financial news from Finnhub and Alpaca, embeds and stores articles in a PostgreSQL vector database, retrieves relevant context via cosine similarity, and streams LLM analysis to surface Bullish / Bearish / Neutral sentiment cards grounded in current headlines.

## Stack

Next.js · TypeScript · Vercel AI SDK · OpenAI · Supabase pgvector · Finnhub · Alpaca

## Running locally

```bash
npm install
cp .env.example .env
npm run dev
```
