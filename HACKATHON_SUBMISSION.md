# PayPal GENESIS — Hackathon Submission

## Project Title
**PayPal GENESIS** — *Products shaped by the people who use them.*

## Short Pitch
GENESIS connects everyday consumers with verified manufacturers in a transparent, end-to-end product lifecycle platform—turning plain-language product ideas into editable engineering specifications via Gemini, aggregating nonbinding community demand and post-launch quality signals, and settling eligible product orders through server-verified PayPal Sandbox checkout.

## Problem Statement
1. **Consumers** frequently wish specialized products existed or struggle with recurring defects in products they own, yet have no structured way to express requirements, measure shared demand, or hold quality feedback visible.
2. **Small and mid-sized manufacturers** face high risk guessing what to build, translating vague customer wishes into specifications, and deciding when to revise or pause a release based on field feedback.

## Solution
PayPal GENESIS provides a role-separated two-sided lifecycle workflow:
- **Consumers** share product ideas in a 4-step guided wizard, optionally convert descriptions into editable product requirements, support existing ideas without purchase commitment, report product issues, and check out on eligible non-DEMO offers via PayPal Sandbox.
- **Approved Manufacturers** discover ranked demand, publish transparent offers (distinguishing preliminary proposals from checkout-enabled offers), advance production stages (`idea` → `validation` → `manufacturer_interest` → `prototype` → `testing` → `launch` → `improvement` / `retirement`), investigate customer reports, and record human quality decisions.

## Target Users
- **Consumers & Creators:** People requesting niche hardware/software-enabled products, backing ideas, and reporting field issues.
- **Independent & Small-Batch Manufacturers:** Verified builders seeking validated demand, clear requirement drafts, and low-friction Sandbox order settlement.

## Key Features
- Guided 4-step **Request a Product** and **Report a Problem** wizards with `sessionStorage` draft preservation and inline validation.
- Editable **Product Requirements Specification** persisted in D1 across browser refreshes.
- Role-separated **Consumer** and **Manufacturer** workspaces with server-enforced onboarding (`manufacturer_applications`) and administrator approval.
- Explicit separation of **DEMO examples**, **preliminary manufacturer proposals**, and **checkout-eligible offers**.
- Complete **PayPal Sandbox Orders v2** checkout lifecycle with server-side capture, reconciliation, duplicate-capture protection, and signed webhook handling.

## How AG Studio / AG Grid Is Genuinely Used (Sponsor Category: Best Use of AG Grid)
- **AG Studio Embedded Framework:** Integrated at `#/manufacturer/intelligence` with `ag-studio@3.1.0` and AG Grid v36 for the manufacturer intelligence command center.
- **Demand Explorer Grid:** Full-featured data grid with sorting, filtering, selection, and CSV export over actual D1 demand records.
- **Custom AG Studio Widgets:**
  1. *Opportunity Spotlight:* Dynamic card revealing the selected product's intended use, stage, and manufacturer action.
  2. *GENESIS Intelligence Brief:* Saved Gemini-assisted technical requirements, open engineering questions, and hardware complexity.
  3. *Product Health:* Defect reports and recorded human engineering decisions.
- **Dashboard Customization:** Self-service View/Edit mode switching, layout persistence via `localStorage`, and reset layout capability.
- **PayPal Sandbox Analytics:** Manufacturer-isolated Sandbox transaction reporting with volume breakdown by currency.
- **Ask GENESIS Intelligence:** Grounded analytical queries answering demand and transaction questions via server-side Gemini 3.8.

## How Gemini Is Genuinely Used
- When a user clicks **Generate requirements** or **Analyze my idea**, `POST /api/analyze` invokes the Google Gemini `generateContent` endpoint (`gemini-3.8-flash`) server-side with `generationConfig.responseMimeType: "application/json"` and a strict `SPECIFICATION_SCHEMA` (`title`, `requirements`, `questions`, `assumptions`, `complexity`).
- Responses are strictly validated in `src/gemini.js`, rendered into an editable specification form without exposing internal model/provider names in the UI, and saved to D1 via `POST /api/products/:id/spec`.
- GENESIS explicitly discloses that generated specifications are preliminary and do not verify technical feasibility, pricing, or demand.

