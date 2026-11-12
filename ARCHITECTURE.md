# Architecture

Cloudflare Worker serves static assets and same-origin APIs. D1 persists users, sessions, products, demand signals, offers, feedback, alerts, recommendations, timeline events, orders, webhook IDs, audit records, verification tokens, and rate counters. Browser views load persisted records. The current similarity grouping uses a title match. Quality recommendations based on submitted reports require human review.

Development email verification logs a single-use URL only on localhost when `DEV_VERIFICATION_DELIVERY=log`. Tokens are SHA-256 hashed in D1 and expire after 30 minutes. Account registration and address changes require verification before payment. No real email delivery provider is configured.

PayPal uses Sandbox only. Offer price comes from D1. Buyer approval returns to a route that reconciles with PayPal. Capture requires a PayPal-approved order and server-verified amount, with a stable idempotency key and guarded local state. Uncertain captures remain `UNKNOWN` for reconciliation. Webhook signature verification and deduplication are present but have not been tested against real events.
