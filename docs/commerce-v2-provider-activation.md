# DLavie Commerce v2 — Provider Activation Runbook

This runbook activates Digiflazz catalog and fulfillment with Midtrans payments without placing credentials in source control, issue comments, screenshots, or chat messages.

## Safety boundary

The application code is provider-ready only after all CI gates pass. Provider activation is a separate operational step and must begin in sandbox/testing mode.

- Midtrans sandbox must be paired with `DIGIFLAZZ_TESTING=true`.
- Midtrans production must be paired with `DIGIFLAZZ_TESTING=false`.
- Mixed provider environments are blocked by the Commerce v2 checkout.
- The production storefront root must not be switched to v2 until the sandbox journey succeeds end to end.
- Never reuse an admin key, database password, provider key, or session secret across environments.

## Required backend environment variables

Set these directly in the deployment platform or secret manager. Do not store their values in Git.

```env
ENABLE_COMMERCE=true
DATABASE_URL=<secret>
DATABASE_SSL_MODE=require
ADMIN_API_KEY=<random-secret-at-least-32-characters>
COMMERCE_SESSION_SECRET=<random-secret-at-least-32-characters>
STOREFRONT_URL=https://<storefront-host>

ENABLE_DIGIFLAZZ=true
DIGIFLAZZ_USERNAME=<secret>
DIGIFLAZZ_API_KEY=<secret>
DIGIFLAZZ_BASE_URL=https://api.digiflazz.com
DIGIFLAZZ_TESTING=true

ENABLE_PAYMENTS=true
MIDTRANS_SERVER_KEY=<sandbox-secret>
MIDTRANS_IS_PRODUCTION=false
```

The storefront deployment also needs its existing commerce backend URL and the same `COMMERCE_SESSION_SECRET` used to encrypt browser commerce sessions.

## Callback and protected endpoints

Replace `<api-host>` with the public Commerce API hostname.

| Purpose | Endpoint |
| --- | --- |
| Midtrans notification/webhook | `https://<api-host>/v2/webhooks/midtrans` |
| Readiness inspection | `GET https://<api-host>/v2/admin/commerce/readiness` |
| Digiflazz catalog sync | `POST https://<api-host>/v1/admin/commerce/providers/digiflazz/sync` |
| Due fulfillment reconciliation | `POST https://<api-host>/v2/admin/commerce/fulfillments/process-due` |
| Manual order fulfillment retry | `POST https://<api-host>/v2/admin/commerce/orders/<order-number>/fulfillments/retry` |

All admin endpoints require `X-Admin-Api-Key`. Do not expose this header to browsers or public clients.

## Activation sequence

1. Apply all database migrations, including the Commerce v2 target and fulfillment tables.
2. Deploy the API and storefront with payments still disabled.
3. Configure Digiflazz testing credentials and Midtrans sandbox credentials in the deployment platform.
4. Configure the Midtrans notification URL to `/v2/webhooks/midtrans` on the public API host.
5. Enable Digiflazz and payments with the sandbox flags shown above.
6. Call `/v2/admin/commerce/readiness`. Continue only when `readyForSandbox` is `true` and `blockers` is empty.
7. Synchronize a small prepaid catalog first. Review product names, provider SKUs, cost, selling price, and active state before increasing the sync limit.
8. Open `/v2`, choose a low-risk test product, enter a provider-approved test destination, and add it to the cart.
9. Complete `/v2/checkout` with a Midtrans sandbox payment method.
10. Verify that the signed Midtrans webhook changes the order from `pending_payment` to `processing`.
11. Verify that one fulfillment row exists per order item and that retry attempts retain the same provider reference.
12. Confirm that the order page shows `completed` and displays the provider serial/token when Digiflazz reports success.
13. Test an expired payment, a rejected payment, a provider-pending response, a retry, and a refund of an undelivered item.
14. Keep sandbox active until all cases pass and operational staff can use the reconciliation endpoints.

## Production switch checklist

Production mode is allowed only after the complete sandbox checklist passes.

- Rotate from sandbox/testing credentials to dedicated production credentials.
- Set `MIDTRANS_IS_PRODUCTION=true` and `DIGIFLAZZ_TESTING=false` together in one controlled deployment.
- Re-run `/v2/admin/commerce/readiness` and require `readyForProduction=true`.
- Synchronize a limited production catalog and verify pricing before opening traffic.
- Perform one controlled low-value production transaction.
- Confirm payment signature, inventory movement, fulfillment reference, serial number, and order status.
- Observe logs and reconciliation queues before routing the storefront root to Commerce v2.

## Rollback

If payment or fulfillment behaves unexpectedly:

1. Set `ENABLE_PAYMENTS=false` to stop new paid checkouts.
2. Leave the API and database online so existing order pages and reconciliation remain available.
3. Do not delete payment events, fulfillment events, or provider references.
4. Resolve pending provider transactions using the same provider reference; never create a replacement reference for a retry.
5. Keep the legacy storefront available until v2 post-launch verification is complete.
