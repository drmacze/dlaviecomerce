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

## Phase 1.3 Visual Review Fixes

### Why Phase 1.2 was not enough

Phase 1.2 proved that GSAP, Lenis, React Three Fiber, and GLSL were installed and functional, but the homepage still behaved like a normal vertical landing page. Most homepage motion was either entrance-only or subtle enough to be visually missed. The ecosystem and rail cards were not strongly tied to scroll position, the shader only reacted to time and pointer data, and the menu button had no open state or overlay.

### Root causes found

- Homepage ScrollTriggers were mostly reveal helpers; ecosystem cards used `once: true`, so upward scroll could not reverse them.
- Only a few elements used `scrub: true`, and there was no long pinned sequence to make scroll feel like the page engine.
- Lenis was synced to ScrollTrigger, but velocity, direction, active section, and progress were not exposed as reusable CSS/custom-event state.
- Shader uniforms only included time, mouse, intensity, and resolution. There was no `uScroll`, `uVelocity`, `uDirection`, `uZoom`, or `uSection`.
- The hamburger button rendered as a plain icon button with no `aria-expanded`, no state, no dropdown, and no Escape/outside-click behavior.
- Text animation happened mostly on load; there was not enough scroll-scrubbed masking/depth typography.

### What changed in Phase 1.3

- Added a central scroll state in `packages/animations/src/scroll-engine.ts` that exposes progress, direction, velocity, normalized velocity, active section index, and reduced-motion state.
- Added CSS variables: `--dlv-scroll-progress`, `--dlv-scroll-velocity`, `--dlv-scroll-direction`, `--dlv-section-progress`, `--dlv-hero-depth`, `--dlv-shader-intensity`, and `--dlv-zoom-progress`.
- Added `DlavieCinematicScroll`, a 430% scrubbed pinned sequence with four chapters: Enter the Core, Digital Ecosystem, Intelligence Layer, and Launch Surface.
- Added `createDepthCards()` so ecosystem cards and roadmap rail items follow scroll with depth transforms rather than one-time reveals.
- Upgraded `DlavieShaderBackdrop` and `DlavieHolographicField` to animate uniforms from scroll progress, velocity, direction, zoom, section, pointer, time, intensity, and resolution.
- Rebuilt the navigation menu button as an accessible animated hamburger with `aria-expanded`, a premium dropdown/dialog panel, outside-click close, Escape close, and link-close behavior.
- Updated `/motion-lab` with a live Lenis/shader state monitor and a pinned scrub zoom demo.

### Scroll-scrubbed timelines and upward reversal

The main homepage sequence uses GSAP `ScrollTrigger` with `scrub`, `pin`, `anticipatePin`, and `invalidateOnRefresh`. Because element transforms are tied directly to scroll progress instead of permanent class toggles, scrolling down advances the sequence and scrolling up reverses it automatically. The same approach is used for depth cards, marquee movement, hero depth, nav compaction, text masks, and Motion Lab scrub demos.

### Lenis velocity/direction feeding the shader

`syncLenisWithScrollTrigger()` listens to Lenis scroll events, computes normalized velocity and direction, writes CSS variables, dispatches a `dlavie:scroll-state` event, and then updates ScrollTrigger. The WebGL shader reads those CSS variables every frame and maps them into uniforms:

- `uScroll`
- `uVelocity`
- `uDirection`
- `uZoom`
- `uSection`
- `uMouse`
- `uTime`
- `uIntensity`
- `uResolution`

### Card parallax and depth motion

Cards with `data-motion="depth-card"` now use scrubbed timelines. They start offset in X/Y, scaled down, rotated in 3D, clipped, blurred, and partially transparent; as scroll progresses they move into place. Because the animation is scrubbed, cards visibly follow scroll downward and reverse upward.

### Pinned zoom sequence

`DlavieCinematicScroll` creates a camera-like depth experience by pinning the section and animating the Cubic Core stage scale/rotation, card Z-depth, chapter text, large split typography, launch panel, and shader CSS variables over a long scroll distance. This creates a visible zoom/depth transition inspired by premium smooth-scroll sites while keeping the Dlavie identity and original content.

### Navigation menu fix

The right menu control is now a custom three-line hamburger button rather than a static icon. It exposes `aria-expanded`, toggles an animated overlay, closes on link click, closes on Escape, closes on outside click, and avoids layout shift by using a fixed overlay layer.

### Mobile performance strategy

