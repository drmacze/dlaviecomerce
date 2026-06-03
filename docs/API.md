# DLavie AI Backend API

This is the backend-only integration contract for a separate frontend. All responses are JSON unless an endpoint explicitly documents streaming. Dates are ISO 8601 strings. Nullable pagination cursors are returned as `null` when there is no next page.

## Base URL and versioning

- Local base URL: `http://localhost:8787`
- Versioned API prefix: `/v1`
- Public health endpoint: `/health`

## Authentication

### User routes

User routes require a Supabase access token from the frontend session:

```http
Authorization: Bearer <supabase_access_token>
```

Routes requiring user auth:

- `GET /v1/models`
- `POST /v1/chat`
- `POST /v1/chat/stream`
- `GET /v1/conversations`
- `GET /v1/conversations/{conversationId}/messages`
- `DELETE /v1/conversations/{conversationId}`

### Admin routes

Knowledge-base routes require either:

1. a Supabase user whose `profiles.role` is `admin`, sent with `Authorization: Bearer <supabase_access_token>`, or
2. `x-admin-api-key: <ADMIN_API_KEY>` from a trusted server/admin script.

Do **not** use `x-admin-api-key` in browser frontend code.

Admin routes:

- `POST /v1/kb/documents`
- `GET /v1/kb/documents`
- `DELETE /v1/kb/documents/{documentId}`
- `POST /v1/kb/search`

## CORS

CORS is controlled by the backend `CORS_ORIGINS` environment variable, a comma-separated allow-list such as:

```env
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,https://app.example.com
```

Frontend requirements:

- Call the API from an origin listed in `CORS_ORIGINS`.
- Send `Authorization` and `Content-Type: application/json` headers on authenticated JSON requests.
- Keep provider keys, Supabase service-role keys, and `ADMIN_API_KEY` out of browser code.

Production safety:

- Wildcard origins are rejected in production by env validation.
- If credentials/cookies are later introduced, keep exact origins only; do not use `*`.

## Common response conventions

### Success responses

- Resource lists use `{ "items": [...], "next_cursor": "..." | null }`.
- Mutations that delete resources use `{ "ok": true }`.
- Chat returns the created/updated conversation id, assistant message id, model metadata, RAG metadata, and usage.
- Public health returns `{ "ok": true, ... }`.

### Error responses

