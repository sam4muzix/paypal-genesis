# PayPal GENESIS — Demo Video Script (Under 3 Minutes)

**Target Duration:** 2 minutes 55 seconds  
**Visual Grounding:** Recorded from live local `wrangler dev` (`http://127.0.0.1:8787`) in Chrome using actual D1 data (`Solar Travel Purifier 1794407166202`, `USD 115.00`, PayPal Order `6E759492BW379094G`, Capture `2S438785MA948880G`).

---

### 0:00–0:20 — Introduce the Problem
- **Visual:** Open `http://127.0.0.1:8787/#/home` (Consumer Home showing the explainer and 4 clear actions).
- **Narration:** "Great products often start as everyday frustrations—a device that doesn't exist yet, or one you already bought that keeps failing. Today, consumers have no structured way to turn needs into clear specs, and manufacturers struggle to validate demand before building. That's what PayPal GENESIS solves."

### 0:20–0:45 — Consumer Submits a Product Idea
- **Visual:** Click **I want a product that doesn't exist**, step through **1. Your idea** (*Solar Travel Purifier*), **2. Your priorities** (*UV-C sterilization, replaceable filter, $120 target budget*), **3. Review details**, **4. Publish**, and show the confirmation screen (*"Your idea is published."*).
- **Narration:** "In GENESIS, a verified consumer starts with a guided four-step request—describing the problem, setting must-have priorities, and reviewing before publishing. Notice GENESIS never promises manufacturing upfront; it publishes the need cleanly so demand can grow."

### 0:45–1:10 — GENESIS Intelligence Generates Product Specifications
- **Visual:** Click **Analyze my idea** on the confirmation screen, show the loading spinner, display the generated requirements, open questions, assumptions, and complexity, edit a line (`Food-grade BPA-free bottle body`), click **Save specification**, and refresh the page to show persistence.
- **Narration:** "Next, clicking *Analyze my idea* calls Gemini server-side with a strict JSON schema to turn plain prose into structured product requirements, open questions, and assumptions. The creator can edit any line, save it to Cloudflare D1, and even after a full browser refresh, the specification stays persisted."

### 1:10–1:35 — Consumers Express Interest and Submit Product Feedback
- **Visual:** Click **I'm interested** (status updates to *Your status: Interested* and counter increments), then click **Report a problem** and step through the 4-step report wizard (*USB-C seal lets moisture in during rain*, version `1.0`, `failure`).
- **Narration:** "Other users can show nonbinding interest so builders see real demand, and if something breaks in the field, a guided report flow records versioned feedback. Repeated failure reports or any safety concern automatically surface a quality signal for human review."

### 1:35–2:00 — Manufacturer Discovers Demand and Proposes an Offer
- **Visual:** Switch to the approved Manufacturer browser (`E2E Maker`), show the Manufacturer Home (*Find products people want*, *Offer to manufacture a product*), open `Solar Travel Purifier`, step through the 3-step offer wizard (`USD 115.00`, checkout enabled), and advance the stage from *New idea* to *Gathering interest*.
- **Narration:** "On the manufacturer side—accessible only after verified application and administrator approval—builders browse ranked demand, submit clear pricing and fulfillment terms, and update production stages step-by-step while keeping DEMO examples strictly separate from purchasable offers."

### 2:00–2:30 — Genuine PayPal Sandbox Checkout and Confirmed Capture
- **Visual:** Back in the verified consumer browser, click **Review PayPal Sandbox checkout**, check the approval box, click **Continue to PayPal Sandbox**, approve with the separate US Sandbox Personal buyer account, return to `/?checkout=...&result=approved`, click **Confirm & capture payment**, and show **Payment confirmed** (`6E759492BW379094G` / `2S438785MA948880G`).
- **Narration:** "When a verified consumer is ready to order an eligible non-DEMO offer, GENESIS creates a PayPal Sandbox order using server-verified D1 pricing. Returning from PayPal never completes an order on its own—GENESIS reconciles with PayPal, executes an idempotent server-side capture, verifies the amount and `COMPLETED` capture ID (`2S438785MA948880G`), and persists the receipt."

### 2:30–2:50 — Manufacturer Tracks Orders and Product Progress
- **Visual:** Open **Orders** in the Manufacturer workspace showing `Solar Travel Purifier` (`USD 115.00 · Payment confirmed`) with buyer details kept private, then open **See problems customers are reporting** showing the recorded quality decision.
- **Narration:** "Manufacturers immediately see confirmed Sandbox orders without exposing private buyer details, alongside customer reports where every quality recommendation requires an explicit human decision."

### 2:50–3:00 — Closing Statement
- **Visual:** Return to `#/home` split view of Consumer & Manufacturer workspaces.
- **Narration:** "PayPal GENESIS brings consumers, structured AI specifications, quality accountability, and verified PayPal checkout together in one transparent product lifecycle. Thank you."

