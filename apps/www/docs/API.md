# DLavie AI Backend API

The Next.js application exposes server-only API route handlers under `app/api`. All route handlers run with `runtime = 'nodejs'`, validate request bodies and params with Zod, and delegate business logic to services in `src/server`.

## Routes

- `GET /api/health` — health check.
- `GET /api/v1/models` — authenticated model routing metadata.
- `POST /api/v1/chat` — authenticated chat completion with optional RAG.
- `POST /api/ai/chat` — frontend-safe DLavie AI app BFF. It validates `{ message, mode, metadata }`, reads existing DLavie Account cookies when present, returns friendly typed `{ ok, answer, source, mode }` responses, and never exposes raw provider/auth errors to the public UI.
- `POST /api/v1/chat/stream` — authenticated placeholder returning `NOT_IMPLEMENTED` until SSE streaming is added.
- `GET /api/v1/conversations` — authenticated conversation list.
- `GET /api/v1/conversations/:conversationId/messages` — authenticated conversation messages.
- `DELETE /api/v1/conversations/:conversationId` — authenticated conversation deletion.
- `POST /api/v1/kb/documents` — admin-only knowledge document creation.
- `GET /api/v1/kb/documents` — admin-only knowledge document list.
- `DELETE /api/v1/kb/documents/:documentId` — admin-only knowledge document deletion.
- `POST /api/v1/kb/search` — admin-only knowledge search returning `{ items }`.

Authenticated routes require `Authorization: Bearer <supabase_access_token>`. Admin routes accept either an admin user token or trusted `x-admin-api-key` from a server-side client.

## Errors

Errors use structured JSON:

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Request validation failed.", "details": [] } }
```
