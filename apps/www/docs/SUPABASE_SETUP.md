# Supabase Setup

Migrations for the app-local backend live in `apps/www/supabase/migrations`.

```bash
cd apps/www
supabase login
supabase link --project-ref <PROJECT_REF>
supabase db push
supabase gen types typescript --linked > src/server/types/supabase.generated.ts
```

Never commit service-role keys, JWT secrets, provider API keys, or generated local `.env` files.
