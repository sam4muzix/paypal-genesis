# UX & Functional Bug Audit — PayPal GENESIS

**Project:** `/Users/shyamlraj/Downloads/PPGEN/paypal-genesis`  
**Audit Method:** Full source review (`src/worker.js`, `src/gemini.js`, `public/index.html`, `public/app.js`, `public/style.css`, `migrations/*.sql`) plus live execution against local Cloudflare Worker (`wrangler dev --ip 127.0.0.1 --port 8787`), local D1, and headless Google Chrome for Testing via CDP.

---

## Summary Table

| ID | Severity | Screen / Feature | Status |
| --- | --- | --- | --- |
| P0-1 | P0 | Role & Manufacturer Approval Workflow | Verified fixed |
| P0-2 | P0 | Offer Eligibility on DEMO Products (`POST /api/products/:id/offers`) | Verified fixed |
| P0-3 | P0 | PayPal Order Cancel, Capture Status Verification & Abandoned Order Reuse | Partially verified (create, redirect, cancel verified live; buyer-approved live capture pending Sandbox buyer credentials) |
| P1-1 | P1 | Modal Error Visibility (`auth`, `register`, `verification`, `checkout`, `decision`) | Verified fixed |
| P1-2 | P1 | Client Routing & Refresh Persistence | Verified fixed |
| P1-3 | P1 | Product Intelligence Editing, Re-analysis, Error Handling & JSON Guard | Verified fixed |
| P1-4 | P1 | Short-Title Product Similarity SQL Bug (`LIKE '%%'`) | Verified fixed |
| P1-5 | P1 | Manufacturer Progress Gating, Retired Offers & Offer Eligibility Toggle | Verified fixed |
| P1-6 | P1 | Request Wizard Draft Preservation, Back State & Post-Publish Next Step | Verified fixed |
| P1-7 | P1 | Report Wizard Draft Preservation & Inline Validation | Verified fixed |
| P1-8 | P1 | Checkout Verified-Email Gate & Ineligible Offer Explanation | Verified fixed |
| P1-9 | P1 | Auth Redirect / Resume Intended Action | Verified fixed |
| P1-10 | P1 | Account Management UI (Email Change, Verification Status, Role Application) | Verified fixed |
| P2-1 | P2 | Home Screen Copy, 4 Role-Specific Actions & Above-the-Fold Layout | Verified fixed |
| P2-2 | P2 | Product Detail Duplicate Description, Active Support State & Stage Clarity | Verified fixed |
| P2-3 | P2 | Quality Decision Note Concatenation & Manufacturer Feedback Visibility | Verified fixed |
| P2-4 | P2 | Explore Toolbar Layout, Mobile Hint Wrapping & Apple-Inspired UI Polish | Verified fixed |

---

## Detailed Defect Log

### P0-1: Missing Manufacturer Application & Approval-Status Workflow
- **Screen or feature:** Account / Role Management & Manufacturer Onboarding (`src/worker.js`, `public/app.js`)
- **Exact steps to reproduce:** Sign in as a consumer (`role = 'consumer'`), open Account menu or Help page, and look for how to become a manufacturer or check approval status.
- **Expected behavior:** Clear explanation of manufacturer eligibility, a guided application workflow for verified users, server-side pending/approved/rejected status tracking, and no client-side role escalation.
- **Actual behavior:** No UI or consumer-facing API exists to apply or check approval status; only an administrator-only `POST /api/admin/manufacturers` endpoint exists with no UI.
- **Root cause:** Missing `manufacturer_applications` schema, application endpoints, and Account/Role UI.
- **Severity:** P0
- **Planned correction:** Add migration `0005_manufacturer_applications.sql`, add `GET/POST /api/manufacturer/application` (verified email required, server-enforced `pending` state) and `GET /api/admin/manufacturers`, and add Account Management UI showing eligibility rules, application form, and live approval status.
- **Verification result:** Verified fixed in `npm test` (17/17) and live Chrome E2E validation (`#modalNotice`, hash routing, editable AI spec + reload, short-title grouping, offer/transition gating, guided wizards, account & role flows, responsive desktop/mobile).