All errors use this shape:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human readable message",
    "details": {}
  }
}
```

Supported error codes:

- `BAD_REQUEST`
- `UNAUTHORIZED`
- `FORBIDDEN`
- `NOT_FOUND`
- `VALIDATION_ERROR`
- `RATE_LIMITED`
- `AI_PROVIDER_ERROR`
- `AI_PROVIDER_TIMEOUT`
- `RAG_ERROR`
- `DATABASE_ERROR`
- `NOT_IMPLEMENTED`
- `INTERNAL_ERROR`

---

## OpenAPI-style endpoint reference

### GET /health

**Auth:** Public

**Description:** Liveness/readiness signal for frontend and deployment health checks.

**Response 200**

```json
{
  "ok": true,
  "service": "DLavie AI Backend",
  "version": "1.0.0",
  "timestamp": "2026-06-03T21:00:00.000Z"
}
```

---

### GET /v1/models

**Auth:** User bearer token required

**Description:** Returns safe frontend-visible model configuration. API keys and secret values are never returned.

**Response 200**

```json
{
  "primaryProvider": "openai",
  "fallbackProvider": "huggingface",
  "ragEnabled": true,
  "fallbackEnabled": true,
  "availableModes": ["dlavie", "webdev", "lumina", "general"]
}
```

---

### POST /v1/chat

**Auth:** User bearer token required

**Description:** Sends a chat turn, creates a conversation when `conversation_id` is omitted, stores user/assistant messages, optionally retrieves RAG context, and returns the assistant answer.

**Request body**

```json
{
  "conversation_id": "optional-uuid",
  "mode": "dlavie",
  "use_rag": true,
  "stream": false,
  "messages": [
    {
      "role": "user",
      "content": "Halo DLavie AI"
    }
  ],
  "metadata": {}
}
```

**Validation**

- `messages`: 1 to 20 items.
- `messages[].role`: `user`, `assistant`, or `system`.
- `messages[].content`: non-empty after sanitization, max 12,000 characters.
- `mode`: `dlavie`, `webdev`, `lumina`, or `general`.
- Client `system` messages are downgraded to user-provided context and cannot override server prompts.

**Response 200**

```json
{
  "conversation_id": "b6af7f9f-84ef-45a4-b63d-2caa8bbf7d91",
  "message_id": "7f0309cf-6278-45d1-9c7e-034d0e48a402",
  "answer": "Halo! Ada yang bisa saya bantu?",
  "mode": "dlavie",
  "provider": "openai",
  "model": "gpt-4.1-mini",
  "fallback_used": false,
  "rag": {
    "enabled": true,
    "chunks_used": [
      {
        "document_id": "99ddc1a4-af2d-4a89-911e-5174e16d0f4a",
        "chunk_id": "51c799c4-a7c4-4ea5-9ad5-658c18d1d2d7",
        "title": "DLavie Docs",
        "similarity": 0.88
      }
    ]
  },
  "usage": {
    "prompt_tokens": 0,
    "completion_tokens": 0,
    "total_tokens": 0
  }
}
```

---

### POST /v1/chat/stream

**Auth:** User bearer token required

**Description:** Streaming placeholder. Currently returns HTTP 501 with `NOT_IMPLEMENTED`. Use `POST /v1/chat` until SSE/token streaming is implemented.

**Response 501**

```json
{
  "error": {
    "code": "NOT_IMPLEMENTED",
    "message": "Streaming is not implemented yet. Use POST /v1/chat; docs describe SSE integration steps.",
    "details": {}
  }
}
```

---

### GET /v1/conversations

**Auth:** User bearer token required

**Description:** Lists conversations for the authenticated user only.

**Query parameters**

| Name     | Type    | Default | Max   | Description                             |
| -------- | ------- | ------- | ----- | --------------------------------------- |
| `limit`  | integer | `20`    | `100` | Number of conversations to return.      |
| `cursor` | string  | none    | n/a   | Cursor from the previous `next_cursor`. |

**Response 200**

```json
{
  "items": [
    {
      "id": "b6af7f9f-84ef-45a4-b63d-2caa8bbf7d91",
      "title": "Halo DLavie AI",
      "mode": "dlavie",
      "created_at": "2026-06-03T21:00:00.000Z",
      "updated_at": "2026-06-03T21:05:00.000Z"
    }
  ],
  "next_cursor": null
}
```

---

### GET /v1/conversations/{conversationId}/messages

**Auth:** User bearer token required

**Description:** Lists messages for an authenticated user's own conversation only.

**Path parameters**

| Name             | Type | Description                                |
| ---------------- | ---- | ------------------------------------------ |
| `conversationId` | UUID | Conversation id owned by the current user. |

**Query parameters**

| Name     | Type    | Default | Max   | Description                             |
| -------- | ------- | ------- | ----- | --------------------------------------- |
| `limit`  | integer | `50`    | `200` | Number of messages to return.           |
| `cursor` | string  | none    | n/a   | Cursor from the previous `next_cursor`. |

**Response 200**

```json
{
  "items": [
    {
      "id": "e79a98ea-bbd5-4e9b-82f2-d076a4c58440",
      "role": "user",
      "content": "Halo DLavie AI",
      "created_at": "2026-06-03T21:00:00.000Z",
      "metadata": {}
    }
  ],
  "next_cursor": null
}
```

---

### DELETE /v1/conversations/{conversationId}

**Auth:** User bearer token required

**Description:** Deletes an authenticated user's own conversation only.

**Path parameters**

| Name             | Type | Description                                |
| ---------------- | ---- | ------------------------------------------ |
| `conversationId` | UUID | Conversation id owned by the current user. |

**Response 200**

```json
{
  "ok": true
}
```

---

### POST /v1/kb/documents

**Auth:** Admin required

**Description:** Creates a knowledge document, chunks it, embeds chunks, and stores chunk rows. Chunking preserves Markdown/structured headings in metadata, uses `RAG_CHUNK_TARGET_TOKENS` and `RAG_CHUNK_OVERLAP_TOKENS`, and never returns raw embeddings.

**Request body**

```json
{
  "title": "DLavie Docs",
  "content": "# Product\n\nMarkdown or plain text knowledge content.",
  "source_type": "manual",
  "source_url": "https://example.com/docs",
  "metadata": {}
}
```

**Validation**

- `title`: 1 to 300 characters.
- `content`: 1 to 500,000 characters.
- `source_type`: `manual`, `url`, `file`, `open_data`, or `internal`.
- `source_url`: optional valid URL.

**Response 200**

```json
{
  "document_id": "99ddc1a4-af2d-4a89-911e-5174e16d0f4a",
  "chunks_created": 12
}
```

---

### GET /v1/kb/documents

**Auth:** Admin required

**Description:** Lists knowledge documents. Intended for admin tools only.

**Query parameters**

| Name     | Type    | Default | Max   | Description                             |
| -------- | ------- | ------- | ----- | --------------------------------------- |
| `limit`  | integer | `20`    | `100` | Number of documents to return.          |
| `cursor` | string  | none    | n/a   | Cursor from the previous `next_cursor`. |

**Response 200**

```json
{
  "items": [
    {
      "id": "99ddc1a4-af2d-4a89-911e-5174e16d0f4a",
      "title": "DLavie Docs",
      "source_type": "manual",
      "source_url": null,
      "metadata": {},
      "created_at": "2026-06-03T21:00:00.000Z",
      "updated_at": "2026-06-03T21:00:00.000Z"
    }
  ],
  "next_cursor": null
}
```

---

### DELETE /v1/kb/documents/{documentId}

**Auth:** Admin required

**Description:** Deletes a knowledge document and cascading chunks.

**Path parameters**

| Name         | Type | Description            |
| ------------ | ---- | ---------------------- |
| `documentId` | UUID | Knowledge document id. |

**Response 200**

```json
{
  "ok": true
}
```

---

### POST /v1/kb/search

**Auth:** Admin required

**Description:** Searches the knowledge base with vector similarity. Intended for admin tooling/debugging. Chat RAG retrieval uses the same retrieval service internally.

**Request body**

```json
{
  "query": "pricing policy",
  "limit": 5,
  "similarity_threshold": 0.72
}
```

**Validation**

- `query`: non-empty after sanitization, max 4,000 characters.
- `limit`: 1 to 20, further bounded by `RAG_RETRIEVAL_MAX_RESULTS`.
- `similarity_threshold`: number from 0 to 1.

**Response 200**

```json
{
  "items": [
    {
      "chunk_id": "51c799c4-a7c4-4ea5-9ad5-658c18d1d2d7",
      "document_id": "99ddc1a4-af2d-4a89-911e-5174e16d0f4a",
      "title": "DLavie Docs",
      "content": "Relevant chunk text...",
      "metadata": {
        "heading": "Pricing",
        "headings": ["Product", "Pricing"],
        "chunk_index": 3
      },
      "similarity": 0.88
    }
  ]
}
```

---

## Frontend fetch examples

These are integration examples only. They are not frontend components and should be adapted by the separate UI project.

### Chat

```ts
const response = await fetch(`${apiBaseUrl}/v1/chat`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${supabaseAccessToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    mode: 'dlavie',
    use_rag: true,
    messages: [{ role: 'user', content: 'Halo DLavie AI' }],
  }),
});

