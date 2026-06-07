# 05 — Roadmap, Timeline & Cost Estimates

A phased delivery plan, the team to build it, and honest **planning estimates** for time and money —
both the one-time build cost and the recurring run cost (the one most people forget).

> **Read this first — what these numbers are.** These are **planning ranges for the Indian market in
> 2026**, not a fixed quote. Real figures move with: scope decisions, team seniority and location
> (in-house vs. agency vs. freelancers; metro vs. tier-2), how much AI is genuinely custom vs.
> API-assisted, design polish, and how much changes mid-flight. Use them to budget and to sanity-check
> vendor quotes — then get a fixed bid against the MVP scope in doc 4. As an AI assistant I can't
> issue a binding quote; I can give you a defensible model and ranges.

---

## 1. Phases

| Phase | Theme | Outcome | Indicative duration |
|---|---|---|---|
| **0 — Foundation** | Scaffold & rails | Monorepo, CI/CD, auth + RBAC, core data model (users, KYC, catalogue, **order split**, subscriptions), staging/prod | ~3–4 weeks |
| **1 — MVP** | Core marketplace | Everything in doc 4 "Must": KYC+approval, subscriptions+GST, catalogue+Excel, keyword+**AI search**, multi-supplier cart/orders, inquiries, WhatsApp/push alerts, core reports, admin, 4 surfaces | ~3.5–4.5 months (incl. Phase 0) |
| **2 — Intelligence & growth** | Make it smart & sticky | AI sales agent + supplier assistant; voice/image search; recommendations; reviews/trust; RFQ; advance booking; **bulk WhatsApp campaigns**; daily WhatsApp report; customer reports; transport + light tracking | ~3–4 months |
| **3 — Differentiate & scale** | Flagship + reach | **Supplier Stories** (doc 7) + live selling; community; full SEO programme (blog/CMS, city/festival pages, AI writer, schema); demand forecasting; combo builder; QR/PDF catalogues | ~4–6 months |
| **4 — Platform maturity** | Harden & extend | Supplier API feed; transport-partner portal; credit limits; standalone AI dashboard; deeper analytics; scale hardening; loyalty/referrals | ongoing |

**MVP (Phase 0+1): ~4–5 months.** **Full v1 (through Phase 3): ~12–18 months.** Phases 2–3 can
overlap with a larger team.

---

## 2. The team

A **lean, senior team of ~7** builds the MVP faster and cheaper than a large junior one. Roles:

| Role | MVP (Phase 0–1) | Growth (Phase 2–3) |
|---|---|---|
| Tech lead / backend architect | 1 | 1 |
| Backend engineers (NestJS) | 1–2 | 2–3 |
| Web engineer (Next.js) | 1 | 1–2 |
| Mobile engineers (React Native) | 1–2 | 2 |
| AI/ML engineer | 0.5–1 | 1–2 |
| UI/UX designer | 0.5–1 (contract) | 1 |
| QA engineer | 1 | 1–2 |
| Product/Project manager | 0.5 (can be founder) | 1 |
| **Effective headcount** | **~6–8** | **~10–13** |

DevOps can be part of the tech lead's remit at MVP scale (managed AWS services keep ops light);
add a dedicated platform/DevOps engineer in Phase 3+.

---

## 3. Build cost (one-time)

The model is simple: **team size × duration × blended monthly cost.** Indicative loaded monthly
costs for mid-to-senior talent in India (2026):

| Role | Monthly (₹, loaded) |
|---|---|
| Tech lead / architect | 2.0–3.0 L |
| Senior/mid engineer | 1.0–1.8 L |
| AI/ML engineer | 1.5–2.5 L |
| Designer (contract) | 0.8–1.5 L |
| QA | 0.7–1.2 L |
| PM | 1.0–1.8 L |

### MVP (Phase 0 + 1)
- Team ~6–8 → monthly burn ≈ **₹8–14 L/mo** → over ~5 months ≈ **₹40–70 L** at full in-house cost.
- A **leaner** build (tighter team, contract designer, founder as PM) realistically lands
  **₹30–50 L**; a very scrappy MVP can go lower (~₹18–30 L) by trimming Phase-1 "Should-leaning"
  items and polish.
- **Agency fixed-bid** for comparable scope in India typically quotes **₹25–60 L**, depending on
  polish and how much AI is genuinely custom vs. thin API wrappers.

> **Planning figure for the MVP: ₹30–60 lakh, ~5 months.** Treat the low end as "lean team, disciplined
> scope" and the high end as "fuller team, more polish."

### Full v1 (through Phase 3)
- ~12–18 months with the growing team → **₹1.0–2.5 crore** total build cost, plus ongoing run costs.
- Wide range because Phases 2–3 contain the open-ended bits (advanced AI, Stories, full SEO,
  forecasting) whose depth is a product choice.

These are **build** costs. They exclude the recurring run costs below, marketing/sales, and content.

---

## 4. Recurring run costs (monthly) — don't forget these