### P0-2: API Allows `eligible: true` Offers on DEMO Products
- **Screen or feature:** `POST /api/products/:id/offers` (`src/worker.js:39`)
- **Exact steps to reproduce:** As an authenticated manufacturer, send `POST /api/products/demo-a1/offers` with `{"price":50,"currency":"USD","minimum_quantity":1,"terms":"Test","eligible":true}`.
- **Expected behavior:** Server rejects checkout-eligible offers on DEMO products (`400`).
- **Actual behavior:** Backend inserts `eligible = 1` into `offers` for `demo-a1` (only the frontend checkbox is disabled).
- **Root cause:** Missing server-side check on `product.demo` and `product.id.startsWith('demo-')` in `POST /api/products/:id/offers`.
- **Severity:** P0
- **Planned correction:** Reject `eligible === true` on `product.demo` / `demo-*` products and reject new offers on `retirement` products on the server.
- **Verification result:** Verified fixed in `npm test` (17/17) and live Chrome E2E validation (`#modalNotice`, hash routing, editable AI spec + reload, short-title grouping, offer/transition gating, guided wizards, account & role flows, responsive desktop/mobile).

### P0-3: PayPal Checkout Cancel, Capture & Abandoned Order State Edge Cases
- **Screen or feature:** PayPal Sandbox Checkout & Orders (`src/worker.js:45-71`, `public/app.js:29-30`)
- **Exact steps to reproduce:**
  1. Start checkout (`CREATED`), then click Checkout again after the PayPal order was approved or expired externally, or click `Cancel checkout` when status is not `CREATED`.
  2. Capture an order where PayPal returns order `COMPLETED` with a nested capture status other than `COMPLETED` (e.g., `DECLINED`/`PENDING`).
- **Expected behavior:**
  - `POST /api/orders` checks remote PayPal status for any existing `CREATED` order so expired/voided orders don't trap the buyer and already-approved orders route directly to confirmation.
  - `cancel` updates local DB accurately (`APPROVED` if approved, `CANCELLED` only if DB row actually cancelled).
  - `capture` verifies both PayPal order status and `purchase_units[0].payments.captures[0].status` before marking `COMPLETED`, and stores `capture_id` during `remote.status === 'COMPLETED'` recovery as well.
  - Checkout modal handles duplicate `APPROVED`/`UNKNOWN` responses by closing the modal and navigating to Orders.
- **Actual behavior:** `cancel` can report `CANCELLED` even when 0 DB rows changed; `POST /api/orders` leaves the modal stuck open on `Approval link unavailable` when an order is already `APPROVED`; `capture` does not verify inner capture status.
- **Root cause:** Incomplete state checks in `src/worker.js:50-70` and `public/app.js:29`.
- **Severity:** P0
- **Planned correction:** Reconcile stale `CREATED` orders on `POST /api/orders`, guard `cancel` updates and `capture` inner capture statuses, store `capture_id` consistently, and route duplicate non-`CREATED` orders to Orders view.
- **Verification result:** Verified create, redirect (`sandbox.paypal.com`), and cancel (`CANCELLED`) in Chrome; live Sandbox buyer login/approval and live capture remain unverified without interactive Sandbox buyer credentials.

### P1-1: Modal Error Messages Are Invisible Behind `<dialog>` Backdrop
- **Screen or feature:** Sign in, Register, Verify Email, Checkout, and Decision modals (`public/app.js:12-14, 29, 32`)
- **Exact steps to reproduce:** Open `Account -> Sign in`, enter `nobody@example.test` and `wrongpassword123`, click `Sign in`.
- **Expected behavior:** `"Invalid credentials"` is clearly visible inside the Sign In modal.
- **Actual behavior:** Live CDP check confirmed `modalOpen: true`, `noticeInModal: false`, `noticeBehindModal: "Invalid credentials"` — the error renders behind the dimmed Top Layer dialog backdrop.
- **Root cause:** All modal error handlers call `notice(err.message)`, which writes to `#notice` in `<main>` outside `<dialog id="modal">`.
- **Severity:** P1
- **Planned correction:** Add an inline `#modalNotice` alert container inside `#modalBody` and route modal validation/API errors to it.
- **Verification result:** Verified fixed in `npm test` (17/17) and live Chrome E2E validation (`#modalNotice`, hash routing, editable AI spec + reload, short-title grouping, offer/transition gating, guided wizards, account & role flows, responsive desktop/mobile).