const data = await response.json();
if (!response.ok) throw new Error(data.error?.message ?? 'Chat request failed');
```

### Conversation list

```ts
const response = await fetch(`${apiBaseUrl}/v1/conversations?limit=20`, {
  headers: { Authorization: `Bearer ${supabaseAccessToken}` },
});

const data = await response.json();
if (!response.ok) throw new Error(data.error?.message ?? 'Failed to load conversations');
```

### Conversation messages

```ts
const response = await fetch(`${apiBaseUrl}/v1/conversations/${conversationId}/messages?limit=50`, {
  headers: { Authorization: `Bearer ${supabaseAccessToken}` },
});

const data = await response.json();
if (!response.ok) throw new Error(data.error?.message ?? 'Failed to load messages');
```

### Knowledge search

Use this only from trusted admin tooling. Do not expose `ADMIN_API_KEY` in a browser frontend.

```ts
const response = await fetch(`${apiBaseUrl}/v1/kb/search`, {
  method: 'POST',
  headers: {
    'x-admin-api-key': process.env.ADMIN_API_KEY!,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query: 'pricing policy',
    limit: 5,
    similarity_threshold: 0.72,
  }),
});

const data = await response.json();
if (!response.ok) throw new Error(data.error?.message ?? 'Knowledge search failed');
```
