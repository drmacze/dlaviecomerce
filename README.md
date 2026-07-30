# DLavie Platform

DLavie is a production-oriented platform composed of a commerce API, a Next.js storefront, reusable interface packages, and optional AI services.

The commerce implementation in this repository uses real PostgreSQL persistence and a real Midtrans Snap integration. It does not ship with demo products, seeded customers, fake transactions, mocked payment success, or hard-coded catalog data.

## Repository layout

```text
.
├── src/                         # Fastify platform API
│   ├── commerce/                # payment, validation, token, and idempotency logic
│   ├── middleware/              # rate limiting and access control
│   └── routes/                  # catalog, cart, checkout, admin, webhook, and AI routes
├── lib/db/                      # PostgreSQL connection, Drizzle schema, and SQL migrations
├── apps/www/                    # Next.js storefront and DLavie website
├── packages/                    # shared packages such as animations
├── tests/                       # API and commerce unit tests
└── .github/workflows/           # code and migration verification
```

GitHub stores the application code and immutable migration history. Product, customer, order, payment, and inventory records must live in PostgreSQL. Git is not a transactional database and must never contain production customer or payment data.

## Commerce capabilities

- Categories, products, product images, variants, SKU, pricing, and physical/digital product support.
- Inventory with on-hand and reserved quantities plus an immutable movement audit trail.
- Persistent anonymous carts secured with opaque tokens stored as SHA-256 hashes.
- Server-side pricing and availability checks. Browser-submitted prices are never trusted.
- Atomic checkout with cart claiming, order snapshots, inventory reservation, and idempotency keys.
- Configurable shipping methods with flat-rate and free-shipping thresholds.
- Midtrans Snap transaction creation using the server key only on the API.
- Signed and idempotent Midtrans webhook processing.
- Conservative payment handling: ambiguous events become `requires_review` instead of being forced to success.
- Admin-only catalog, inventory, shipping, order listing, and order transition endpoints.
- Feature flags that let commerce run independently from the optional Supabase-backed AI module.
- Liveness and PostgreSQL readiness endpoints.

## Prerequisites

- Node.js 20 or newer.
- pnpm 10.28.2 through Corepack.
- PostgreSQL 15 or newer. PostgreSQL 17 is used in CI.
- A production Midtrans account before enabling live payments.

## Local setup

```bash
corepack enable
corepack prepare pnpm@10.28.2 --activate
pnpm install --frozen-lockfile
cp .env.example .env
```

Create a PostgreSQL database and configure at minimum:

```dotenv
ENABLE_COMMERCE=true
ENABLE_PAYMENTS=false
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE
DATABASE_SSL_MODE=disable
ADMIN_API_KEY=generate-at-least-32-random-characters
CORS_ORIGINS=http://localhost:3000
API_BASE_URL=http://localhost:8787
STOREFRONT_URL=http://localhost:3000
```

Apply committed migrations:

```bash
pnpm db:migrate
```

The migration runner:

- obtains a PostgreSQL advisory lock;
- verifies each migration by SHA-256 checksum;
- executes each pending migration inside a transaction;
- records applied migrations in `dlavie_migrations.schema_migrations`;
- refuses to continue if an already-applied migration was modified.

Start the API:

```bash
pnpm dev
```

Check the service:

```text
GET http://localhost:8787/health/live
GET http://localhost:8787/health/ready
```

## Feature flags

Features are disabled by default in application code and must be enabled explicitly.

| Variable | Purpose |
| --- | --- |
| `ENABLE_COMMERCE` | Loads catalog, cart, checkout, order, admin, and database modules. |
| `ENABLE_PAYMENTS` | Enables Midtrans checkout and webhook endpoints. Requires commerce. |
| `ENABLE_AI` | Loads Supabase authentication, chat, model, conversation, and knowledge routes. |

This design prevents a commerce-only deployment from loading or requiring Supabase credentials.

## Catalog administration

Commerce does not create default products or shipping methods. Create real records through the admin API using the `X-Admin-Api-Key` header.

Recommended activation sequence:

1. Create a category when the product needs one.
2. Create the product with `status: "draft"`.
3. Add at least one real variant and SKU.
4. Add a real HTTPS product image.
5. Adjust the real inventory quantity.
6. Create a shipping method for physical products.
7. Change the product status to `active`.

The API rejects product activation when no active variant or image exists.

### Main admin endpoints

```text
POST  /v1/admin/commerce/categories
PATCH /v1/admin/commerce/categories/:categoryId
POST  /v1/admin/commerce/products
PATCH /v1/admin/commerce/products/:productId
POST  /v1/admin/commerce/products/:productId/variants
PATCH /v1/admin/commerce/variants/:variantId
POST  /v1/admin/commerce/products/:productId/images
POST  /v1/admin/commerce/shipping-methods
PATCH /v1/admin/commerce/shipping-methods/:methodId
POST  /v1/admin/commerce/inventory/:variantId/adjustments
GET   /v1/admin/commerce/orders
PATCH /v1/admin/commerce/orders/:orderId/status
```

