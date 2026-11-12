# Deployment Plan — PayPal GENESIS

**Status:** Drafted for review — **DO NOT DEPLOY WITHOUT EXPLICIT USER APPROVAL.**  
**Isolation Guarantee:** GENESIS must use its own dedicated Cloudflare Worker (`paypal-genesis`), dedicated D1 database (`genesis`), and dedicated secrets. Do **not** share D1 bindings, KV/R2 stores, Worker routes, or secrets with **TrustBridge AI**, **Paapom**, or **Greenmix Labs**.

---

## 1. Environment Separation
- Keep `wrangler.jsonc` pointed strictly at a newly created dedicated D1 database ID (`REPLACE_WITH_SEPARATE_D1_DATABASE_ID` replaced only after creating a brand-new `genesis` database).
- Keep PayPal configured on **Sandbox** (`https://api-m.sandbox.paypal.com`) for the hackathon submission. Do not switch to Live PayPal endpoints without separate authorization, legal/privacy workflows, and production security sign-off.
- Do not set `DEV_VERIFICATION_DELIVERY=log` in production; `deliverVerification()` restricts log-based verification strictly to `localhost` and `127.0.0.1` (`src/worker.js:48`). Configure a real email provider before enabling public user registration on a non-local domain.

## 2. Provision Dedicated Cloudflare D1 & Apply Migrations
```sh
cd /Users/shyamlraj/Downloads/PPGEN/paypal-genesis
npx wrangler d1 create genesis
# Update database_id in wrangler.jsonc with the newly created genesis D1 ID
npx wrangler d1 migrations apply genesis --remote
```
Verify all 5 migrations (`0001_init.sql` through `0005_repairs.sql`) applied cleanly.

## 3. Configure Worker Secrets
Set secrets via `wrangler secret put` (never commit secrets into `wrangler.jsonc` or Git):
```sh
npx wrangler secret put GEMINI_API_KEY
npx wrangler secret put GEMINI_MODEL          # e.g. gemini-3.8-flash
npx wrangler secret put PAYPAL_CLIENT_ID      # Sandbox REST app client ID
npx wrangler secret put PAYPAL_CLIENT_SECRET  # Sandbox REST app secret
npx wrangler secret put PAYPAL_WEBHOOK_ID     # Populated after step 4
```

## 4. Deploy Worker & Register PayPal Sandbox Webhook
```sh
npx wrangler deploy --dry-run
# Only after explicit approval:
npx wrangler deploy
```
Then in **PayPal Developer Dashboard** (Sandbox App → Webhooks):
1. Add webhook URL: `https://<your-worker-subdomain>.workers.dev/api/paypal/webhook`
2. Subscribe to events:
   - `CHECKOUT.ORDER.APPROVED`
   - `PAYMENT.CAPTURE.COMPLETED`
   - `PAYMENT.CAPTURE.DENIED`
   - `PAYMENT.CAPTURE.DECLINED`
   - `PAYMENT.CAPTURE.PENDING`
   - `CHECKOUT.ORDER.VOIDED`
3. Copy the generated Webhook ID and set `npx wrangler secret put PAYPAL_WEBHOOK_ID`.

## 5. Post-Deployment Verification
1. `GET https://<host>/api/me` returns `200 {"user":null,"application":null}`.
2. `GET https://<host>/api/products` loads seeded DEMO scenarios (`demo=1`).
3. Verify Gemini specification generation (`POST /api/analyze` authenticated) returns `200`.
4. Verify PayPal Sandbox order creation, buyer approval, capture, and webhook delivery appear in `orders`, `webhook_events`, and `audit`.
5. Confirm `TrustBridge AI`, `Paapom`, and `Greenmix Labs` endpoints and D1 databases remain untouched.

## 6. Rollback Procedure
- View recent deployments: `npx wrangler deployments list`
- Roll back Worker code immediately: `npx wrangler rollback <deployment-id>`
- For D1 schema safety, migrations `0001`–`0005` are additive; do not drop tables on rollback—restore from a pre-deployment D1 Time Travel bookmark (`npx wrangler d1 time-travel restore genesis --timestamp=...`) if data rollback is ever needed.


## Live Deployment Record (2026-11-12)

- **Production Worker:** `paypal-genesis`
- **Public Domain:** `https://genesis.greenmixlabs.com`
- **Zone:** `greenmixlabs.com` (Cloudflare Custom Domain)
- **Database:** Dedicated Cloudflare D1 `genesis-prod` (`300f4290-5648-46c3-9e80-78cd9901e81f`)
- **D1 Migrations:** 0001_init, 0002_phase2, 0003_demo, 0004_checkout, 0005_repairs successfully applied
- **Encrypted Secrets Configured:**
  - `GEMINI_API_KEY`: Production Gemini 3.8 Flash key
  - `GEMINI_MODEL`: `gemini-3.8-flash`
  - `PAYPAL_CLIENT_ID`: Genuine PayPal Sandbox OAuth client ID
  - `PAYPAL_CLIENT_SECRET`: Genuine PayPal Sandbox OAuth secret
  - `PAYPAL_WEBHOOK_ID`: `9V127089DJ527653S` (Registered for `https://genesis.greenmixlabs.com/api/paypal/webhook`)
- **Main Domain Status:** `https://greenmixlabs.com` unaffected, running cleanly.
