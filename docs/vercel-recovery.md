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

## 6. When Vercel says an old deployment cannot be redeployed

Vercel can block redeploying an old/stale deployment and show: `This deployment can not be redeployed. Please try again from a fresh commit.` When that happens, do not keep pressing the Redeploy button on the same deployment. Push a new commit to the branch connected to Vercel (for this recovery flow: `dlavie-redesign-v1`) so Vercel receives a fresh GitHub event and creates a new deployment from the latest source.

Recovery action used for this branch:

- Create a fresh commit on `work`.
- Push it to `origin/dlavie-redesign-v1`.
- Let the GitHub integration start a new Vercel build instead of redeploying the blocked deployment.
- If the Vercel dashboard still shows the same message after the push, you are still opening the old deployment. Go to Project → Deployments and wait for the new Git deployment from the latest commit, or set Project Settings → Git → Production Branch to the branch that received the fresh commit.
