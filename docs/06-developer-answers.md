# 06 — Answers to the Developer Questions

Direct answers to the "very important developer questions" from the brief, with pointers to where
the detail lives. Short answer first, then the why.

> The brief titled this section "18 Very Important Developer Questions" but listed 10 — all 10 are
> answered below.

---

## 1. How many months for the MVP?

**~4–5 months** (≈3–4 weeks Phase 0 foundation + ~3.5–4.5 months Phase 1), with a focused team of
~7. MVP scope is doc 4; the phase plan is doc 5 §1.

This delivers: supplier & customer KYC + approval, subscriptions + GST invoicing, catalogue with
price slabs/MOQ + Excel import, keyword **and AI** search (Hindi+English), multi-supplier cart &
orders, inquiries, WhatsApp/push alerts, core reports, admin panel, and all four surfaces (customer
app, supplier app, website, admin).

---

## 2. What is the total cost for the MVP?

**Planning range: ₹30–60 lakh** for the doc 4 scope over ~5 months.
- Lean team / disciplined scope: ~₹30–50 L.
- Fuller team / more polish: ~₹50–60 L.
- Very scrappy MVP (trimmed scope): possible ~₹18–30 L.
- Indian **agency fixed-bids** for comparable scope typically land **₹25–60 L**.

This is a build estimate and excludes recurring run costs (doc 5 §4). Full model, assumptions, and
caveats in doc 5 §3. **It's a planning range, not a quote** — get a fixed bid against doc 4.

---

## 3. What is the cost for the full version?

**₹1.0–2.5 crore** for the full v1 through Phase 3 (advanced AI agents, Supplier Stories, community,
full SEO, demand forecasting, deeper logistics/analytics) over **12–18 months**, plus ongoing run
costs of roughly **₹1.5–4 L/month+** (LLM and WhatsApp are variable on top). The wide range reflects
how deep you take the open-ended AI/Stories/SEO features. Detail in doc 5 §3–4.

---

## 4. Which technology will be used?

**TypeScript end-to-end** (one language, one hiring pool, shared code):

- **Website + SEO:** Next.js (React, server-rendered)
- **Customer & supplier apps:** React Native + Expo (one codebase, iOS + Android)
- **Backend API:** NestJS (Node + TypeScript), modular monolith
- **Database:** PostgreSQL (+ `pgvector`); **Redis** for cache/queues
- **Search:** Typesense (keyword/faceted) + pgvector (semantic/AI)
- **AI:** Claude — tiered by task (Haiku 4.5 / Sonnet 4.6 / Opus 4.8)
- **Payments:** Razorpay · **WhatsApp:** official Business Platform via a BSP · **SMS:** MSG91 ·
  **Push:** FCM
- **Hosting:** AWS (containers, managed DB/cache/storage)

Full rationale, alternatives (Flutter, Laravel/Python, MySQL, Algolia, etc.), and the AI strategy are
in doc 2. The stack maps cleanly to the 25 developer modules listed in the brief (doc 2 §3).

---

## 5. Can it handle 10,000 customers and 1,000 suppliers?

**Yes — comfortably, with headroom.** That scale is modest for this architecture: a stateless API
scaled horizontally behind a load balancer, a well-tuned PostgreSQL instance (with read replicas for
report-heavy reads when needed), Typesense for search, Redis for caching, and async workers for heavy
jobs. Reaching 10× that scale is mostly configuration (bigger DB, more replicas), not re-architecture.
Detail in doc 2 §8.

---

## 6. Can it handle 1 lakh+ products in the future?

**Yes.** PostgreSQL handles 100k+ products as routine; Typesense indexes 100k–1M+ products with
millisecond queries on a modest node and shards/replicates as it grows; pgvector handles the
semantic-search vectors at this scale (move to a dedicated vector DB like Qdrant/Pinecone only if you
push well beyond). The search index is **derived** from Postgres and rebuilt by a worker, so growth
is a scaling exercise, not a redesign. Doc 2 §§4, 8.

---

## 7. Can AI search work in Hindi + English?

**Yes — including Hinglish.** Two parts: (a) **understanding** — Claude is natively multilingual, so
queries in Hindi, English, or mixed are understood; (b) **retrieval** — products are embedded with a
**multilingual embedding model** so "बेबी शावर सजावट" and "baby shower decoration" map to the same
products. The pipeline is hybrid: LLM intent → keyword (Typesense) + vector (pgvector) → blended
ranking. Voice search adds speech-to-text in front of the same pipeline; image search turns a photo
into a query. Doc 2 §6.3.

---

## 8. Can suppliers upload products by Excel?

**Yes — built into the MVP.** Flow: download a **template** (correct columns: name, category, SKU,
price, MOQ, quantity multiples, **price slabs**, GST %, stock, attributes, etc.) → upload Excel/CSV →
**server validates** each row (required fields, category exists, slab/MOQ sanity, image
links/SKUs) and returns a clear per-row error report → valid rows are imported **asynchronously**
(background worker) so large files don't time out, with progress shown. Images can be referenced by
URL or matched by SKU in a follow-up upload. Doc 1 §5.2, doc 2 §3 (workers), doc 4 (MVP checklist).

---

## 9. Can the WhatsApp API be integrated?

**Yes — using the official WhatsApp Business Platform via a BSP** (AiSensy / Gupshup / Interakt /
WATI). It powers order/inquiry alerts, renewal/payment reminders, daily supplier reports, follow-ups,
and bulk campaigns. Two things to design around (doc 2 §7, doc 5 §5):
- **Compliance:** business-initiated messages need **pre-approved templates** and recipient
  **opt-in**.
- **Cost:** Meta bills **per conversation/message** (marketing > utility), so **bulk campaigns carry
  real per-message cost** — price the campaign add-on above its send cost so it's margin-positive.

Avoid unofficial/grey-market WhatsApp gateways — they risk number bans and break compliance.

---

## 10. Can reports come daily, automatically?

**Yes.** A **scheduled job** (cron-triggered worker) runs every morning, aggregates the previous
day's data into rollup tables, and delivers reports automatically via **WhatsApp** (and email/push):
supplier daily sales, views, inquiries, pending orders, top/trending products, and festival demand;
admin KPIs. AI can also generate a short natural-language summary on top of the numbers (cheaply, via
the Batches API). Because it's a background job, it scales independently of the app. Doc 1 §13,
doc 2 §3, doc 3 §10, doc 5 §5.

---

## Quick-reference table

| # | Question | Answer |
|---|---|---|
| 1 | Months to MVP | ~4–5 months |
| 2 | MVP cost | ₹30–60 L (planning range) |
| 3 | Full version cost | ₹1.0–2.5 Cr over 12–18 mo + run costs |
| 4 | Technology | TypeScript: Next.js · React Native · NestJS · Postgres+Redis · Typesense+pgvector · Claude · Razorpay · WhatsApp BSP · AWS |
| 5 | 10k customers / 1k suppliers | Yes, with headroom |
| 6 | 1 lakh+ products | Yes |
| 7 | Hindi + English AI search | Yes (incl. Hinglish) |
| 8 | Excel bulk upload | Yes (MVP) |
| 9 | WhatsApp API | Yes (official, via BSP) |
| 10 | Daily automated reports | Yes (scheduled jobs) |
