# Dlavie Motion Engine

Phase 1.2 upgrades the parent website into a GSAP + Lenis + WebGL interaction system while keeping the existing Dlavie brand structure and Cubic Core.

## Architecture

- `packages/animations/src/gsap-registry.ts` centralizes GSAP imports, registration, easing setup, and skipped-plugin documentation.
- `packages/animations/src/scroll-engine.ts` owns Lenis + ScrollTrigger synchronization and ScrollTo helpers.
- `packages/animations/src/effects.ts` provides Webflow-inspired `data-motion` effects for reveal and parallax.
- `apps/www/components/motion/*` contains React components for the global motion provider, scroll orchestration, kinetic text, scramble text, magnetic buttons, scroll progress, reveal wrappers, and the Motion Lab.
- `apps/www/components/webgl/*` contains the shader backdrop, Cubic Core holographic field, WebGL fallback, and GLSL strings.

## Why Lenis is the smooth-scroll engine

Lenis remains the single smooth-scroll engine because it is already installed, production-safe for this Next.js app, and provides consistent wheel/touch smoothing without adding a competing scroll abstraction. GSAP ScrollTrigger is used for timelines and scroll progress, not as the smooth-scroll engine.

`ScrollSmoother` is available in the installed GSAP package, but it is intentionally not activated in production because it would duplicate Lenis' role and create conflicting transforms/scroll ownership.

## Lenis + ScrollTrigger synchronization

`DlavieMotionProvider` renders `ReactLenis` with `autoRaf={false}`. `ScrollOrchestrator` reads the Lenis instance with `useLenis()` and calls `syncLenisWithScrollTrigger(lenis)`. The sync function:

1. Registers the Dlavie GSAP plugin registry.
2. Calls `ScrollTrigger.update()` on each Lenis scroll event.
3. Drives `lenis.raf(time * 1000)` from `gsap.ticker` so GSAP and Lenis share one timing loop.
4. Removes the Lenis listener and GSAP ticker callback during cleanup.

## GSAP plugin coverage matrix

