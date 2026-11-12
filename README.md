# PayPal GENESIS

**Products shaped by the people who use them.**

PayPal GENESIS is a full-stack consumer-to-manufacturer product lifecycle application built on Cloudflare Workers, Cloudflare D1, structured Gemini specification analysis, and PayPal Sandbox Orders v2.

> **Disclaimer:** PayPal GENESIS is an independent hackathon prototype and is not operated or endorsed by PayPal. All payments run exclusively in **PayPal Sandbox**.

---

## Problem Being Solved

Consumers routinely have unmet product needs or recurring issues with existing products, while manufacturers lack a structured, trustworthy signal linking real consumer demand, editable product requirements, post-launch feedback, and verified payment commitments.

## Core Workflows

### Consumer Workflow
1. **Register, Verify & Sign In:** PBKDF2-SHA256 salted password hashing, `HttpOnly; Secure; SameSite=Strict` sessions, and single-use SHA-256 expiring email verification tokens.
2. **I want a product that doesn't exist:** Guided 4-step wizard with `sessionStorage` draft persistence, inline validation, and optional AI requirement generation.
3. **Product Requirements (AI + Human Editing):** Generates structured requirements, open questions, assumptions, and complexity on the server, then lets the creator edit and persist specifications to D1.
4. **Explore & Support:** Browse requests, search/filter by lifecycle stage, and record nonbinding interest (`I'm interested` / `I might buy this`).
5. **Something I bought needs improvement:** Guided 4-step problem reporting wizard that feeds manufacturer quality queues and generates review alerts on safety reports or 3+ matching reports.
6. **Track & Checkout:** Verified consumers can purchase eligible non-DEMO manufacturer offers through PayPal Sandbox with server-side capture and reconciliation.

### Manufacturer Workflow
1. **Onboarding & Role Separation:** Verified consumers apply via **Account & Role** (`POST /api/manufacturer/application`); an administrator approves upgrades server-side (`POST /api/admin/manufacturers`).
2. **Find products people want:** Browse consumer demand sorted by supporter interest and inspect creator specifications.
3. **Offer to manufacture a product:** Guided 3-step offer wizard (pricing, minimum order quantity, terms, and Sandbox checkout eligibility on non-DEMO, non-retired products).
4. **Update Production Stages:** Advance products step-by-step (`idea → validation → manufacturer_interest → prototype → testing → launch → improvement / retirement`) with milestone notes.
5. **See problems customers are reporting:** Review feedback and quality alerts and record human improvement decisions (`investigating`, `accepted`, `paused`, `retired`, `rejected`).
6. **Manage Products & Orders:** View PayPal Sandbox orders tied to the manufacturer's offers without exposing buyer personal details.

---

## AG Studio & AG Grid Implementation (Sponsor Category)

GENESIS integrates **AG Studio v3.1** and **AG Grid v36** inside the manufacturer analytics command center at `#/manufacturer/intelligence`:

- **Embedded Analytics Framework:** Native AG Studio instance rendered with a bespoke dark theme matching the GENESIS design system (`--bg: #090d16`, `--surface: #121a2b`, `--blue: #0070ba`, `--blue-bright: #3898ff`).
- **Section A (Demand Overview):** 4 real-time KPI cards tracking Product Requests, Customer Interest, Open Opportunities, and Active Offers from Cloudflare D1.
- **Section B (Demand Explorer):** Interactive AG Grid with live sorting, filtering, row selection, contextual actions, and CSV export.
- **Section C & D (Demand & Stage Analytics):** Category distribution and stage progression analytics cross-filtered to the active manufacturer context.
- **Section E (PayPal Sandbox Transactions):** Authorized Sandbox payments table and captured volume breakdown by currency, strictly isolated per manufacturer.
- **Custom AG Studio Widgets:**
  1. **Opportunity Spotlight:** Live SVG-styled card inspecting the selected product, consumer intended use, demand count, and next authorized manufacturer action.
  2. **GENESIS Intelligence Brief:** Displays saved AI-assisted engineering specifications (key requirements, open questions, complexity) with direct navigation to the editable specification form.
  3. **Product Health & Field Reports:** Aggregates consumer quality signals, defect categories, and human quality decisions.
- **Dashboard Customization:** Self-service View/Edit mode toggle, drag-and-drop layout customization, `localStorage` persistence, and one-click layout reset.
- **Ask GENESIS Intelligence:** Grounded natural-language query interface powered by server-side `gemini-3.8-flash` restricted strictly to authorized analytical data.

---

## AI & PayPal Integrations