### P1-2: Refreshing the Page Always Resets to Home
- **Screen or feature:** Global navigation / Product Detail / Explore / My Products / Orders (`public/app.js:16, 34`)
- **Exact steps to reproduce:** Navigate to `Explore -> View idea` (`Test`, `#heading` = `Test`), then reload the browser (`F5` / `Page.reload`).
- **Expected behavior:** The browser remains on that product detail page after reload, preserving saved specification edits and state.
- **Actual behavior:** Live CDP check confirmed URL remained `http://127.0.0.1:8787/` and `#heading` reset to `"Home"`.
- **Root cause:** `app.js` keeps view state only in JS variables (`page`) without updating `location.hash` or reading routes on `init()`.
- **Severity:** P1
- **Planned correction:** Implement hash-based routing (`#/home`, `#/explore`, `#/product/<id>`, `#/my-products`, `#/orders`, `#/request`, `#/report`, `#/help`, `#/account`, `#/manufacturer/...`) and restore route on `init()` and `hashchange`.
- **Verification result:** Verified fixed in `npm test` (17/17) and live Chrome E2E validation (`#modalNotice`, hash routing, editable AI spec + reload, short-title grouping, offer/transition gating, guided wizards, account & role flows, responsive desktop/mobile).

### P1-3: Product Intelligence Cannot Be Edited, Triggered Post-Publish, or Safely Parsed
- **Screen or feature:** Request Wizard Step 3 & Product Detail (`public/app.js:24, 26`, `src/worker.js:32, 36`)
- **Exact steps to reproduce:**
  1. Generate draft analysis in Step 3: only a read-only `requirements` bullet string appears; questions, assumptions, complexity, and title cannot be edited.
  2. Publish an idea without analyzing first, then view the product page: there is no option for the owner to run analysis or edit/save specifications.
  3. If `product.intelligence` contains non-JSON text, `JSON.parse(p.intelligence)` throws inside `detail(id)` and breaks rendering.
  4. On Gemini failure, backend returns raw `"Analysis provider HTTP 502"`.
- **Expected behavior:** Visible loading indicator, full generated specification displayed, all fields editable and validated inline, persisted via `POST /api/products/:id/spec` and visible after page refresh, safe JSON parsing, no Gemini/Google model names in UI, and user-friendly errors.
- **Actual behavior:** Read-only summary in Step 3 only; no spec editor on product detail; raw provider HTTP error string.
- **Root cause:** Incomplete specification UI in `public/app.js` and raw status string in `src/worker.js:32`.
- **Severity:** P1
- **Planned correction:** Build a full interactive specification viewer/editor (title, requirements, questions, assumptions, complexity) usable both in Step 3 and by the product owner on the product detail page, wrap `JSON.parse` safely, sanitize backend AI error messages, and never display model/provider names in UI.
- **Verification result:** Verified fixed in `npm test` (17/17) and live Chrome E2E validation (`#modalNotice`, hash routing, editable AI spec + reload, short-title grouping, offer/transition gating, guided wizards, account & role flows, responsive desktop/mobile).

### P1-4: Short-Title Product Similarity SQL Bug (`LIKE '%%'`)
- **Screen or feature:** `POST /api/products` (`src/worker.js:31`)
- **Exact steps to reproduce:** Create a product with title `"Test"` (no words longer than 4 characters). Inspect `GET /api/products/f52f80c0-d6bc-4271-976c-c0f20521f378`.
- **Expected behavior:** Product `"Test"` (`Tshirt with Embroid of Flowers`) has `group_id` equal to its own `id` and `similar: []`.
- **Actual behavior:** Live API returned `group_id: "85838ee4-bbe5-496f-a687-dce6064f39f6"` and `similar: [{"title":"Portable eight-input field recording interface"}]` because `filter(w=>w.length>4)` returned `[]`, making the `LIKE` pattern `'%%'`.
- **Root cause:** Missing check for empty keyword array before querying `LIKE` in `src/worker.js:31`.
- **Severity:** P1
- **Planned correction:** Only run keyword similarity query when at least one keyword (`length > 4`) exists, and label UI accurately as `"Keyword-related ideas"` without claiming semantic similarity.
- **Verification result:** Verified fixed in `npm test` (17/17) and live Chrome E2E validation (`#modalNotice`, hash routing, editable AI spec + reload, short-title grouping, offer/transition gating, guided wizards, account & role flows, responsive desktop/mobile).

