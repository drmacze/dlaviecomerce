# Deployment

Deploy the Next.js app from `apps/www` so backend route handlers are built with the web app.

## Vercel settings

- Root Directory: `apps/www`
- Framework Preset: Next.js
- Build Command from `apps/www`: `pnpm build`
- Build Command from repository root: `pnpm --filter @dlavie/www build`
- Output Directory: `.next`

Run typecheck and tests before deploying:

```bash
pnpm --filter @dlavie/www typecheck
pnpm --filter @dlavie/www test
```
