# Kiwi Party AI — Project Foundation

> **Kiwi Party AI** — India's first AI-powered party-supplies **search engine + B2B multivendor marketplace**.
> Think *IndiaMART + Nivoda + an AI shopping agent*, purpose-built for the party & event-supplies industry.

This repository currently holds the **planning foundation** for the project: the product
requirements, recommended architecture & tech stack, data model, MVP scope, a phased roadmap
with timeline/cost estimates, and direct answers to the key questions you'd hand a development
team. It is the document set you can give to any agency or in-house team to start building — or
that we can build from directly.

No application code has been written yet. These docs define *what* to build, *in what order*,
and *with what stack and budget*.

---

## What this product is

A two-sided marketplace where **verified suppliers** (manufacturers / importers / wholesalers of
party products) list inventory, and **business buyers** (party shops, decorators, event planners,
wholesalers) discover, compare, and order — with AI threaded through discovery, selling, and
operations.

| Side | Pays | Gets |
|---|---|---|
| **Supplier** | ₹1,00,000–1,20,000 + GST / year | Product listings, leads, orders, analytics, WhatsApp campaigns, AI assistant |
| **Customer** | ₹3,000 + GST / month | Access to verified wholesale suppliers, AI search & buying assistant, advance booking, clearance deals |

Plus add-on revenue: featured suppliers, sponsored products, bulk WhatsApp campaigns, festival
promotions, lead boosts, and banner ads.

---

## Documentation map

Read in this order. Each doc is self-contained but they build on each other.

| # | Document | What it answers |
|---|---|---|
| 1 | [`docs/01-product-requirements.md`](docs/01-product-requirements.md) | Vision, user roles, business model, and the full feature breakdown organised by domain. |
| 2 | [`docs/02-architecture-and-tech-stack.md`](docs/02-architecture-and-tech-stack.md) | System architecture, the recommended stack **with rationale**, the AI strategy, integrations, scalability, and security/compliance. |
| 3 | [`docs/03-data-model.md`](docs/03-data-model.md) | Core entities, relationships, and the tricky parts (multi-supplier orders, price slabs/MOQ, subscriptions, KYC, stories). |
| 4 | [`docs/04-mvp-scope.md`](docs/04-mvp-scope.md) | What's **in** and **out** for the MVP, MoSCoW prioritisation, and success metrics. |
| 5 | [`docs/05-roadmap-and-estimates.md`](docs/05-roadmap-and-estimates.md) | Phased delivery plan, team composition, **timeline & cost ranges**, and recurring run-cost estimates. |
| 6 | [`docs/06-developer-answers.md`](docs/06-developer-answers.md) | Direct answers to your "very important developer questions" (months to MVP, cost, tech, scale, Hindi+English, Excel upload, WhatsApp, auto-reports). |
| 7 | [`docs/07-supplier-stories-spec.md`](docs/07-supplier-stories-spec.md) | Deep-dive spec for your flagship differentiator — **Supplier Stories** (Kiwi Party Reels). |

---

## The 60-second summary

- **Recommended stack:** TypeScript end-to-end — **Next.js** (web + SEO), **React Native/Expo**
  (customer + supplier apps), **NestJS** (API), **PostgreSQL + Redis**, **Typesense** (keyword/faceted
  search) + **pgvector** (semantic/AI search), **Claude** as the LLM layer, **Razorpay** (payments),
  **WhatsApp Business Platform** via a BSP, on **AWS**. Full rationale and alternatives in doc 2.
- **MVP scope:** customer app + supplier app + admin panel + web, with listings, search (keyword +
  AI), inquiries/RFQ, multi-supplier cart & orders, subscriptions & GST invoicing, dead-stock
  section, WhatsApp alerts, and core reports. Advanced AI, community, Stories, and full SEO come in
  later phases. Detail in doc 4.
- **MVP timeline & cost:** **~5 months** with a focused team of ~7; planning range **₹30–60 lakh**
  to build, plus monthly run costs. Full multi-platform v1 over **12–18 months**. Detail in doc 5.
- **Yes to:** 10k customers / 1k suppliers / 100k+ products, Hindi + English AI search, Excel bulk
  upload, official WhatsApp API, and automated daily reports. How, in doc 6.

> Estimates are planning ranges for the Indian market, not a fixed quote — they move with scope,
> team seniority/location, and how much of the AI is genuinely custom vs. API-assisted. See doc 5
> for assumptions.

---

## Running app (MVP core)

A **runnable, tested** implementation of the marketplace core now lives in
[`apps/web/`](apps/web) — Next.js + TypeScript + Prisma. It implements the real B2B buying loop
with the hard parts done for real: price slabs / MOQ / quantity-multiples, the **multi-supplier
order split**, and **per-supplier GST invoicing**, plus supplier and admin surfaces, OTP auth, and a
JSON API for future mobile apps.

```bash
cd apps/web
cp .env.example .env
npm install
npm run setup      # generate client + create SQLite db + seed demo data
npm run dev        # http://localhost:3000
npm test           # 24 passing domain unit tests
```

Demo logins (OTP `123456`): buyer `9000000001`, supplier `9000000010`, admin `9000000099`.
Full details, API reference, and the implemented-vs-deferred list are in
[`apps/web/README.md`](apps/web/README.md).

## Status

| Area | Status |
|---|---|
| Product requirements | ✅ Documented |
| Architecture & tech stack | ✅ Recommended |
| Data model | ✅ Drafted + implemented (Prisma) |
| MVP scope & roadmap | ✅ Defined |
| **MVP core app** | ✅ **Built & verified** — catalogue, search, multi-supplier cart/orders, GST invoices, supplier dashboard, admin KYC, OTP auth, REST API; build green; 24 unit tests pass |
| Payments / WhatsApp / SMS | ⏳ Mocked behind clear seams (Razorpay / BSP / MSG91 are deferred integrations) |
| AI agents, mobile apps, Stories, full SEO | ⛔ Deferred to later phases (see doc 4 & 5) |

This is the **MVP core slice**, not the full 150-feature platform — it proves the central loop end
to end. The remaining breadth is scoped and sequenced in docs 4 and 5.
