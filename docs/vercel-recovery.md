# DLAVIE Commerce Vercel Recovery

Use this checklist when Replit has taken over GitHub deploys or the production site stops deploying from Vercel.

## 1. Keep GitHub as the source of truth

- Push this repository branch to GitHub.
- In Replit, disable automatic deploys for this repository if you do not want Replit to publish production anymore.
- The `.replit` file can stay in the repo for development, but Vercel ignores it via `.vercelignore`.

## 2. Reconnect the project in Vercel

In Vercel dashboard:

1. Open the existing DLAVIE project, or import the GitHub repository again.
2. Connect the GitHub repository/branch that should deploy production.
3. Use the repository root as the Vercel root directory.
4. Let `vercel.json` provide the build settings:
   - Install Command: `corepack enable && pnpm install --frozen-lockfile`
   - Build Command: `pnpm --filter @workspace/dlavie run build`
   - Output Directory: `artifacts/dlavie/dist/public`

## 3. Restore environment variables in Vercel

Set these public env vars for Production, Preview, and Development as needed:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_APP_URL`

If the project already uses `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`, the web app can read those too, but `VITE_*` is preferred for Vite builds.

## 4. Restore domain ownership

If the public domain was moved to Replit:

1. In Replit, remove the custom domain from the deployment.
2. In Vercel, add the domain back under Project Settings → Domains.
3. Update DNS records to Vercel's recommended records.
4. Trigger a new Vercel production deployment.

## 5. Verify after redeploy

- Open the Vercel deployment URL and the production domain.
- Check `/`, `/login`, and a private route such as `/dashboard`.
- Confirm Supabase login redirects use the Vercel production URL.
