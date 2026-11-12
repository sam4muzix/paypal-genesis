# Devpost Additional Info Submission Fields — PayPal GENESIS

**Submission URL:** [https://devpost.com/submit-to/31302-paypal-ai-hackathon/manage/submissions/1293015-paypal-genesis/additional-info/edit](https://devpost.com/submit-to/31302-paypal-ai-hackathon/manage/submissions/1293015-paypal-genesis/additional-info/edit)

---

## 1. Project Overview

- **Project Title:**
  `PayPal GENESIS`

- **Tagline (Short Pitch):**
  `Customer-Led Manufacturing Powered by GENESIS Intelligence & PayPal Sandbox`

- **Public URL:**
  `https://genesis.greenmixlabs.com`

- **Public GitHub Repository (Open Source):**
  `https://github.com/sam4muzix/paypal-genesis`

- **Demo Video URL (YouTube):**
  `https://www.youtube.com/watch?v=yDLigrtdXCI`

---

## 2. Sponsor Prizes Selected

- **Selected Sponsor:**
  `Best Use of AG Grid` *(Select only AG Grid as instructed)*

---

## 3. Sponsor Prize Answers

### AG Grid / AG Studio Experience & Implementation:
```text
We integrated genuine AG Studio v3.1 (built on AG Grid v36 and AG Charts v14) into our dedicated manufacturer intelligence workspace at `#/manufacturer/intelligence`. The implementation delivers:

1. Embedded Analytics Canvas: Integrated with a custom midnight-navy dark theme matching GENESIS design tokens (--bg: #090d16, --surface: #121a2b, --blue: #0070ba).
2. Demand Explorer AG Grid: Central data grid over real-time Cloudflare D1 consumer demand records featuring live column sorting, multi-criteria filtering, row selection, search, contextual action triggers, and authorized CSV export.
3. Custom AG Studio Widgets: Built two synchronized custom widgets:
   - Opportunity Spotlight: Dynamically reflects the selected product row with SVG iconography, consumer intended use, demand count, stage pill, and direct offer proposal actions.
   - GENESIS Intelligence Brief: Displays persisted AI specifications (key engineering requirements, open manufacturer inquiries, hardware complexity indicator) with a shortcut to the editable specification workbench.
   - Product Health Widget: Aggregates customer failure and field issue reports.
4. PayPal Sandbox Analytics: Tracks authorized Sandbox payment records (orders created, completed captures, pending transactions, and captured volume by currency).
5. Self-Service Customization: View/Edit mode switching, dashboard widget resizing and rearrangement, localStorage layout persistence, and one-click layout reset.
6. Grounded Natural-Language Querying: "Ask GENESIS Intelligence" query bar answering analytical questions strictly grounded in the manufacturer's authorized D1 dataset via server-side Gemini 3.8.
```

---

## 4. PayPal Integration Description
```text
PayPal GENESIS implements a complete PayPal Sandbox Orders v2 checkout and capture lifecycle:
- Server-Side Order Creation: `POST /api/orders` initiates Orders v2 via Sandbox REST OAuth with `intent: CAPTURE`, deriving prices strictly from D1 database records (never trusting client parameters).
- Buyer Approval Flow: Directs buyers to `https://www.sandbox.paypal.com/checkoutnow` with verified `experience_context` return and cancel endpoints.
- Server-Side Capture & Idempotency: Validates order status is `APPROVED` before triggering capture with `PayPal-Request-Id` idempotency and an atomic `CAPTURE_PENDING` D1 transaction guard to prevent double-charging.
- Verified Sandbox Capture: Successfully demonstrated live in Sandbox (Order `6E759492BW379094G` captured as `2S438785MA948880G` for `USD 115.00`, status `COMPLETED`).
- Webhook Reconciliation: Implemented signed webhook endpoint (`POST /api/paypal/webhook`) registered with Webhook ID `9V127089DJ527653S`.
```

---

## 5. AI Integration Description
```text
GENESIS Intelligence uses Google Gemini (`gemini-3.8-flash`) through secure, server-side Cloudflare Worker endpoints:
- Product Technical Specifications: `POST /api/analyze` uses Gemini JSON schema mode (`SPECIFICATION_SCHEMA`) to translate unstructured consumer product concepts into structured 6-point engineering specifications (functional requirements, open engineering questions, manufacturer assumptions, and hardware complexity scoring).
- Creator Spec Editing: AI outputs are preliminary drafts; creators can review, edit, and persist specifications into Cloudflare D1 across browser sessions without third-party model branding in the user interface.
- Manufacturer Analytical Assistant: "Ask GENESIS Intelligence" (`POST /api/intelligence/query`) answers manufacturer questions about community demand, development stages, and Sandbox transaction performance strictly from authorized analytical data.
```

---

## 6. Testing Instructions for Judges
```text
Live Public URL: https://genesis.greenmixlabs.com

We have provided zero-friction, one-click demonstration pathways on the landing screen (no registration or email verification required):

1. Consumer Demo Pathway:
   - Click "Continue as Consumer" on the home page.
   - You will be instantly authenticated as Demo Consumer.
   - Propose a new product idea using the 4-step wizard, click "Generate requirements" to experience live Gemini specification analysis, edit requirements, and support community concepts.
   - Report a product defect or test Sandbox checkout on eligible manufacturer offers.

2. Manufacturer Demo Pathway:
   - Click "Explore as Manufacturer" on the home page.
   - You will be authenticated as pre-approved manufacturer "Demo Audio Lab".
   - Open "GENESIS Intelligence" in the navigation bar (`#/manufacturer/intelligence`) to explore the embedded AG Studio / AG Grid command center, test live sorting, filtering, selection, CSV export, custom spotlight widgets, and PayPal Sandbox transaction volume ($115.00 captured).
   - Test "Ask GENESIS Intelligence" by clicking prompt pills or asking custom natural-language questions.
   - Click "Customize Dashboard" to toggle Edit mode and rearrange widgets.

3. Complete Source Code & Verification:
   - GitHub: https://github.com/sam4muzix/paypal-genesis
   - Walkthrough Video: https://www.youtube.com/watch?v=yDLigrtdXCI
```

---

## 7. Personal Eligibility Declarations
> [!IMPORTANT]
> Verify your country of residence, age eligibility (18+), and personal hackathon confirmation checkboxes on Devpost directly as these require individual contestant attestation.

