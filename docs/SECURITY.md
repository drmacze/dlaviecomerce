# Security

## Secrets

All secrets are environment variables. Pino redacts authorization and admin headers. Route responses never include provider keys, service-role keys, or admin keys.

## Auth model

Frontend sends `Authorization: Bearer <supabase_access_token>`. The backend verifies it with Supabase and attaches the user. User data endpoints are user-scoped.

## Admin access

Admin endpoints accept either a Supabase user whose `profiles.role` is `admin` or `x-admin-api-key`. The header method is only for trusted server/admin scripts, not browsers.

## RLS assumptions

RLS is enabled. Users can read/write their own conversations and messages. Knowledge and usage tables are managed by the backend service-role client.

## Rate limiting

Global Fastify rate limiting uses user id when available plus IP. 429 responses use the structured error format.

## Prompt injection

Server prompts are always first. Client system messages are downgraded to user context. RAG content is labeled untrusted and bounded inside `<knowledge_context>`.

## CORS

`CORS_ORIGINS` is an allow-list. Wildcard CORS is rejected in production env validation.
