# Cinematic Scroll — DLavie WWW

> Lenis + GSAP cinematic scrolling implementation for `apps/www`.

## Architecture

```
layout.tsx
  └── SmoothScrollProvider
        └── DlavieMotionProvider
              ├── ReactLenis (root, autoRaf=false)
              ├── ScrollOrchestrator  (GSAP animations)
              ├── ScrollProgress      (top progress bar)
              └── CinematicCursor     (custom cursor)
```

## How it works

### 1. Lenis (smooth scroll engine)
- `ReactLenis root autoRaf={false}` replaces the browser's native scroll with smooth interpolation.
- `duration: 1.35` — cinematic slowdown factor.
- `easing: (t) => 1 - 2^(-10t)` — exponential ease-out for a film-like deceleration.
- **autoRaf disabled** — GSAP's ticker drives the RAF loop instead, keeping Lenis and GSAP in perfect sync.

### 2. GSAP ticker sync (`syncLenisWithScrollTrigger`)
- Located in `packages/animations/src/scroll-engine.ts`.
- Pipes Lenis scroll events → `ScrollTrigger.update()`.
- Maintains `--dlv-scroll-progress`, `--dlv-scroll-velocity`, `--dlv-scroll-direction` CSS custom properties.

### 3. ScrollOrchestrator (animations)
- **Global effects** via `data-motion` attributes (see below).
- **Section-specific timelines** for hero, nav, marquee, ecosystem cards.
- **matchMedia breakpoints** — separate animation sets for desktop/mobile.
- **Background hue morph** — `--dlv-bg-hue-1` / `--dlv-bg-hue-2` shift as user scrolls.

### 4. CinematicCursor
- GSAP `quickTo` for 60fps performance.
- Dot follows instantly (0.12s), ring lags (0.52s) for depth feel.
- Auto-scales on `<a>`, `<button>`, `[data-cursor="expand"]`.
- Disabled on touch devices and `prefers-reduced-motion`.

---

## Usage in pages/components

### Reveal on scroll
```tsx
<div data-motion="reveal" data-delay="0.1">
  <Card />
</div>
```

### Parallax layer
```tsx
<img data-motion="parallax" data-speed="0.4" src="..." />
```

### 3D depth card
```tsx
<div data-motion="depth-card" data-depth="1.2">
  <FeatureCard />
</div>
```

### Cinematic text split
```tsx
<h2 data-motion="split-reveal" data-stagger="0.05">
  The future is AI-native
</h2>
```

### Via RevealSection component
```tsx
import { RevealSection } from '@/components/motion/RevealSection';

<RevealSection motion="reveal" delay={0.15}>
  <MyComponent />
</RevealSection>

<RevealSection motion="split-reveal" as="h2" sectionId="hero">
  DLavie AI
</RevealSection>
```

### Horizontal showcase section
```tsx
<section className="dlv-h-showcase">
  <div className="dlv-h-panel">Panel 1</div>
  <div className="dlv-h-panel">Panel 2</div>
  <div className="dlv-h-panel">Panel 3</div>
</section>
```

### Prevent Lenis scroll on inner scroll containers
```tsx
<div data-lenis-prevent className="overflow-y-auto max-h-64">
  Scrollable inner content
</div>
```

### Velocity-reactive blur
```tsx
<img className="dlv-velocity-blur" src="..." />
```
Blurs slightly when scrolling fast — good for background elements.

---

## CSS Custom Properties (available app-wide)

| Property | Range | Description |
|---|---|---|
| `--dlv-scroll-progress` | 0–1 | Overall scroll position |
| `--dlv-scroll-velocity` | 0–1 | Normalized scroll speed |
| `--dlv-scroll-direction` | 1 / -1 | Scroll direction (down/up) |
| `--dlv-scroll-energy` | 0–1 | Energy burst (for shaders) |
| `--dlv-active-section` | int | Index of active scroll section |
| `--dlv-bg-hue-1` | 220–280 | Background hue shift |
| `--dlv-bg-hue-2` | 220–260 | Secondary hue |

---

## Performance notes

- All animations use `will-change: transform` only where needed.
- `gsap.matchMedia()` cleanly separates desktop/mobile timelines.
- `prefers-reduced-motion: reduce` disables all animations via CSS + JS guard.
- `Observer` velocity tracking uses `requestAnimationFrame` budgeting inside GSAP ticker.
- `CinematicCursor` uses `quickTo` (GPU-optimized) — zero layout thrash.
