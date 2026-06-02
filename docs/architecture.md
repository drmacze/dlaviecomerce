# Dlavie Architecture Notes

The Dlavie parent website is a Next.js app under `apps/www`. Phase 1.2 adds a shared `@dlavie/animations` workspace package that owns GSAP registration, Lenis synchronization, motion tokens, and data-attribute effects.

The homepage remains server-rendered at the page level while motion/WebGL components are client-only islands. This keeps content readable and crawlable while allowing premium interaction layers to hydrate progressively.