### P1-5: Manufacturer Progress Form Shown Without Offer & No Offer Eligibility Update
- **Screen or feature:** Manufacturer Product Workspace (`public/app.js:33`, `src/worker.js:39-40`)
- **Exact steps to reproduce:** Sign in as a manufacturer, open any product with no offer from your account, fill out `Update progress`, and click `Save progress`.
- **Expected behavior:** Only valid actions for the current state are shown; if the manufacturer has not submitted an offer yet, explain that an offer is required before updating stages. Manufacturers can also toggle checkout eligibility on an existing non-DEMO, non-retired offer.
- **Actual behavior:** Form is active and fails on submit with `403 Authorized manufacturer required`.
- **Root cause:** `manufacturerProduct()` renders `#transition` unconditionally whenever `next[p.status].length > 0`, without checking whether the signed-in manufacturer has an offer on `p.id`.
- **Severity:** P1
- **Planned correction:** Gate `#transition` UI on existing manufacturer offer ownership (or administrator role), show clear guidance if no offer exists yet, and add `PATCH /api/offers/:id` so manufacturers can update/enable Sandbox eligibility on their own non-DEMO, non-retired offers.
- **Verification result:** Verified fixed in `npm test` (17/17) and live Chrome E2E validation (`#modalNotice`, hash routing, editable AI spec + reload, short-title grouping, offer/transition gating, guided wizards, account & role flows, responsive desktop/mobile).

### P1-6: Request Wizard Loses Back Edits, Stales Combined Description & Skips Post-Publish Confirmation
- **Screen or feature:** Request a Product Wizard (`public/app.js:24`)
- **Exact steps to reproduce:**
  1. Complete Step 1 -> Step 2 -> Step 3.
  2. Click `Back` twice to Step 1, change the idea text, click `Next` through Step 2 to Step 3.
  3. Or type in Step 2 and click `Back`.
  4. Publish the idea.
- **Expected behavior:** Clicking `Back` preserves unsaved inputs; editing Step 1/2 updates Step 3's generated description unless manually customized; draft persists in `sessionStorage`; publishing displays `"Your idea is published."`, `"GENESIS can help turn your description into product requirements."`, and buttons `Analyze my idea`, `View my idea`, `Explore similar ideas`.
- **Actual behavior:** Clicking `Back` discards current step inputs; Step 3 keeps stale `draft.description`; publishing redirects straight to product detail with only a toast notice.
- **Root cause:** `Back` button handler skips reading current form values, `draft.description` is never regenerated when Step 1/2 changes, and Step 4 calls `detail(x.id)` directly.
- **Severity:** P1
- **Planned correction:** Save current step inputs on `Back`, track auto-composed vs manually edited description, persist drafts in `sessionStorage`, and render the dedicated post-publish confirmation screen.
- **Verification result:** Verified fixed in `npm test` (17/17) and live Chrome E2E validation (`#modalNotice`, hash routing, editable AI spec + reload, short-title grouping, offer/transition gating, guided wizards, account & role flows, responsive desktop/mobile).

### P1-7: Report Wizard Loses Back Edits & Lacks Inline Validation
- **Screen or feature:** Report a Problem Wizard (`public/app.js:25`)
- **Exact steps to reproduce:** Click `Next` on Step 1 without selecting a product, or enter details in Step 2/3 and click `Back`.
- **Expected behavior:** Inline validation error right below the field; `Back` preserves current step inputs; completion shows clear confirmation and next steps.
- **Actual behavior:** Step 1 flashes `#notice` far from the select control; `Back` discards unsaved field edits.
- **Root cause:** Missing inline error element and missing form-state capture on `Back`.
- **Severity:** P1
- **Planned correction:** Add inline field validation and preserve form values on `Back` + `sessionStorage`.
- **Verification result:** Verified fixed in `npm test` (17/17) and live Chrome E2E validation (`#modalNotice`, hash routing, editable AI spec + reload, short-title grouping, offer/transition gating, guided wizards, account & role flows, responsive desktop/mobile).