Desktop receives the pinned cinematic sequence. Mobile keeps the same content but simplifies the sequence into scroll-scrubbed cards and normal document flow to avoid pinning/jank on small screens. WebGL DPR remains capped, shader complexity remains lightweight, particle counts stay modest, and transforms/opacity are preferred over layout properties.

### Reduced-motion strategy

Reduced-motion users bypass the heavy pinned timelines and receive readable static content with simplified polish. Important text remains DOM text, and decorative canvas layers remain `aria-hidden` with premium CSS fallbacks.

## Phase 1.4 Visual System Final Polish

### Visual audit before this pass

Phase 1.3 had the correct technical ingredients, but the page still felt weaker than the target product-site benchmark because too much of the visual language depended on blur, translucent rectangles, and fade/translate motion. The cinematic chapter copy behaved like article cards instead of a product command interface, the ecosystem cards lacked a strong product-surface hierarchy, and the menu overlay was functional but not yet a polished major-brand navigation surface.

The main issues found were:

- Readable panels and cards used blur as a transition mechanic, which made some text feel like a softened screenshot instead of crisp UI.
- The first cinematic text area had large type but not enough interface structure, status, metadata, or signal language.
- The ecosystem cards were informative but too close to generic dark landing-page cards.
- Motion variety leaned heavily on fade and vertical movement; it needed clip-path reveal, line draw, perspective, progress, and product-surface parallax.
- Mobile inherited the content but needed sharper stacked command panels so it would not feel like a blog feed.
- The menu overlay had accessibility behavior but needed a richer ecosystem panel, staggered link reveal, and non-blur entrance motion.
- The shader background was useful ambience, but the surrounding surfaces needed stronger contrast so WebGL did not muddy the hierarchy.

### Blur reduction strategy

Phase 1.4 removes blur from readable animation states and explicitly forces cinematic chapters, cinematic product cards, launch panels, and depth cards to stay sharp. Blur remains only as controlled atmospheric backdrop treatment on the navigation/menu shell and page ambience. Chapter exits now use clip-path, scale, opacity, and Y movement rather than text/card blur.

### Product-surface cinematic redesign

The pinned cinematic section is now treated as a DLavie command sequence. Each chapter includes a number, short label, status chip, title, body copy, metadata row, and signal-line indicator. The cards now behave like compact product modules for Commerce OS, DLavie AI, Account Graph, Automation Fabric, and Admin Cockpit, each with glyphs, status chips, product copy, and technical metadata.

### New animation types added

The final polish pass adds or strengthens:

- Scroll-scrubbed clip-path reveals for chapters, product cards, and the launch panel.
- A numeric section progress rail that expands through the pinned sequence.
- Chapter signal-line expansion tied to scroll progress.
- Perspective card depth, rotation, and stack movement without blur.
- SplitText character reveal using Y and rotateX movement instead of softening.
- Menu overlay stagger for links, metrics, and featured panel content.
- CTA and product-card shine/highlight behavior through CSS pseudo-elements.
- Background grid drift tied to scroll progress and velocity.

### Mobile polish strategy

Mobile avoids the desktop pinning cost but keeps premium structure: chapters become stacked command panels, cards remain crisp product modules, metadata is preserved, and scroll-scrubbed clip-path/transform motion gives the section a product-interface feel without desktop jank.

### Desktop polish strategy

Desktop keeps the long pinned sequence and makes it feel more cinematic by combining the Cubic Core/WebGL stage, chapter transitions, line draw, card depth stack, progress rail, and launch panel into one scroll-controlled product deck. The shader and grid support depth, while the foreground panels carry the readable hierarchy.

### Navigation and menu polish

The top navigation remains a glass/solid hybrid with active section state, premium CTA shine, and accessible hamburger behavior. The expanded menu now reads as an ecosystem map with numbered links, descriptions, a featured DLavie Commerce + AI panel, badges, staggered entrance, Escape close, outside-click close, and link-close behavior.

### Accessibility and performance notes

Important content remains DOM text, decorative WebGL remains non-essential, and the menu continues to expose dialog semantics and keyboard close behavior. The polish avoids new dependencies, avoids layout-thrashing animation properties, keeps readable text sharp, respects reduced motion by skipping heavy timelines, and preserves capped WebGL rendering from earlier phases.

### Remaining later-phase work

Later phases can expand the brand asset system, product-specific iconography, final illustration assets, and deeper QA screenshots across devices. This pass focuses on homepage visual craft, command-surface structure, blur reduction, and interaction quality while preserving the existing PR architecture.
