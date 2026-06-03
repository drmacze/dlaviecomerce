# Codex Notes

## What was built

A backend-only Fastify TypeScript API for DLavie AI with auth, chat, model routing, providers, RAG, knowledge management, conversation history, usage logging, migrations, tests, and documentation.

## Commands run

- `npm install`
- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npm run build`

## Remaining TODOs

- Implement true token-by-token SSE streaming for `/v1/chat/stream`.
- Add provider-specific cost calculation for `usage_logs.estimated_cost`.
- Add integration tests against a disposable Supabase project.

## Limitations

External AI and Supabase calls require real environment variables; unit tests use code paths that do not require real keys.