## How PayPal Is Genuinely Used
- **Merchant OAuth & Orders v2 (`src/worker.js`):** Creates Sandbox orders (`intent: CAPTURE`) from D1 offer amounts/currencies (never trusting client prices), redirects verified buyers to `https://www.sandbox.paypal.com/checkoutnow`, and reconciles returns.
- **Server-Side Capture & Idempotency:** Captures only after verifying PayPal order status is `APPROVED` and amount/currency match D1, using an atomic `CAPTURE_PENDING` database claim plus `PayPal-Request-Id` idempotency.
- **Verified Sandbox Completion:** Demonstrated live against PayPal Sandbox (`6E759492BW379094G` captured as `2S438785MA948880G` for `USD 115.00`, status `COMPLETED`).

## Technical Architecture
- **Edge Compute:** Cloudflare Worker (`src/worker.js`, `src/gemini.js`)
- **Persistence:** Cloudflare D1 SQLite (`migrations/0001_init.sql` – `0005_repairs.sql`, 14 tables including `users`, `sessions`, `products`, `support`, `offers`, `feedback`, `alerts`, `recommendations`, `events`, `orders`, `webhook_events`, `audit`, `manufacturer_applications`, `verification_tokens`, `rate_limits`)
- **Frontend:** Responsive Apple-inspired vanilla ES module SPA (`public/index.html`, `public/app.js`, `public/style.css`)

## Security Model
- PBKDF2-SHA256 (150,000 iterations) with per-user random salt.
- `HttpOnly; Secure; SameSite=Strict` session cookies, same-origin CSRF check on all mutations, per-endpoint rate limiting, SHA-256 expiring email verification tokens.
- Server-enforced RBAC (`consumer`, `manufacturer`, `administrator`), buyer payment ownership isolation, parameterized SQL queries, HTML escaping (`esc`), and PayPal webhook signature verification.

## Demonstrated Results
- **18/18** automated unit, schema, D1 isolation, and mocked webhook/capture tests passing (`npm test`).
- **Live Gemini HTTP 200** structured specification generation, editing, and post-refresh persistence verified in Chrome.
- **Live PayPal Sandbox Transaction:** Order `6E759492BW379094G` approved by a separate Sandbox Personal buyer account, captured server-side (`2S438785MA948880G`), confirmed `COMPLETED` on PayPal Sandbox and in D1 (`USD 115.00`).
- **4-Viewport Chrome Verification:** Zero console/page errors and zero horizontal overflow at `1440px`, `1024px`, `768px`, and `390px`.

## Limitations
- Inbound PayPal webhook delivery requires a public HTTPS endpoint (`PAYPAL_WEBHOOK_ID` not yet bound to a live public host).
- Email verification currently logs single-use links locally (`DEV_VERIFICATION_DELIVERY=log`); transactional email delivery is not configured.
- Product similarity grouping uses title keyword matching rather than semantic embeddings.
- Payments run in PayPal Sandbox only.

## Future Roadmap
1. Deploy to an isolated Cloudflare Worker + production D1 instance with transactional email delivery and live HTTPS PayPal webhook registration.
2. Add semantic embedding search for duplicate-idea clustering and richer manufacturer capacity verification.
3. Support milestone-based multi-batch production updates and optional dispute/refund handling via PayPal APIs.

## Live Deployment Status

- **Live URL:** [https://genesis.greenmixlabs.com](https://genesis.greenmixlabs.com)
- **Official Demo Video:** [PayPal_GENESIS_Explainer_Final.mp4](submission/PayPal_GENESIS_Explainer_Final.mp4) (Length: 02:13, 1080p, -16 LUFS, Voice only, Created by Sam)
- **Production Infrastructure:** Cloudflare Worker (`paypal-genesis`), D1 Database (`genesis-prod`), Cloudflare Edge SSL.
- **PayPal Webhook:** Verified HTTPS endpoint `https://genesis.greenmixlabs.com/api/paypal/webhook` with Webhook ID `9V127089DJ527653S`.

## Hackathon Instant Demo Access

- **Public Site:** [https://genesis.greenmixlabs.com](https://genesis.greenmixlabs.com)
- **Zero-Friction Access:** Two prominent one-click demo pathways on the landing screen:
  1. **Continue as Consumer:** Instant 2-hour server session as Demo Consumer to propose ideas, run GENESIS Intelligence, support concepts, and report problems.
  2. **Explore as Manufacturer:** Instant 2-hour server session as Demo Manufacturer to inspect community demand, review quality alerts, update milestone progression, and view Sandbox checkout orders.
- **Data Isolation & Safety:** Demo users operate on isolated sample records; administrator access, real customer credentials, and live PayPal capture are strictly prevented.

- **Official YouTube Demo:** [https://www.youtube.com/watch?v=D4zczmATPa8](https://www.youtube.com/watch?v=D4zczmATPa8)
- **Channel:** GreenmixLabs
- **Visibility:** Public
