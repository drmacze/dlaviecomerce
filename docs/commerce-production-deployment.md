# DLavie Commerce Production Deployment

This runbook defines the supported production topology and release sequence. It does not create sample products, seed orders, or synthetic payment records.

## Supported topology

- **Storefront and admin UI:** Next.js from `apps/www`, deployed to Vercel.
- **Commerce API:** Fastify from the repository root, deployed from `Dockerfile.api` to a container platform.
- **Primary data:** managed PostgreSQL with backups and point-in-time recovery enabled.
- **Operator identity:** Supabase Auth plus `profiles.role = 'admin'`.
- **Payments:** Midtrans Snap with server-side credentials and a public HTTPS webhook.

The storefront must call the API through `COMMERCE_API_URL`. Do not expose PostgreSQL, Supabase service-role, Midtrans server, admin automation, or session encryption secrets to browser variables.

## Required services

1. A managed PostgreSQL database dedicated to the intended environment.
2. A container service that supports HTTPS, health checks, secret injection, and rolling deploys.
3. An active Supabase project for operator authentication.
4. A Vercel project rooted at this repository and building `apps/www`.
5. A Midtrans sandbox account for staging. Production credentials are added only after staging acceptance.

## API container

Build locally or in the deployment platform:

```bash
docker build -f Dockerfile.api -t dlavie-commerce-api:release .
```

Run migrations as a one-off release command before starting or promoting application replicas:

```bash
docker run --rm \
  --env-file /secure/path/api.env \
  dlavie-commerce-api:release \
  node lib/db/scripts/migrate.mjs
```

Start the API:

```bash
docker run --rm \
  --env-file /secure/path/api.env \
  -p 8787:8787 \
  dlavie-commerce-api:release
```

The container runs as a non-root user, responds to `SIGTERM`/`SIGINT`, closes Fastify and the PostgreSQL pool gracefully, and exposes `/health/live` and `/health/ready`.

Do not configure every replica to run migrations during startup. Run the migration command once per release. The migration runner uses a PostgreSQL advisory lock, checksums, and transactions, but a separate release step provides clearer failure and rollback control.

## API environment

Start from `.env.example`. Production minimum for commerce without payments:

```dotenv
NODE_ENV=production
PORT=8787
APP_NAME=DLavie Platform API
API_BASE_URL=https://api.example.com
STOREFRONT_URL=https://shop.example.com
CORS_ORIGINS=https://shop.example.com
TRUST_PROXY=true

ENABLE_COMMERCE=true
ENABLE_PAYMENTS=false
ENABLE_AI=false

DATABASE_URL=postgresql://...
DATABASE_POOL_MAX=10
DATABASE_SSL_MODE=verify-full
ADMIN_API_KEY=<random-server-only-secret>

ORDER_PREFIX=DLV
CART_TTL_DAYS=14
CHECKOUT_RATE_LIMIT_MAX=10
LOG_LEVEL=info
```

For dashboard operator login, also configure:

```dotenv
SUPABASE_URL=https://project.supabase.co
SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

`SUPABASE_SERVICE_ROLE_KEY` remains only in the API service. The API uses it to read the operator profile role after validating the user's bearer token.

For Midtrans sandbox:

```dotenv
ENABLE_PAYMENTS=true
MIDTRANS_SERVER_KEY=<sandbox-server-key>
MIDTRANS_IS_PRODUCTION=false
PAYMENT_EXPIRY_MINUTES=60
```

Switch `MIDTRANS_IS_PRODUCTION=true` only during a separately approved production payment release.

## Storefront environment

Configure these server-side Vercel variables:

```dotenv
COMMERCE_API_URL=https://api.example.com
COMMERCE_SESSION_SECRET=<unique-random-secret-at-least-32-characters>
ADMIN_SESSION_SECRET=<different-unique-random-secret-at-least-32-characters>
SUPABASE_URL=https://project.supabase.co
SUPABASE_ANON_KEY=<anon-key>
```

Generate independent secrets for each environment. Rotating either session secret intentionally invalidates the corresponding active browser sessions.

## Supabase operator setup

1. Activate or create the intended Supabase environment.
2. Apply the existing profile/auth migrations required by the platform.
3. Create the operator through Supabase Auth using the real operator email.
4. Set that user's `profiles.role` to `admin`.
5. Confirm a normal authenticated user receives `403` from an admin API route.
6. Confirm the admin user can sign in through `/admin/login`.

Never create a shared demo admin account for production.

## Midtrans webhook

Configure the HTTPS notification URL exposed by the API according to the commerce webhook route. Confirm:

- the server key is stored only in the API secret manager;
- the webhook can reach the API without browser authentication;
- signatures are accepted only when SHA-512 verification succeeds;
- repeated events remain idempotent;
- ambiguous or reversal states become `requires_review`;
- paid stock is finalized once and only once.

## Staging acceptance

Use real staging infrastructure and products explicitly entered by an authorized operator. Complete all checks before production:

1. Readiness fails when PostgreSQL is unavailable and succeeds when it is healthy.
2. A normal Supabase user cannot access admin routes.
3. An admin can create a category, draft product, HTTPS image, SKU, and inventory adjustment.
4. A product cannot be activated before it has an active variant and image.
5. Storefront price and stock exactly match API data.
6. Two competing checkout attempts cannot oversell the same stock.
7. Midtrans sandbox payment creates a webhook-confirmed paid order.
8. Duplicate webhook delivery does not duplicate inventory movement.
9. Expired or failed payments release reservations according to the implemented status flow.
10. The admin can progress a paid order through processing, shipped, and completed.
11. Logs redact authorization, cart, order, idempotency, and admin headers.
12. Backups, restore procedure, alerts, and on-call ownership are documented.

## Release order

1. Back up PostgreSQL or confirm a recent managed backup.
2. Build the immutable API image from the reviewed commit.
3. Run the migration image command once.
4. Deploy the API with `ENABLE_PAYMENTS=false` for the first health verification.
5. Verify `/health/live` and `/health/ready` from outside the platform network.
6. Deploy the Vercel storefront/admin build with the API URL and session secrets.
7. Complete catalog/admin smoke checks.
8. Enable sandbox payments in staging and complete payment acceptance.
9. Promote production credentials only after explicit operational approval.

## Rollback

- Application rollback uses the previous immutable API image and previous Vercel deployment.
- Database migrations are forward-only. Do not edit an applied migration because checksums will reject it.
- Correct a schema problem with a new reviewed migration. Restore from backup only for a declared data-loss incident.
- If payment behavior is uncertain, immediately set `ENABLE_PAYMENTS=false`; do not mark orders paid manually without reconciliation evidence.
- If session encryption secrets are suspected to be exposed, rotate them and accept that active browser sessions will be invalidated.
