# PHASE 1.4 — DLAVIE METAMASK-LEVEL NEAR-CLONE VISUAL SYSTEM FINAL PASS

Use GPT-5.5 if available.

Repository: `drmacze/dlaviecomerce`

Current PR: https://github.com/drmacze/dlaviecomerce/pull/13

Current PR branch: `codex/upgrade-dlavie-interaction-engine-and-webgl`

Base branch: `dlavie-v2-foundation`

## Important workflow

Continue on the existing PR #13 branch. Do not create a new PR unless updating the current PR branch is impossible. Do not merge automatically.

PR #13 already contains Phase 1.2, Phase 1.3, and a small manual polish patch. Treat this phase as the final visual polish pass for the parent DLavie website before moving into brand asset system work.

## Important intent

This prompt is intentionally stricter than previous Phase 1.4 prompts.

The previous direction “inspired by MetaMask” is not enough. The expected output should be visually much closer to the current MetaMask.io homepage interaction/design-system quality.

MetaMask is the visual-system benchmark. DLavie remains the product, brand, name, content, and business direction.

Do not build a crypto wallet website. Do not rename DLavie to MetaMask. Do not use MetaMask logos, fox identity, proprietary illustrations, screenshots, exact copy, exact assets, source code, wallet claims, crypto-specific product meaning, or copyrighted materials.

But the visual craft target is intentionally close: structure quality, nav polish, product-card craft, spacing discipline, responsive behavior, premium product landing-page system, CTA polish, content rhythm, hover feel, and overall level of finish should feel like a serious MetaMask-level homepage adapted to DLavie.

If the result looks like a generic dark website, a plugin demo, a blog, or a weak “inspired by” interpretation, this phase has failed.

## Brand lock

Keep the public brand as:

- DLavie
- DLavie Inc.
- DLavie Commerce
- DLavie AI
- DLavie Account
- DLavie Automation
- DLavie Admin

Main positioning:

DLavie is a parent technology ecosystem brand building commerce, AI, identity, automation, and operational products for modern digital life.

Use DLavie’s established dark-tech direction:

- dark premium base
- violet/cyan energy
- cubic core identity
- AI/product ambience
- clean modern interface
- professional Gen Z-ready feel

Do not make it orange, fox-themed, wallet-themed, crypto-themed, or onchain-themed.

## Current visual problems to fix

User review after Phase 1.3:

1. Animation is improving, but still not rich enough.
2. There is too much blur.
3. Some cards/text look like blurred screenshots.
4. The first cinematic text area is visually ugly.
5. The font is good, but composition looks poor.
6. Some sections look like a blog, not a serious Next.js site using GSAP + Lenis + WebGL.
7. Motion variety is still too limited.
8. The site is better but still not satisfying.

You must treat this as a serious visual-quality failure to fix, not as minor tweaks.

## Visual target

Build a DLavie homepage that feels like:

- MetaMask-level product website quality
- premium product marketing homepage
- polished component system
- clean information architecture
- strong navigation and menu craft
- sharp typography hierarchy
- bento/product surfaces
- high-quality CTA system
- refined scroll animation
- GSAP + Lenis + WebGL used for premium experience, not as decoration
- mobile and desktop both intentionally designed

The result should feel substantially closer to a major-brand landing page than the current PR.

## Strict legal/originality rule

Use MetaMask only as visual-system benchmark.

Allowed:

- similar quality bar
- similar design discipline
- similar spacing logic
- similar premium navigation craft
- similar product-card density and rounded visual language
- similar landing-page confidence
- similar product-surface rhythm
- similar smooth interaction expectation

Not allowed:

- MetaMask logo
- fox mark
- MetaMask text/copy
- exact images
- exact illustration
- exact code
- exact layout clone at pixel level
- wallet/onchain product direction
- orange brand replacement
- pretending DLavie is MetaMask

## Must preserve current stack

Do not remove:

- Next.js App Router
- TypeScript
- GSAP
- Lenis
- Three.js
- React Three Fiber
- Drei
- WebGL shader backdrop
- GLSL shader modules
- DLavie Cubic Core
- `/motion-lab`
- `@dlavie/animations`
- Lenis + ScrollTrigger synchronization
- `docs/motion-engine.md`
- PR #13 branch architecture

Do not replace the project architecture with a new `src/` folder or unrelated CSS Modules architecture. Continue from the current `apps/www` and `packages/animations` structure.

## Files to inspect first

Inspect these before changing code:

- `apps/www/app/page.tsx`
- `apps/www/app/globals.css`
- `apps/www/app/cinematic-polish.css`
- `apps/www/app/layout.tsx`
- `apps/www/components/HeroShowcase.tsx`
- `apps/www/components/TopNav.tsx`
- `apps/www/components/navigation/DlavieMenuOverlay.tsx`
- `apps/www/components/sections/DlavieCinematicScroll.tsx`
- `apps/www/components/motion/ScrollOrchestrator.tsx`
- `apps/www/components/motion/KineticHeadline.tsx`
- `apps/www/components/motion/MagneticButton.tsx`
- `apps/www/components/motion/ScrambleText.tsx`
- `apps/www/components/webgl/DlavieShaderBackdrop.tsx`
- `apps/www/components/webgl/DlavieHolographicField.tsx`
- `apps/www/components/webgl/shaders/dlavieField.frag.ts`
- `packages/animations/src/effects.ts`
- `packages/animations/src/scroll-engine.ts`
- `packages/animations/src/gsap-registry.ts`

