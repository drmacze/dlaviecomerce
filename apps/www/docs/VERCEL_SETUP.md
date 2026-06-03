# Vercel Setup

Recommended project settings:

- Root Directory: `apps/www`
- Framework Preset: Next.js
- Build Command: `pnpm build`
- Output Directory: `.next`

Required production environment variables include Supabase public values, Supabase server secrets, admin API key, and AI provider keys. Add them with Vercel's dashboard or CLI secret prompts.

```bash
cd apps/www
vercel login
vercel link
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add SUPABASE_JWT_SECRET production
vercel env add OPENAI_API_KEY production
vercel env add ADMIN_API_KEY production
vercel deploy --prod
```
