# DLavie Monorepo Agent Instructions

- This repository is a monorepo; the active web application lives in `apps/www`.
- Never redesign UI, change visual behavior, or build new UI unless explicitly requested.
- Keep this task's backend inside `apps/www` only.
- Next.js API route handlers belong in `apps/www/app/api`.
- Shared server/business logic belongs in `apps/www/src/server`.
- Supabase migrations belong in `apps/www/supabase/migrations`.
- The legacy root Fastify backend under `src/` is not the active deployment target; root npm scripts delegate to `@dlavie/www`.
- Use TypeScript strict mode.
- Run typecheck before finishing.
- Run tests before finishing.
- Never commit or expose secrets.
- Keep route handlers thin.
- Put business logic in services.
- Validate all incoming request bodies with Zod.
- Use structured JSON errors.
- Update docs when changing API behavior.
- Add tests for core logic.
- Preserve clean architecture.
