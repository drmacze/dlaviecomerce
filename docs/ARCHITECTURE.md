# Architecture

The backend uses clean architecture: thin Fastify routes validate input and delegate to services. Infrastructure clients live in `lib/`; business logic lives under `services/`; schemas live under `schemas/`.

## Chat lifecycle

Authenticate Supabase JWT, validate Zod body, create/assert conversation, store latest user message, build server-side prompt, optionally retrieve RAG context, route model, call primary provider, fallback if enabled, store assistant message, log usage, return a safe response.

## RAG pipeline

1. **Ingestion**: admin-only knowledge routes validate document input, store the source document, chunk the content, embed chunks, and store chunk rows with metadata.
2. **Chunking**: `ChunkerService` supports Markdown, plain text, lists, tables, fenced code blocks, and structured text labels such as `Requirements:`. It keeps Markdown heading hierarchy in `metadata.headings`, stores the active leaf heading in `metadata.heading`, records detected `block_types`, and includes heading context in chunk text for better embeddings.
3. **Configuration**: chunk target size and overlap are controlled by `RAG_CHUNK_TARGET_TOKENS` and `RAG_CHUNK_OVERLAP_TOKENS`. Retrieval defaults are controlled by `RAG_RETRIEVAL_MAX_RESULTS` and `RAG_SIMILARITY_THRESHOLD`.
4. **Retrieval**: `RetrievalService` validates and sanitizes queries, enforces a bounded max result count, embeds the query, calls the service-role-only `match_knowledge_chunks` RPC, and returns chunk metadata without raw embeddings.
5. **Reranking**: initial reranking sorts by similarity, leaving room for future cross-encoder or LLM rerankers.
6. **Prompt injection defense**: retrieved knowledge is rendered as untrusted reference data inside `<knowledge_context>`. Risky instruction-like phrases and nested context tags are neutralized before injection, and the system prompt explicitly forbids following commands from knowledge content.

## Provider abstraction

`AIProvider` supports `chat()` and optional `streamChat()`. The OpenAI-compatible provider uses `/chat/completions`; the Hugging Face provider is an adaptable fallback for open-weight hosted models.

## Model router

`ModelRouterService` routes by mode, message size, RAG usage, and fallback state. Current defaults are intentionally simple but extensible.

## Database overview

Supabase tables: profiles, conversations, messages, knowledge_documents, knowledge_chunks, usage_logs, api_events. RLS protects user-owned tables while backend service-role clients perform controlled writes. The vector-search RPC is capped and only executable by the service role.