- **Structured Specification Intelligence (`src/gemini.js`, `POST /api/analyze`):** Uses server-side `GEMINI_API_KEY` and `GEMINI_MODEL` (`gemini-3.8-flash`) with `generationConfig.responseSchema` (`OBJECT` with `title`, `requirements`, `questions`, `assumptions`, `complexity`). Outputs are preliminary, user-editable, and explicitly marked unverified for engineering feasibility.
- **PayPal Sandbox Orders v2 (`src/worker.js`):** Server-side OAuth (`client_credentials`), order creation (`intent: CAPTURE`) with `experience_context` return/cancel URLs, buyer approval redirect to `https://www.sandbox.paypal.com/checkoutnow`, server-side capture with `PayPal-Request-Id` idempotency, amount/currency verification, reconciliation, cancellation, and signed webhook handling (`POST /api/paypal/webhook`).

---

## Architecture

- **Frontend (`public/`):** Vanilla ES module SPA (`index.html`, `app.js`, `style.css`) with hash routing (`#/home`, `#/explore`, `#/product/:id`, `#/my-products`, `#/orders`, `#/request`, `#/report`, `#/account`, `#/help`, `#/manufacturer/*`, `#/admin`).
- **Backend (`src/worker.js`, `src/gemini.js`):** Single Cloudflare Worker serving static assets and `/api/*` JSON routes backed by Cloudflare D1 (`migrations/0001_init.sql` – `0005_repairs.sql`).

---

## Local Setup & Database Migrations

### Prerequisites
- Node.js 22+ (`v25.6.0` verified)
- npm

### Installation & Migration
```sh
cd /Users/shyamlraj/Downloads/PPGEN/paypal-genesis
npm install
npm run db:migrate
```

### Configuration (`.dev.vars`)
Copy `.env.example` to `.dev.vars` (never commit `.dev.vars`) and populate values locally:

```text
DEV_VERIFICATION_DELIVERY=log
GEMINI_API_KEY=
GEMINI_MODEL=gemini-3.8-flash
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_WEBHOOK_ID=
```

### Run Locally
```sh
npm run dev -- --ip 127.0.0.1 --port 8787
```

Open `http://127.0.0.1:8787/` in Chrome. On localhost with `DEV_VERIFICATION_DELIVERY=log`, email verification links print to the Wrangler terminal log.

---

## Testing

```sh
# Automated unit, schema, worker-flow, and webhook tests (18 tests)
npm test

# Live Gemini & PayPal Sandbox OAuth preflight
node scripts/check-external.mjs

# Worker bundle dry-run (does not deploy)
npx wrangler deploy --dry-run --outdir=/tmp/genesis-dry-run && rm -rf /tmp/genesis-dry-run
```

---

## Screenshots

- Consumer Home: [`docs/screenshots/after/01-home-desktop.png`](docs/screenshots/after/01-home-desktop.png)
- Explore & Filters: [`docs/screenshots/after/02-explore-desktop.png`](docs/screenshots/after/02-explore-desktop.png)
- Mobile Home (`390px`): [`docs/screenshots/after/03-home-mobile.png`](docs/screenshots/after/03-home-mobile.png)
- Editable AI Specifications: [`docs/screenshots/after/05-product-spec-persisted.png`](docs/screenshots/after/05-product-spec-persisted.png)
- Manufacturer Home: [`docs/screenshots/after/07-manufacturer-home.png`](docs/screenshots/after/07-manufacturer-home.png)
- Manufacturer Quality & Decisions: [`docs/screenshots/after/09-manufacturer-quality.png`](docs/screenshots/after/09-manufacturer-quality.png)
- PayPal Sandbox Checkout Modal: [`docs/screenshots/after/10-checkout-modal.png`](docs/screenshots/after/10-checkout-modal.png)
- Confirmed Sandbox Order (Manufacturer View): [`docs/screenshots/after/13-manufacturer-orders-completed.png`](docs/screenshots/after/13-manufacturer-orders-completed.png)

---

## Known Limitations

- **Inbound Webhook Delivery:** `POST /api/paypal/webhook` signature verification, deduplication, and state transitions are verified via automated Worker tests, but genuine inbound PayPal webhook delivery requires a public HTTPS endpoint and configured `PAYPAL_WEBHOOK_ID`.
- **Email Delivery:** Development verification logs links locally on `localhost`/`127.0.0.1`; production transactional email requires configuring an external mail provider.
- **Similarity Matching:** Product grouping uses keyword matching on titles, not vector/semantic embeddings.
- **Sandbox Only:** All transactions execute against `https://api-m.sandbox.paypal.com`.

## Official Hackathon Submission

- **Live Application:** [https://genesis.greenmixlabs.com](https://genesis.greenmixlabs.com)
- **Official YouTube Walkthrough:** [https://www.youtube.com/watch?v=ba50shd8ylY](https://www.youtube.com/watch?v=ba50shd8ylY)
- **Creator Credit:** Sam
- **Hackathon:** PayPal AI Hackathon
