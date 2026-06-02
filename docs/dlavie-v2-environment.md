# Dlavie v2 Environment

Required variables:

- NEXT_PUBLIC_SITE_URL
- AUTH0_DOMAIN
- AUTH0_CLIENT_ID
- AUTH0_CLIENT_SECRET
- AUTH0_SECRET
- APP_BASE_URL
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
- SUPABASE_SERVICE_ROLE_KEY
- MONGODB_URI
- MONGODB_DB

Rules:

- Service role keys stay server-only.
- MongoDB credentials stay server-only.
- Auth0 secrets stay server-only.
- Public browser variables must use the NEXT_PUBLIC prefix intentionally.
