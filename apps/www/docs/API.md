# DLavie AI Backend API

The Next.js application exposes server-only API route handlers under `app/api`. All route handlers run with `runtime = 'nodejs'`, validate request bodies and params with Zod, and delegate business logic to services in `src/server`.

## Routes

- `GET /api/health` — health check.
- `GET /api/v1/models` — authenticated model routing metadata.
- `POST /api/v1/chat` — authenticated chat completion with optional RAG.
- `POST /api/ai/chat` — frontend-safe DLavie AI app chat with cookie/Bearer auth and a public fallback.
- `POST /api/v1/chat/stream` — authenticated placeholder returning `NOT_IMPLEMENTED` until SSE streaming is added.
- `GET /api/v1/conversations` — authenticated conversation list.
- `GET /api/v1/conversations/:conversationId/messages` — authenticated conversation messages.
- `DELETE /api/v1/conversations/:conversationId` — authenticated conversation deletion.
- `POST /api/v1/kb/documents` — admin-only knowledge document creation.
- `GET /api/v1/kb/documents` — admin-only knowledge document list.
- `DELETE /api/v1/kb/documents/:documentId` — admin-only knowledge document deletion.
- `POST /api/v1/kb/search` — admin-only knowledge search returning `{ items }`.

Authenticated `/api/v1` routes require `Authorization: Bearer <supabase_access_token>`. Admin routes accept either an admin user token or trusted `x-admin-api-key` from a server-side client.

## DLavie AI app chat

`POST /api/ai/chat` accepts requests from the DLavie AI app shell without exposing provider, authentication, or database failures. It checks `Authorization: Bearer <supabase_access_token>` first, then the existing `dlavie-sb-at` cookie. A valid authenticated session delegates to the existing `chatService.send()` architecture. Missing, malformed, or invalid authentication returns a safe public answer and never creates a database conversation.

Request body:

```json
{
  "message": "Bagaimana DLavie PPOB bekerja?",
  "mode": "smart",
  "conversation_id": "optional-uuid",
  "use_rag": true,
  "metadata": { "surface": "app-shell" }
}
```

- `message` is required and must not be empty.
- `mode` is optional and supports `fast`, `smart`, `agent`, `research`, or `private`; the default is `smart`.
- `private` always disables RAG, even if `use_rag` is `true`.
- Public fallback answers cover greetings, PPOB, websites, commerce/stores, accounts/login, and automation/agents.
- Public responses include `authenticated: false`, `conversation_id: null`, and `fallback_used: true`.
- Authenticated provider or persistence failures return a friendly fallback answer rather than raw internal error details.

## Errors

Errors use structured JSON:

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Request validation failed.", "details": [] } }
```