| Plugin | Import path | Registered? | Used where | Mode | Reason |
| --- | --- | --- | --- | --- | --- |
| ScrollTrigger | `gsap/ScrollTrigger` | Yes | Homepage reveals, marquee scrub, nav compacting, scroll progress, Motion Lab rows | Production | Core scroll timeline engine synced to Lenis. |
| ScrollToPlugin | `gsap/ScrollToPlugin` | Yes | Top nav anchor helper and Motion Lab jump button | Production | Smooth anchor jumps while Lenis remains active. |
| Observer | `gsap/Observer` | Yes | Homepage scroll-energy CSS variable and Motion Lab event counter | Production | Normalizes wheel/touch/pointer interaction energy. |
| SplitText | `gsap/SplitText` | Yes | `KineticHeadline` character reveal | Production | Premium headline typography reveal. |
| ScrambleTextPlugin | `gsap/ScrambleTextPlugin` | Yes | Hero eyebrow and Motion Lab label | Production | Dlavie system-label scramble effect. |
| TextPlugin | `gsap/TextPlugin` | Yes | Registered for text timelines; documented in Motion Lab matrix | Production/documented | Safe core text plugin available for upcoming product copy transitions. |
| Flip | `gsap/Flip` | Yes | Motion Lab tile layout transition | Motion Lab | Demonstrates FLIP without forcing card routing complexity on homepage. |
| Draggable | `gsap/Draggable` | Yes | Motion Lab draggable puck | Motion Lab | Demonstrates pointer interaction pattern. |
| MotionPathPlugin | `gsap/MotionPathPlugin` | Yes | Motion Lab orbit/circuit path | Motion Lab | Demonstrates path-based kinetic UI. |
| DrawSVGPlugin | `gsap/DrawSVGPlugin` | Yes | Motion Lab circuit stroke draw | Motion Lab | Demonstrates premium SVG line reveal. |
| MorphSVGPlugin | `gsap/MorphSVGPlugin` | Yes | Registry + docs; not visually forced | Documented | Registered and available; not forced on homepage because no meaningful brand SVG morph is needed yet. |
| InertiaPlugin | `gsap/InertiaPlugin` | Yes | Motion Lab Draggable inertia | Motion Lab | Adds physical release feel to draggable demo. |
| Physics2DPlugin | `gsap/Physics2DPlugin` | Yes | Registry + docs | Documented | Safe and available; reserved for future particle bursts, not forced as fake production use. |
| PhysicsPropsPlugin | `gsap/PhysicsPropsPlugin` | Yes | Registry + docs | Documented | Safe and available; reserved for future physics-driven properties. |
| CustomEase | `gsap/CustomEase` | Yes | `dlaviePremium` and `dlavieText` eases | Production | Centralized premium easing tokens. |
| CustomBounce | `gsap/CustomBounce` | Yes | Registry + docs | Documented | Available for future tactile UI states; registered safely. |
| CustomWiggle | `gsap/CustomWiggle` | Yes | Registry + docs | Documented | Available for future micro-interactions; registered safely. |
| RoughEase | `gsap/EasePack` | Yes | Motion Lab pulse | Motion Lab | Proves EasePack usage for analog energy. |
| ExpoScaleEase | `gsap/EasePack` | Yes | Registry + docs | Documented | Available for scale transitions; registered safely. |
| SlowMo | `gsap/EasePack` | Yes | Registry + docs | Documented | Available for cinematic holds; registered safely. |
| GSDevTools | `gsap/GSDevTools` | No | None | Skipped/dev-only | Available but excluded from production bundles; should only be dynamically imported during local debugging. |
| MotionPathHelper | `gsap/MotionPathHelper` | No | None | Skipped/dev-only | Available but excluded from production bundles; visual editor helper only. |
| ScrollSmoother | `gsap/ScrollSmoother` | No | None | Skipped | Conflicts with the Lenis-owned smooth-scroll architecture. |
| PixiPlugin | `gsap/PixiPlugin` | No | None | Skipped | Requires PixiJS and there is no real Pixi feature. |
| EaselPlugin | `gsap/EaselPlugin` | No | None | Skipped | Requires EaselJS and there is no real Easel feature. |

## WebGL / GLSL effects

- `DlavieShaderBackdrop` renders a fullscreen decorative React Three Fiber shader layer using real GLSL vertex/fragment strings.
- `DlavieHolographicField` reuses the shader inside the Cubic Core stage as a localized aura.
- Shader uniforms include `uTime`, `uMouse`, `uResolution`, and `uIntensity`.
- The fragment shader combines lightweight fbm noise, violet/cyan/pink gradients, pointer response, and alpha falloff.
- `WebGLFallback` preserves the visual atmosphere if WebGL is unavailable.

## Webflow-inspired interaction convention

Future sections can opt into motion through designer-friendly attributes:

- `data-motion="reveal"`
- `data-motion="parallax"`
- `data-motion="scramble"`
- `data-motion="magnetic"`
- `data-speed="0.35"`
- `data-delay="0.15"`

`ScrollOrchestrator` parses these attributes through reusable effect functions instead of scattering one-off animation logic across page sections.

## Reduced motion and accessibility

- CSS globally collapses animation/transition duration under `prefers-reduced-motion: reduce`.
- Motion components check `prefers-reduced-motion` before creating large timelines.
- Important content remains DOM text; no essential copy is canvas-only.
- Decorative canvases are wrapped with `aria-hidden="true"`.
- Links/buttons remain semantic and keyboard focusable.

## Mobile performance strategy

- WebGL DPR is capped (`[1, 1.35]` for backdrop, `[1, 1.55]` for Cubic Core).
- Particle count remains modest.
- Antialiasing is disabled on the shader backdrop and enabled only on the hero stage.
- Dev-only GSAP helpers are not loaded on the homepage.
- ScrollSmoother is not activated, avoiding duplicate transform layers.
