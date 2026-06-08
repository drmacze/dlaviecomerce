# DLavie AI account and history API

DLavie AI validates the existing HTTP-only `dlavie-sb-at` cookie against Supabase Auth. Tokens are never returned to the browser API consumer.

- `GET /api/account/me` returns a normalized account and the providers reported by Supabase Auth identities.
- `GET|PATCH /api/ai/preferences` reads or updates the authenticated user's opt-in `historyEnabled` preference. The default is `false`.
- `GET|DELETE /api/ai/history` lists or deletes the authenticated user's history.
- `GET|DELETE /api/ai/history/:conversationId` reads or deletes one owned conversation.
- `POST /api/ai/chat` generates a response. It persists only when the cookie user is authenticated, the server-side preference is enabled, request metadata opts in, and mode is not `private`.

Unsupported connectors, voice, media upload, and billing have no working API and must be presented as unavailable rather than active.
