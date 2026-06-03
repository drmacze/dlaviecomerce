# Security

## Secrets

All secrets are environment variables. Pino redacts authorization and admin headers. Route responses never include provider keys, service-role keys, or admin keys.

## Auth model

Frontend sends `Authorization: Bearer <supabase_access_token>`. The backend verifies it with Supabase and attaches the user. User data endpoints are user-scoped.

## Admin access

Admin endpoints accept either a Supabase user whose `profiles.role` is `admin` or `x-admin-api-key`. The header method is only for trusted server/admin scripts, not browsers.

## RLS assumptions

RLS is enabled. Users can read their own conversations and messages. Browser write policies are intentionally omitted so clients cannot forge assistant/system messages or bypass backend usage logging; conversation/message writes are performed by the backend service-role client after ownership checks. Knowledge and usage tables are also managed by the backend service-role client. The vector-search RPC revokes execution from browser roles and grants execution only to `service_role`.

## Rate limiting

Global Fastify rate limiting uses a hashed bearer-token principal when present plus IP, or anonymous IP when unauthenticated. 429 responses use the structured error format.

## Prompt injection

Server prompts are always first. Client system messages are downgraded to user context. RAG content is labeled untrusted and bounded inside `<knowledge_context>`.

## CORS

`CORS_ORIGINS` is a comma-separated allow-list of frontend origins, for example `http://localhost:3000,http://localhost:5173,https://app.example.com`. Wildcard CORS is rejected in production env validation. Browser clients must call from one of the allowed origins and send Supabase bearer tokens in the `Authorization` header; never expose provider keys, the Supabase service-role key, or `ADMIN_API_KEY` in browser code.
