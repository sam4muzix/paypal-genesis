# GENESIS navigation and workflow map — 11 November 2026

| Existing feature/control | Simplified location | Backend route retained |
| --- | --- | --- |
| Discover, search, stage filter | Explore / Customer Demand | `GET /api/products` |
| Create a Product, Analyze draft | Home → Request a Product, four guided steps | `POST /api/products`, `/api/analyze`, `/api/products/:id/spec` |
| My Ideas | My Products → My ideas | `GET /api/products` |
| Products I Support, interest/intent/withdraw | Explore → product → I'm interested / I might buy; My Products → Ideas I support | `/api/products/:id/support`, `/api/my/activity` |
| Feedback form and history | Home → Report a Problem, four guided steps; product → Community reports | `/api/products/:id/feedback` |
| Manufacturer offers | Customer Demand → product → Propose to build | `/api/products/:id/offers` |
| Product journey/stage transition | Product → Progress; manufacturer product → Update progress | `/api/products/:id/transition` |
| Quality recommendations/alerts | Manufacturer Home → Improve My Products; product → Related ideas and quality findings | `/api/intelligence/quality`, `/api/recommendations/:id/decision` |
| Purchases | My Products → Purchases; manufacturer Orders navigation | `/api/orders`, `/api/orders/:id/*` |
| Email verification, logout | Account menu | existing authentication routes |
| Related demand and specifications | Product → collapsed details | product detail route |

Consumer primary navigation: Home, Explore, My Products, Help. Manufacturer primary navigation: Home, Customer Demand, My Products, Orders, Help. Account actions sit in the profile menu. The Help page remains available to either role.

The prior product detail placed interest, intent, withdrawal, feedback form, offers, similar needs, lifecycle, intelligence, and quality signals side by side. The new page leads with the product, interest count, progress, and next action. Technical detail is collapsed. Feedback and requests use guided flows; manufacturer actions are grouped by purpose and only shown to approved roles. Internal lifecycle values and D1 fields remain unchanged.

## Manufacturer view correction

Manufacturer **My Products** lists products with offers made by that account. **Orders** lists only orders attached to that account's offers and shows product, amount, currency, and status without buyer identity. Two manufacturer-scoped read endpoints support these views; neither changes payment or lifecycle state.