### P1-8: Checkout Modal Allows Unverified Consumer Submit & Ineligible Offers Lack Explanation
- **Screen or feature:** Product Detail & Checkout Modal (`public/app.js:26, 29`)
- **Exact steps to reproduce:** View a DEMO offer or non-eligible offer on Product Detail, or sign in with an unverified account and attempt checkout.
- **Expected behavior:** Clear explanation of *why* an offer cannot be purchased (DEMO example, preliminary non-purchasable proposal, discontinued product, or unverified email with direct `Verify email` button).
- **Actual behavior:** Only shows `"Not available for checkout"`, and unverified users can check consent and click `Continue to PayPal` before getting a `403` hidden behind the modal.
- **Root cause:** `detail()` and `checkout()` omit state-specific eligibility explanations and pre-flight verification status checks.
- **Severity:** P1
- **Planned correction:** Display clear state-specific explanations on offers and block unverified buyers before PayPal submission with an inline `"Verify email"` action.
- **Verification result:** Verified fixed in `npm test` (17/17) and live Chrome E2E validation (`#modalNotice`, hash routing, editable AI spec + reload, short-title grouping, offer/transition gating, guided wizards, account & role flows, responsive desktop/mobile).

### P1-9: Auth Redirect Loses User's Intended Action
- **Screen or feature:** Sign-in flow from Request, Report, Support, or Checkout (`public/app.js:12, 24, 25, 27, 29`)
- **Exact steps to reproduce:** While signed out, click `"I want a product that doesn't exist"` or `"I'm interested"`, click `Sign in`, and sign in.
- **Expected behavior:** Returns the user to the workflow or product they initiated.
- **Actual behavior:** `init()` unconditionally navigates back to `Home`.
- **Root cause:** `auth()` calls `init()`, which hardcodes `show('Home')`.
- **Severity:** P1
- **Planned correction:** Preserve current route / pending action across sign-in so users resume where they left off.
- **Verification result:** Verified fixed in `npm test` (17/17) and live Chrome E2E validation (`#modalNotice`, hash routing, editable AI spec + reload, short-title grouping, offer/transition gating, guided wizards, account & role flows, responsive desktop/mobile).

### P1-10: Missing Account Management UI
- **Screen or feature:** Account Menu (`public/app.js:15`, `src/worker.js:28`)
- **Exact steps to reproduce:** Sign in and open the `Account` menu.
- **Expected behavior:** Users can view account email, verification status, current role, update their email (`POST /api/profile/email`), resend verification, and apply/check manufacturer status.
- **Actual behavior:** Only `Verify email` (if unverified) and `Sign out` appear.
- **Root cause:** No Account modal/page implemented for `/api/profile/email` or role status.
- **Severity:** P1
- **Planned correction:** Add an `Account` view/modal accessible from the profile menu with email update, verification resend/confirm, and manufacturer application status.
- **Verification result:** Verified fixed in `npm test` (17/17) and live Chrome E2E validation (`#modalNotice`, hash routing, editable AI spec + reload, short-title grouping, offer/transition gating, guided wizards, account & role flows, responsive desktop/mobile).

### P2-1: Home Screen Copy, Role Actions & Above-the-Fold Layout
- **Screen or feature:** Consumer & Manufacturer Home (`public/app.js:19`)
- **Exact steps to reproduce:** Load `http://127.0.0.1:8787/` at `1440x900` and `390x844`.
- **Expected behavior:** Exact required explainer `"Tell us what products you wish existed, improve products you already use, and see what manufacturers are bringing to life."` and the 4 exact Consumer / 4 exact Manufacturer home actions visible cleanly without technical jargon or bottom cards pushed off-screen.
- **Actual behavior:** Different phrasing (`"Request a Product"`, `"Discover Customer Demand"`, etc.), redundant eyebrow text, oversized hero + hint banner pushing actions below the fold.
- **Root cause:** Over-tall hero and outdated copy in `public/app.js:19`.
- **Severity:** P2
- **Planned correction:** Update copy to exact required headings/descriptions, compact the hero cleanly, remove duplicate eyebrows, and streamline above-the-fold layout.
- **Verification result:** Verified fixed in `npm test` (17/17) and live Chrome E2E validation (`#modalNotice`, hash routing, editable AI spec + reload, short-title grouping, offer/transition gating, guided wizards, account & role flows, responsive desktop/mobile).

