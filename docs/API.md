# API

Errors use `{ "error": { "code": "VALIDATION_ERROR", "message": "...", "details": {} } }`. Supported codes include `BAD_REQUEST`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `VALIDATION_ERROR`, `RATE_LIMITED`, `AI_PROVIDER_ERROR`, `AI_PROVIDER_TIMEOUT`, `RAG_ERROR`, `DATABASE_ERROR`, `NOT_IMPLEMENTED`, and `INTERNAL_ERROR`.

## GET /health

Public. Returns `{ ok, service, version, timestamp }`.

## GET /v1/models

Auth required. Returns safe provider names, RAG/fallback flags, and modes only. No secrets.

## POST /v1/chat

Auth required.

```json
{
  "mode": "dlavie",
  "use_rag": true,
  "messages": [{ "role": "user", "content": "Halo DLavie AI" }],
  "metadata": {}
}
```

Returns conversation id, assistant message id, answer, provider, model, fallback flag, RAG chunk metadata, and usage.

## POST /v1/chat/stream

Auth required. Currently returns HTTP 501 with `NOT_IMPLEMENTED`. Future SSE implementation should reuse `ChatService`, emit token deltas, and persist the final assistant message after the stream closes.

## GET /v1/conversations

Auth required. Query: `limit` default 20 max 100, `cursor` optional. Returns current user's conversations.

## GET /v1/conversations/:conversationId/messages

Auth required. Query: `limit` default 50 max 200, `cursor` optional. Returns messages only for an owned conversation.

## DELETE /v1/conversations/:conversationId

Auth required. Deletes only the current user's conversation.

## POST /v1/kb/documents

Admin required by `profiles.role='admin'` or trusted `x-admin-api-key`.

```json
{ "title": "Docs", "content": "Long text", "source_type": "manual", "metadata": {} }
```

Creates document, chunks, embeddings, and chunk rows. Chunking preserves Markdown/structured headings in metadata, uses `RAG_CHUNK_TARGET_TOKENS` and `RAG_CHUNK_OVERLAP_TOKENS`, and never returns raw embeddings.

## GET /v1/kb/documents

Admin required. Paginated knowledge documents.

## DELETE /v1/kb/documents/:documentId

Admin required. Deletes document and cascading chunks.

## POST /v1/kb/search

Admin required.

```json
{ "query": "pricing policy", "limit": 5, "similarity_threshold": 0.72 }
```

Returns matching chunks without raw embeddings. `limit` is bounded by `RAG_RETRIEVAL_MAX_RESULTS` (max 20) and `similarity_threshold` must be between 0 and 1. Retrieved content is treated as untrusted reference text when injected into chat prompts.