## Audit requirement before coding

Before making changes, identify why the current visual result feels weak.

Specifically audit:

1. Which elements still use heavy blur or muddy opacity.
2. Which sections look like text blocks or blog cards.
3. Which motion effects are too generic.
4. Which card layouts lack premium product-surface composition.
5. Which mobile layouts are too flat.
6. Which desktop sequences do not feel cinematic enough.
7. Whether the manual `cinematic-polish.css` patch should be merged into `globals.css` or kept intentionally.
8. Whether the current nav/menu is strong enough to match major-brand quality.
9. Whether shader background is supporting visual hierarchy or muddying it.
10. Whether text stays readable throughout scroll.

Then fix root causes.

## Blur rule

Remove excessive blur.

The current result has too much blur and some content looks like a blurred screenshot. This is unacceptable.

Use blur only as a subtle atmospheric layer, not on readable content.

Hard rules:

- No `filter: blur(7px)` on text panels.
- No `filter: blur(10px)` on cards.
- No card text should appear soft or muddy.
- Avoid blur as a primary animation mechanic.
- Use clip-path, masks, transform, scale, opacity, depth, border highlights, line draw, signal bars, and shader movement instead.
- Keep text sharp.
- Keep cards crisp.
- Use backdrop-filter only carefully; if it muddies content, reduce it.

## Cinematic section redesign

The current “Enter the Core / Digital Ecosystem / Intelligence Layer / Launch Surface” area must stop looking like a blog.

Turn it into a premium product-storytelling command interface.

The section should feel like one of these:

- DLavie command sequence
- parent ecosystem operating surface
- AI/product control layer
- launch console
- product-system narrative
- cinematic product deck controlled by scroll

Each chapter should look like a product interface panel, not an article.

Recommended chapter structure:

- number
- short label
- status chip
- title
- short body copy
- meta row
- signal/progress indicator
- active-state highlight
- product system hints

Example content direction:

Chapter 01:
Label: DLAVIE CORE
Status: Engine online
Title: Enter the Core
Copy: A living command field for commerce, AI, account, automation, and admin products.
Meta: Scroll-linked depth · Shader response · Cubic identity

Chapter 02:
Label: ECOSYSTEM
Status: Product nodes linked
Title: Digital Ecosystem
Copy: Commerce, AI, Account, Automation, and Admin resolve into one operating surface.
Meta: Commerce · AI · Account · Automation

Chapter 03:
Label: INTELLIGENCE
Status: Intelligence layer active
Title: Intelligence Layer
Copy: Kinetic systems help transform daily workflows into intelligent product surfaces.
Meta: SplitText · ScrambleText · Workflow signals

Chapter 04:
Label: LAUNCH
Status: Surface ready
Title: Launch Surface
Copy: The motion settles into a clear path toward DLavie Commerce and DLavie AI.
Meta: Commerce-ready · AI-ready · Account-ready

## Card redesign

Cards should feel like premium product surfaces.

Improve:

- border crispness
- readable contrast
- inner highlight
- product icon or monogram
- status chip
- short technical metadata
- clear title
- compact body copy
- hover/active state
- scroll-scrubbed movement
- responsive layout

Cards must not feel like generic dark rectangles.

Potential card content:

- Commerce OS: Transaction rails, PPOB catalog, provider logs
- DLavie AI: Prompt tools, workspace, automation, usage insight
- Account Graph: Unified identity, profile mapping, role model
- Automation Fabric: Triggers, workflows, system signals
- Admin Cockpit: Operational visibility, audit logs, provider control

## Motion variety requirements

Add more motion types, but keep it tasteful.

Use a combination of:

- scroll-scrubbed clip-path reveal
- text mask reveal
- line draw / signal expansion
- card depth stack
- scroll-based scale/zoom
- perspective movement
- active chapter transition
- numeric progress indicator
- CTA shine / dual-label hover
- menu overlay stagger
- shader pulse from velocity
- background grid drift
- product surface parallax
- card spotlight on hover/pointer

Do not rely only on fade + translateY.
Do not rely on blur.
Do not make chaotic animation.

Main animations must reverse naturally when scrolling upward.

## Top navigation

The top nav should feel closer to a major product website:

- clean glass/solid hybrid
- strong logo/wordmark zone
- product links
- premium CTA
- animated hamburger/menu
- accessible menu overlay
- clear active state
- hover polish
- no broken icon
- no plain/basic bar feeling

The menu overlay should feel intentional:

- product links
- short product descriptions
- maybe a featured DLavie ecosystem panel
- clean animation
- Escape/outside/link close
- keyboard accessible

## Hero area

The top hero should feel clean, futuristic, and premium.

Keep:

- DLavie headline
- DLavie Cubic Core
- shader ambience
- primary/secondary CTAs
- parent brand positioning

