# Deployment

## Node hosts: Railway, Render, Fly.io

Set Node 20+, configure all env vars, run `npm install`, `npm run build`, and start with `npm run start`.

## Vercel

Use this Fastify app behind a Vercel Node function or deploy to a persistent Node provider. Keep this repo backend-only; do not add UI pages.

## Required env vars

Production requires Supabase URL/anon/service-role/JWT secret, `ADMIN_API_KEY`, `OPENAI_API_KEY`, and fallback secrets when `ENABLE_MODEL_FALLBACK=true`.

## Supabase

Apply all files in `supabase/migrations/` in filename order, including the security hardening migration. Confirm pgvector is enabled and embedding dimension is 1536.

## Production checklist

- Restrict CORS to real frontend origins.
- Store secrets in platform secret manager.
- Create at least one admin profile.
- Confirm rate limit values match traffic expectations.
- Test `/health`, `/v1/models`, `/v1/chat`, and KB ingestion.
