# Genuine integration test setup

The local `.dev.vars` is ignored by Git. Add credentials there on the Mac without sending them through chat:

```text
DEV_VERIFICATION_DELIVERY=log
GEMINI_API_KEY=<your-gemini-api-key>
GEMINI_MODEL=<model confirmed by the key's models list>
PAYPAL_CLIENT_ID=<Sandbox merchant REST app client ID>
PAYPAL_CLIENT_SECRET=<Sandbox merchant REST app secret>
PAYPAL_WEBHOOK_ID=<registered Sandbox webhook ID, later>
```

Use **Sandbox** credentials, a separate Sandbox merchant and buyer, and a non-DEMO offer marked eligible. Do not place Live credentials in this file. Restart Wrangler after editing `.dev.vars`. `node scripts/check-external.mjs` performs genuine Gemini model-list/specification calls and PayPal Sandbox OAuth preflight; it prints status and schema counts, never credentials or tokens. It does **not** create an order or claim a purchase.

For the full transaction, the manufacturer role must be approved by an administrator in the local D1 environment, then publish a non-DEMO offer with an immediate fulfillment policy and supported currency. A verified consumer starts checkout and approves in the separate Sandbox buyer account. Observe order creation, return, explicit capture, reconciliation, duplicate capture, and D1 persistence. Keep the exact test amount and order reference privately for audit. The user must perform the buyer approval/payment step in the browser. No public webhook URL should be configured until an HTTPS endpoint is explicitly approved.

Current API review: Google `generateContent` accepts `generationConfig.responseMimeType: application/json`; key authentication uses `x-goog-api-key`. Check the selected model against the key's models list before generation. PayPal Orders v2 uses Sandbox OAuth, create order, buyer approval link, and server-side capture. Return/cancel URLs belong under `payment_source.paypal.experience_context`; the return alone is not proof of capture. Real response compatibility remains unverified until credentials are configured.
