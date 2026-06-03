# DLavie AI Backend

Backend-only Fastify/TypeScript API for DLavie AI. This repository intentionally contains no frontend UI, pages, React components, or visual layout code.

## Features

- Supabase JWT authentication and service-role data access.
- AI chat with server-side prompts, model routing, OpenAI-compatible provider, Hugging Face fallback adapter, chat history, and usage logging.
- RAG-ready knowledge base with Supabase Postgres + pgvector, chunking, embeddings, retrieval, and admin-only management.
- Zod validation, structured errors, rate limiting, CORS allow-listing, Helmet headers, and Pino logging with sensitive-header redaction.

## Tech stack

Node.js 20+, TypeScript strict, Fastify, Zod, Supabase JS SDK, pgvector, Pino, Vitest, ESLint, Prettier, dotenv, tsx.

## Local setup

```bash
npm install
cp .env.example .env
# fill Supabase, admin, and AI provider secrets
npm run dev
```

## Environment variables

See `.env.example`. Production fails fast if Supabase secrets, `ADMIN_API_KEY`, `OPENAI_API_KEY`, or enabled fallback secrets are missing. RAG chunking/retrieval can be tuned with `RAG_CHUNK_TARGET_TOKENS`, `RAG_CHUNK_OVERLAP_TOKENS`, `RAG_RETRIEVAL_MAX_RESULTS`, and `RAG_SIMILARITY_THRESHOLD`. Never commit `.env`.

## Supabase setup

1. Create a Supabase project.
2. Enable `vector` and `pgcrypto` via migrations.
3. Apply SQL in order:
   ```bash
   supabase db push
   ```
   or paste `supabase/migrations/*.sql` into the Supabase SQL editor in order.
4. Create admin users by setting `profiles.role = 'admin'`.

## API usage from frontend

Send `Authorization: Bearer <supabase_access_token>` to authenticated routes.

```ts
await fetch('/v1/chat', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    mode: 'dlavie',
    use_rag: true,
    messages: [{ role: 'user', content: 'Halo DLavie AI' }],
  }),
});
```

## Scripts

- `npm run dev` development server
- `npm run build` compile TypeScript
- `npm run start` run compiled server
- `npm run typecheck` type-only validation
- `npm run lint` ESLint
- `npm run test` Vitest
- `npm run format` Prettier

## Deployment notes

Works on Vercel serverless functions with an adapter, Railway, Render, Fly.io, or any Node.js 20 server. Configure env vars in the platform secret manager and use `npm run build && npm run start`.

## Security warnings

Never expose service-role, OpenAI, Hugging Face, or admin API keys to browsers. Browser clients should use Supabase access tokens. `x-admin-api-key` is for trusted scripts only.

## Troubleshooting

- 401: verify Supabase access token and `SUPABASE_URL`/`SUPABASE_ANON_KEY`.
- 403: ensure `profiles.role = 'admin'` or use `x-admin-api-key` from a trusted server.
- RAG errors: confirm migrations ran and embedding dimensions match `OPENAI_EMBEDDING_DIMENSIONS`.
