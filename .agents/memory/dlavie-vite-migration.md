---
name: DLAVIE Vite Migration
description: Key decisions and gotchas from migrating DLAVIE from Next.js to Vite+React in the Replit pnpm workspace.
---

# DLAVIE Vite Migration Notes

## Tailwind v3 vs v4 CSS
The scaffold generates an `index.css` with Tailwind v4 syntax (`@import "tailwindcss"`). But Vite 7's built-in postcss-import tries to resolve this as a CSS file, breaking PostCSS. The vite.config.ts uses Tailwind v3 (`tailwindcss()` postcss plugin). Always replace `index.css` with v3-compatible `@tailwind base/components/utilities` when using this stack.

**Why:** Vite 7 has postcss-import built-in and will try to follow `@import "tailwindcss"` as a CSS file, finding a JS file and failing with "Unknown word 'use strict'".

## WebGL in Replit sandbox
The Replit container has no GPU/WebGL. Three.js and OGL throw errors that get captured by `@replit/vite-plugin-runtime-error-modal` even after removing it from plugins (it's injected via virtual module infrastructure). The correct fix is to detect WebGL availability BEFORE creating renderers.

**Pattern:**
```ts
const testCanvas = document.createElement('canvas');
const hasWebGL = !!(window.WebGLRenderingContext && (testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl')));
if (!hasWebGL) return;
```
Apply this in both useEffect (OGL/Aurora) and useMemo (React Three Fiber Canvas).

## Next.js API routes
`pages/api/**` excluded from tsconfig (not compiled). Express backend in `artifacts/api-server` is the migration target but deferred — frontend uses graceful try/catch on all `/api/*` fetches so 502s are silent.

## wouter router shim
`src/lib/router.ts` exports `useRouter()` compatible with next/router. `isReady` is always `true` (wouter is synchronous). All useRouter imports must come from `@/lib/router`, not from `wouter` directly.
