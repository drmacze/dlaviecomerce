# DLavie Commerce v2

## Product boundary

DLavie is a focused digital-commerce product.

- Product catalog and fulfillment source: Digiflazz.
- Payment gateway: Midtrans.
- Authentication and customer sessions: Supabase Auth.
- Transactional database: Neon PostgreSQL through Drizzle ORM.
- No AI workspace, operating-system story, automation product, or unrelated platform narrative.

## Rebuild strategy

The current application remains available while v2 is built in parallel. Production is only switched after the v2 acceptance gates pass. The old implementation remains a rollback target until post-launch verification is complete.

## Architecture

### Storefront

- Next.js App Router and React Server Components by default.
- CSS Modules with a small token layer; no legacy global CSS dependency.
- Server-rendered catalog pages with deliberate loading, empty, and error states.
- Progressive enhancement for cart and checkout interactions.
- Indonesian and English copy rendered on the server.
- Accessible keyboard navigation, visible focus states, semantic landmarks, and reduced-motion support.

### Commerce API

- Fastify with explicit route modules and Zod validation at every boundary.
- Domain services separated from HTTP handlers.
- Idempotency for checkout, payment callbacks, and provider fulfillment.
- Structured logging with secret and token redaction.
- Rate limits by route risk level.
- Stable v2 response contracts; v1 remains available during migration.

### Data and integrations

- Neon PostgreSQL remains the source of truth for products, carts, orders, payments, and provider attempts.
- Digiflazz credentials remain server-only. Catalog sync and fulfillment are separate operations.
- Midtrans server key remains server-only. Webhooks are signature-verified and idempotent.
- Supabase Auth identifies customers; order access also supports scoped order tokens where appropriate.

## Delivery gates

### Gate 1 — foundation

- Isolated `/v2` storefront shell.
- New design tokens and responsive layout.
- Real catalog data only; no fabricated products or prices.
- Empty and unavailable states that still look intentional.
- CI: format, lint, typecheck, tests, and production build.

### Gate 2 — catalog

- Category browsing, search, product detail, and target-number input.
- Provider-aware product metadata and validation.
- Product images or deterministic category artwork generated locally from brand assets.
- Catalog sync observability and admin status.

### Gate 3 — transaction

- Cart and checkout rebuilt against stable v2 contracts.
- Midtrans sandbox payment flow.
- Signed and idempotent payment webhook processing.
- Digiflazz fulfillment after confirmed payment.
- Retry, reconciliation, and clear customer-facing order states.

### Gate 4 — production cutover

- Mobile and desktop visual QA.
- Accessibility and performance budgets.
- Sandbox end-to-end transaction tests.
- Production environment validation without exposing credentials.
- Switch root traffic to v2, observe, then remove legacy UI after the rollback window.

## Non-negotiable acceptance criteria

- No secret in client bundles, logs, screenshots, or repository files.
- No payment or fulfillment action without idempotency protection.
- No fake catalog fallback when Digiflazz or the database is unavailable.
- No production cutover based only on HTTP 200; layout and critical journeys must be visually verified.
- Payments remain disabled until sandbox checkout, webhook verification, fulfillment, and reconciliation pass.