### P2-2: Product Detail Duplicate Description, Unclear Support State & Visitor Errors
- **Screen or feature:** Product Detail (`public/app.js:26`, `src/worker.js:35`)
- **Exact steps to reproduce:** Open any product detail page (`Test`).
- **Expected behavior:** Clear distinction between Product Idea, Manufacturer Proposal, Production Stage, and Purchasable Offer; non-duplicated description; clear indicator of whether the user already supports the idea; `Remove my interest` only shown when supported.
- **Actual behavior:** `p.description` appears verbatim in two adjacent panels; support buttons don't indicate active selection; clicking `Remove my interest` as a guest throws `401 Sign in required`.
- **Root cause:** Redundant panel HTML and missing `my_support` field in `GET /api/products/:id`.
- **Severity:** P2
- **Planned correction:** Return `my_support` in `GET /api/products/:id`, remove duplicate description card, highlight active support choice, and conditionally render `Remove my interest`.
- **Verification result:** Verified fixed in `npm test` (17/17) and live Chrome E2E validation (`#modalNotice`, hash routing, editable AI spec + reload, short-title grouping, offer/transition gating, guided wizards, account & role flows, responsive desktop/mobile).

### P2-3: Quality Recommendation Note Concatenation & Feedback Visibility
- **Screen or feature:** Manufacturer Quality / Customer Reports (`src/worker.js:34`, `public/app.js:31`)
- **Exact steps to reproduce:** Record two decisions on the same recommendation.
- **Expected behavior:** Clean decision note update without repeated string concatenation; manufacturers can view customer reports across products they manage as well as quality findings.
- **Actual behavior:** `action` concatenates `' Human decision: ...'` repeatedly; `See problems customers are reporting` omits individual feedback items unless opened product-by-product.
- **Root cause:** String concatenation in `src/worker.js:34` and limited query in `GET /api/intelligence/quality`.
- **Severity:** P2
- **Planned correction:** Add `decision_note` column cleanly in migration `0005`, include recent customer feedback reports in manufacturer quality view, and guide decision recording step-by-step.
- **Verification result:** Verified fixed in `npm test` (17/17) and live Chrome E2E validation (`#modalNotice`, hash routing, editable AI spec + reload, short-title grouping, offer/transition gating, guided wizards, account & role flows, responsive desktop/mobile).

### P2-4: Explore Filter Toolbar Layout & Visual Polish
- **Screen or feature:** Explore / Mobile Home / Overall CSS (`public/style.css`)
- **Exact steps to reproduce:** Open `Explore` at `1440px` (`filter` select sits at `y: 467`, `width: 1088px` below search input) or `Home` at `390px` (`Got it` button collides with hint text).
- **Expected behavior:** Search input and stage filter align in one balanced row; Apple-inspired light/clean aesthetic with restrained PayPal-blue accents, readable forms, clear visual hierarchy, and zero horizontal overflow on desktop and mobile.
- **Actual behavior:** Global `select { width: 100% }` breaks flex toolbar; dark heavy borders create dense card-dashboard feel.
- **Root cause:** Unscoped `input,select,textarea{width:100%}` and dark dashboard CSS.
- **Severity:** P2/P3
- **Planned correction:** Rebuild `public/style.css` with an Apple-inspired crisp light interface (`#f5f5f7` canvas, `#ffffff` elevated surfaces, subtle `rgba(0,0,0,0.08)` hairlines, restrained PayPal-blue `#0070ba` accents), scoped toolbar sizing, and responsive desktop/mobile layout.
- **Verification result:** Verified fixed in `npm test` (17/17) and live Chrome E2E validation (`#modalNotice`, hash routing, editable AI spec + reload, short-title grouping, offer/transition gating, guided wizards, account & role flows, responsive desktop/mobile).

