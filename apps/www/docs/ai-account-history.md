# DLavie AI account and history API

DLavie AI validates the existing HTTP-only `dlavie-sb-at` cookie against Supabase Auth. Tokens are never returned to the browser API consumer.

- `GET /api/account/me` returns a normalized account and the providers reported by Supabase Auth identities.
- `GET|PATCH /api/ai/preferences` reads or updates the authenticated user's opt-in `historyEnabled` preference. The default is `false`.
- `GET|DELETE /api/ai/history` lists or deletes the authenticated user's history.
- `GET|DELETE /api/ai/history/:conversationId` reads or deletes one owned conversation.
- `POST /api/ai/chat` generates a response. It persists only when the cookie user is authenticated, the server-side preference is enabled, request metadata opts in, and mode is not `private`.

Unsupported connectors, voice, media upload, and billing have no working API and must be presented as unavailable rather than active.


## Premium app integration

The mobile-first DLavie AI shell reads account identity from `GET /api/account/me`; it never accepts a client-supplied user ID. Conversation history remains disabled by default and is loaded only from the account-scoped history API after the authenticated user opts in. Private-mode requests are never persisted.

The chat endpoint accepts the premium UI modes `fast`, `smart`, `agent`, `research`, and `private`. They map to the supported provider modes server-side, and provider outages return a safe non-persisted fallback response instead of exposing a raw provider error. Unsupported media, voice, and connector actions are shown as unavailable until their backend/token storage exists.