Improve if needed:

- spacing
- hierarchy
- CTA craft
- text rhythm
- background clarity
- visual balance
- mobile first screen

Avoid clutter. The first viewport should feel expensive and intentional.

## WebGL/shader direction

Keep WebGL active but do not let it muddy the page.

Shader should support:

- premium ambient depth
- scroll velocity pulse
- subtle energy field
- violet/cyan brand tone
- pointer response on desktop
- mobile-safe fallback

Do not overpower text.
Do not make cards hard to read.

## Mobile requirements

Mobile cannot look like a plain blog.

Mobile should feel like premium stacked product interface panels:

- sharp cards
- strong labels
- status chips
- active chapter feel
- compact copy
- good spacing
- light but real scroll motion
- no excessive blur
- no desktop jank
- no unreadable text

Use simpler motion than desktop, but keep the design premium.

## Desktop requirements

Desktop should feel cinematic.

Desktop should have:

- pinned or scroll-driven section quality
- strong 3D/WebGL stage
- product cards moving from depth
- visible chapter transitions
- text mask/clip effects
- active indicator/progress
- crisp card surfaces
- intentional layout

## Button and CTA requirements

Improve button craft.

Use one or more:

- dual-label slide hover
- shine sweep
- magnetic hover
- icon movement
- subtle scale
- strong focus state
- gradient border

Buttons must remain accessible and semantic.

## Design token discipline

Create/clean tokens where useful:

- brand colors
- surface colors
- border colors
- glow values
- radius scale
- typography scale
- motion durations
- easing names

Do not spread random magic values without reason.

## Performance constraints

Do not ruin performance.

- Keep WebGL DPR capped.
- Keep particle counts modest.
- Avoid heavy filters.
- Avoid layout-thrashing properties.
- Use transform, opacity, clip-path, CSS variables.
- Use GSAP context cleanup.
- Kill ScrollTriggers on unmount.
- Use matchMedia for desktop/mobile.
- Respect prefers-reduced-motion.
- Do not add unnecessary dependencies.

## Accessibility constraints

- Important content must remain DOM text.
- Decorative canvas must be aria-hidden.
- Menu must use aria-expanded / aria-controls.
- Menu should close on Escape, outside click, link click.
- Focus states must remain visible.
- Reduced motion should remain usable.
- Text contrast must be readable.

## Documentation update

Update `docs/motion-engine.md` with a new section:

`Phase 1.4 Visual System Final Polish`

Document:

- what was wrong visually before Phase 1.4
- blur reduction strategy
- how the cinematic section became product-surface oriented
- new animation types added
- mobile polish strategy
- desktop polish strategy
- accessibility/performance notes
- what remains for later phases

## Commands to run

Run:

```bash
pnpm install --no-frozen-lockfile
pnpm --filter @dlavie/www typecheck
pnpm --filter @dlavie/www build
pnpm --filter @dlavie/www test
pnpm --filter @dlavie/www lint
pnpm --filter @dlavie/animations typecheck
pnpm --filter @dlavie/animations build
pnpm --filter @dlavie/animations test
pnpm --filter @dlavie/animations lint
pnpm build
git diff --check
```

If any command fails:

- read full error
- identify root cause
- fix it
- rerun
- repeat until passing
- document blocker only if truly blocked

If possible, run visual smoke checks:

- homepage mobile top/middle/deep
- homepage desktop top/cinematic/deep
- menu open/close
- `/motion-lab`
- reduced motion

## Final report required

Provide:

1. Summary of visual issues found.
2. Summary of changes made.
3. Files changed.
4. What blur was removed/reduced.
5. How chapter section was redesigned away from blog style.
6. New animation types added.
7. How cards stay sharp while moving.
8. How mobile was improved.
9. How desktop was improved.
10. Build result.
11. Typecheck result.
12. Test result.
13. Lint result.
14. Whether `pnpm-lock.yaml` changed.
15. Known limitations.
16. Preview URL or PR URL.
17. Whether Phase 1.4 is ready for visual review.

## Acceptance criteria

Accepted only if:

- Homepage looks closer to a major product landing page.
- Visual craft is much stronger than Phase 1.3.
- Excessive blur is removed.
- Text is sharp and readable.
- Cinematic section no longer feels like a blog.
- Cards feel like premium product surfaces.
- Motion variety is visible.
- Scroll animations remain reversible.
- Lenis remains active.
- GSAP remains active.
- WebGL/shader remains active.
- DLavie Cubic Core remains active.
- Mobile feels premium.
- Desktop feels cinematic.
- Navigation/menu feels premium and functional.
- Build passes.
- Typecheck passes.
- Tests pass.
- Lint passes.
- Vercel deployment can succeed.

## Rejection criteria

Reject your own output and keep polishing if:

- it still looks like a generic dark template
- it still looks like a blog
- cards are still blurry
- text is hard to read
- animation is only fade + y movement
- mobile is boring
- desktop is not cinematic
- nav looks plain
- MetaMask-level craft is not meaningfully approached
- the homepage feels weaker than the current prompt objective