Separate from building it, the platform costs money to *operate*. Early-scale estimates (up to a few
thousand active users); all scale with usage:

| Item | Early monthly (₹) | Scales with | Notes |
|---|---|---|---|
| Cloud (AWS: compute, RDS, Redis, LB) | 40k – 1.5 L | traffic, data | Start small; scale instances/replicas as needed |
| Object storage + CDN (S3/CloudFront) | 10k – 50k | media volume & views | Product/story images & video dominate |
| Search (Typesense self-host) | 5k – 30k | index size, QPS | Algolia (managed) costs more but zero-ops |
| **LLM (Claude) API** | 25k – 1.5 L+ | AI feature usage | Controlled by tiering + caching + Batches (doc 2 §6.2); grows with AI adoption |
| Embeddings (vector search) | 5k – 30k | catalogue size & updates | One-off per product + on change |
| **WhatsApp (Meta + BSP)** | **usage-based** | messages sent | **Per-conversation Meta pricing** + BSP fee — big for bulk campaigns; see §5 |
| SMS / OTP (MSG91) | 10k – 60k | logins, transactional SMS | ~₹0.12–0.20 per SMS |
| Push (FCM) | ~0 | — | Free |
| Payments (Razorpay) | ~2% of txn value | GMV & subscriptions | Per-transaction + mandate fees (negotiable) |
| Monitoring (Sentry/uptime) | 5k – 25k | events | Free tiers exist early |

**Indicative early run cost (excl. Razorpay % and WhatsApp campaign volume): ~₹1.5–4 L/mo**, rising
with users and AI usage. The two variable line items to watch are **LLM** and **WhatsApp**.

---

## 5. The two costs to design around

1. **WhatsApp is metered.** Meta charges **per conversation/message**, and **marketing templates
   cost more than utility ones**. A single bulk campaign of ~8,000 messages can run into thousands of
   rupees in pure Meta fees, before the BSP's platform fee. So:
   - **Price the "bulk WhatsApp campaign" add-on above its send cost** — it must be margin-positive.
   - Use **utility/transactional templates** (order/inquiry/renewal alerts) where possible — cheaper
     and higher-trust than marketing blasts.
   - Enforce **opt-in** rigorously (compliance + cost control).

2. **LLM spend is a dial, not a fixed bill.** With the doc 2 §6.2 patterns — **model tiering**
   (Haiku/Sonnet/Opus by task), **prompt caching** (~90% off repeated context), **Batches API** (50%
   off bulk jobs), and **structured outputs** (fewer retries) — AI cost stays a small, controllable
   fraction of revenue. Without them, it's the line item that surprises you. Build them in from day
   one and track **AI spend per active user** (doc 4 §5).

---

## 6. Suggested build order (within MVP)

1. **Phase 0:** monorepo + CI/CD + environments; auth/OTP + RBAC; data model for users, KYC,
   catalogue, **order split**, subscriptions; admin shell.
2. Supplier flow: KYC + approval → subscription → product CRUD + **price slabs/MOQ** → **Excel import**.
3. Search: Typesense index + facets → **AI/hybrid search** (Hindi+English).
4. Buyer flow: customer KYC + subscription → cart → **multi-supplier order split** → Razorpay →
   **GST invoice** → tracking + reorder.
5. Inquiries/leads → WhatsApp + push alerts.
6. Core reports (supplier daily + admin KPIs) → harden, test, launch.

Then Phase 2 (intelligence/growth), Phase 3 (Stories/SEO/scale). Stories deep-dive in doc 7.

---

## 7. Risks & how to de-risk

| Risk | Mitigation |
|---|---|
| Scope creep past MVP | Hold the doc 4 cut line; everything else is a scheduled phase, not a "small add" |
| WhatsApp cost/compliance surprises | Model send cost into pricing; utility templates; strict opt-in; BSP from the start |
| LLM cost runaway | Tiering + caching + batching from day one; track spend/user; cap with budgets |
| Supply/demand cold-start | Sales team onboards anchor suppliers first (supply before demand); seed catalogue |
| KYC/data-protection exposure | Encrypt + access-log sensitive docs; minimise retention (doc 2 §9) |
| Multi-supplier order/invoice bugs | Build & test the order split + GST invoicing early (doc 3 §§B, C), in transactions |
| Over-engineering early | Modular monolith first; extract services only when scale demands (doc 2 §1) |

---

## 8. Bottom line

- **MVP:** ~**5 months**, planning cost **₹30–60 lakh**, team of ~7.
- **Full v1:** **12–18 months**, **₹1–2.5 crore** build, plus ~**₹1.5–4 L/mo+** run cost (LLM &
  WhatsApp variable on top).
- The architecture (doc 2) comfortably handles the stated scale (doc 6), so spend goes to features
  and AI quality, not re-platforming.
- Get a fixed agency bid against doc 4's MVP scope and compare it to the ₹30–60 L range above.
