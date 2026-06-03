# Architecture

The backend uses clean architecture: thin Fastify routes validate input and delegate to services. Infrastructure clients live in `lib/`; business logic lives under `services/`; schemas live under `schemas/`.

## Chat lifecycle

Authenticate Supabase JWT, validate Zod body, create/assert conversation, store latest user message, build server-side prompt, optionally retrieve RAG context, route model, call primary provider, fallback if enabled, store assistant message, log usage, return a safe response.

## RAG pipeline

Knowledge documents are chunked by headings/paragraphs with token approximation and overlap. Chunks are embedded through the OpenAI-compatible embedding endpoint, stored in pgvector, retrieved by `match_knowledge_chunks`, and reranked by similarity.

## Provider abstraction

`AIProvider` supports `chat()` and optional `streamChat()`. The OpenAI-compatible provider uses `/chat/completions`; the Hugging Face provider is an adaptable fallback for open-weight hosted models.

## Model router

`ModelRouterService` routes by mode, message size, RAG usage, and fallback state. Current defaults are intentionally simple but extensible.

## Database overview

Supabase tables: profiles, conversations, messages, knowledge_documents, knowledge_chunks, usage_logs, api_events. RLS protects user-owned tables while backend service-role clients perform controlled writes.