`ADMIN_API_KEY` is intended for trusted server-side administration. It must never be embedded in the storefront, mobile application, analytics, logs, or browser storage.

## Customer flow

### 1. Create a cart

```text
POST /v1/carts
```

The response contains a cart ID and an opaque cart token. Store the token securely on the client. The database stores only its hash.

### 2. Add or update an item

```text
PUT /v1/carts/:cartId/items/:variantId
X-Cart-Token: CART_TOKEN
Content-Type: application/json

{"quantity": 1}
```

The API reads price, product status, SKU, and stock from PostgreSQL. It rejects unavailable or insufficient inventory.

### 3. Checkout

```text
POST /v1/checkout/:cartId
X-Cart-Token: CART_TOKEN
Idempotency-Key: HIGH_ENTROPY_TOKEN_AT_LEAST_32_CHARACTERS
Content-Type: application/json
```

The same idempotency key safely returns the existing order when a client retries after a timeout. It also acts as the initial order access token and must be handled as a secret.

For physical products, checkout requires a valid active shipping method and a shipping address. Digital-only carts reject unnecessary shipping data.

### 4. Read an order

```text
GET /v1/orders/:orderNumber
X-Order-Token: ORIGINAL_IDEMPOTENCY_KEY
```

Order responses are marked `Cache-Control: no-store`.

## Midtrans configuration

Keep payments disabled until all real credentials and callback routing are ready:

```dotenv
ENABLE_PAYMENTS=true
MIDTRANS_SERVER_KEY=real-server-key-from-midtrans
MIDTRANS_IS_PRODUCTION=false
PAYMENT_EXPIRY_MINUTES=60
```

Configure the Midtrans HTTP notification URL as:

```text
https://api.example.com/v1/webhooks/midtrans
```

The webhook handler validates:

- the Midtrans SHA-512 signature;
- provider order ID;
- gross amount against the persisted order total;
- duplicate events through a deterministic event fingerprint;
- terminal inventory processing through a payment row lock and timestamp.

For a production deployment, the environment validator requires HTTPS URLs and `MIDTRANS_IS_PRODUCTION=true` when payments are enabled.

## Payment and stock lifecycle

1. Checkout marks the cart converted and reserves stock atomically.
2. Midtrans `settlement` or an accepted `capture` finalizes payment.
3. Finalization decreases both on-hand and reserved stock exactly once.
4. Failed, expired, or cancelled pending payments release reserved stock exactly once.
5. Reversals after a paid state are not silently accepted; they enter `requires_review`.
6. Refund notifications update financial status but do not automatically restock goods. Returns and restocking require an explicit operational decision and inventory adjustment.

## Environment safety

Production startup fails when:

- commerce is enabled without `DATABASE_URL` or a strong `ADMIN_API_KEY`;
- payments are enabled without a Midtrans server key;
- payments are enabled while commerce is disabled;
- public URLs are not HTTPS;
- CORS contains a wildcard;
- live payments are enabled with the sandbox mode flag;
- AI is enabled without its required Supabase and provider credentials.

Sensitive request headers are redacted from Pino logs.

## Quality checks

Run the same checks used by CI:

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm --filter @dlavie/www typecheck
```

GitHub Actions also starts a clean PostgreSQL service, applies all migrations twice, and verifies that every expected commerce table exists.

## Production release checklist

Do not publish solely because the application starts locally. Confirm all of the following:

- Every GitHub Actions job is green on the release commit.
- Database backup, point-in-time recovery, connection limits, and TLS are enabled.
- Migrations have been tested against a staging copy before production.
- Midtrans sandbox scenarios for success, pending, expiration, denial, duplicate webhook, and delayed webhook have passed.
- A reconciliation procedure exists for `requires_review` payments.
- Product images use an owned HTTPS storage domain and have accurate alt text.
- Real products, SKU, stock, prices, shipping rules, legal pages, and customer support details are entered by authorized operators.
- CORS lists only the actual storefront and admin origins.
- Admin and database secrets are stored in the deployment secret manager.
- Rate limits and trusted proxy settings match the hosting topology.
- Monitoring alerts cover API errors, readiness failures, payment review states, and low inventory.
- A rollback plan exists for both application code and database changes.

## Security reporting

Do not open a public issue containing credentials, customer data, payment payloads, or exploitable details. Rotate any exposed key immediately and use a private security channel for disclosure.

## Current delivery status

The commerce backend is being reviewed in a dedicated pull request. It must remain unmerged until code quality checks, PostgreSQL migration tests, and security review pass. The production storefront and visual admin console should consume these real APIs after the backend contract is stable.
