# Backend Architecture

Route handlers in `app/api` are intentionally thin: they authenticate, parse inputs, call services, and return JSON. Business logic lives in `src/server/services`, validation schemas live in `src/server/schemas`, and Supabase access is centralized in `src/server/lib/supabase.ts`.

The backend keeps browser-facing code separate from server-only secrets. Do not import `src/server` modules into client components.
