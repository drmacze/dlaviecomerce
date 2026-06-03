# Codex Notes

## What was built

A backend-only Fastify TypeScript API for DLavie AI with auth, chat, model routing, providers, RAG, knowledge management, conversation history, usage logging, migrations, tests, documentation, and follow-up security hardening for CORS, RLS assumptions, knowledge-route validation, structured 501 errors, and non-blocking usage logging.

## Commands run

- `npm install`
- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npm run build`

## Audit fixes applied

- Hardened RLS assumptions by removing browser insert/delete policies for conversations and messages and by restricting the vector-search RPC to `service_role`.
- Validated knowledge document IDs with Zod and removed order-dependent search argument mapping.
- Rejected wildcard/empty CORS origins in production and improved rate-limit keying with a hashed bearer-token principal plus IP.
- Added `NOT_IMPLEMENTED` structured error handling for the streaming placeholder.
- Made usage logging non-blocking so a logging failure does not fail successful chat responses.
- Added security regression tests.
- Improved RAG chunking for Markdown/plain text/structured documents, added heading metadata, configurable chunk/retrieval env vars, retrieval validation, and defensive knowledge-context sanitization.

## Remaining TODOs

- Implement true token-by-token SSE streaming for `/v1/chat/stream`.
- Add provider-specific cost calculation for `usage_logs.estimated_cost`.
- Add integration tests against a disposable Supabase project.

## Limitations

External AI and Supabase calls require real environment variables; unit tests use code paths that do not require real keys.
