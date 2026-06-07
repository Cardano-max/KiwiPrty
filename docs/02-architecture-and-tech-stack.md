# 02 — Architecture & Tech Stack

How to build Kiwi Party AI: the recommended stack with **rationale and alternatives**, the system
architecture, the AI strategy (models, costs, patterns), third-party integrations, how it scales,
and security/compliance. This answers "which technology" and "can it scale" from doc 6 in depth.

---

## 1. Guiding principles

1. **One language across the stack (TypeScript).** Web, both mobile apps, and the backend all in
   TS means shared types, shared validation, shared business logic, one hiring pool, and far less
   context-switching for a small team. This single decision lowers cost and speeds delivery more
   than any individual library choice.
2. **SEO-critical surfaces are server-rendered.** Organic discovery is a core acquisition channel,
   so the public web must render on the server.
3. **Modular monolith first, services later.** Start with one well-structured backend split into
   clear modules (doc 1's domains). Extract services (search indexer, AI workers, WhatsApp sender)
   only where scale or isolation demands it. Don't pay microservices tax on day one.
4. **AI is a layer, not a rewrite.** Wrap LLM calls behind a small internal "AI service" interface
   so models/providers can be swapped per task without touching product code.
5. **Buy the commodity, build the differentiator.** Use managed services for auth plumbing,
   payments, search, and messaging; spend engineering on the catalogue, AI discovery/selling, and
   supplier analytics — the things that make Kiwi Party special.

---

## 2. Recommended stack (at a glance)

| Layer | Recommendation | Strong alternative | Why the pick |
|---|---|---|---|
| **Public web** | **Next.js** (React, App Router, TypeScript) | Remix | SSR/ISR for SEO; huge ecosystem; same React model as the apps |
| **Customer & supplier apps** | **React Native + Expo** (TypeScript) | Flutter | Shares language/skills/logic with web & API; one TS hiring pool; OTA updates via Expo |
| **Backend API** | **NestJS** (Node + TypeScript) | Laravel (PHP), FastAPI (Python) | Structured/modular (fits doc 1's 25 modules), TS end-to-end, strong DI/testing |
| **Primary DB** | **PostgreSQL** | MySQL | Transactions for orders/invoices, rich types (JSONB), `pgvector` for AI search in the same DB |
| **Cache / queues** | **Redis** + **BullMQ** | — | Sessions, rate limits, caching, async jobs (WhatsApp, reports, AI, imports) |
| **Keyword/faceted search** | **Typesense** (self-host) | Algolia (managed), Meilisearch, OpenSearch | Fast, typo-tolerant, cheap to run; managed Algolia if you'd rather not operate it |
| **Semantic / AI search** | **pgvector** + a multilingual embedding model | Qdrant / Pinecone (managed) | Hindi+English semantic search; stays in Postgres at MVP scale |
| **LLM layer** | **Claude** (Anthropic) — tiered by task | OpenAI / open models | Best agentic/reasoning for the AI sales & supplier agents; native multilingual; see §6 |
| **Object storage / CDN** | **AWS S3 + CloudFront** | Cloudflare R2 + CDN | Product images/videos, KYC docs, story media |
| **Payments** | **Razorpay** | Cashfree, PhonePe PG | India-first, UPI + cards + subscriptions/mandates, GST-friendly |
| **WhatsApp** | **WhatsApp Business Platform (Cloud API)** via a **BSP** (AiSensy / Gupshup / Interakt / WATI) | Direct Cloud API | Template management, opt-in compliance, bulk-send tooling |
| **SMS / OTP** | MSG91 (or Razorpay/Twilio) | — | OTP login + transactional SMS in India |
| **Push** | Firebase Cloud Messaging (FCM) | — | Free, reliable mobile push for both apps |
| **Hosting** | **AWS** (containers via ECS Fargate or EKS) | GCP; Render/Railway for MVP speed | Mature India regions (Mumbai), managed RDS/ElastiCache/S3 |
| **Observability** | Sentry + structured logs + uptime monitor | Grafana/Loki, Datadog | Catch errors early; cheap to start |
| **Admin panel** | Next.js app (web) using the same API | Retool/Refine for speed | Reuse the stack; full control over KYC/approval/dispute flows |

> The original brief listed Flutter/React Native, Node/Laravel/Python, MySQL/PostgreSQL,
> Elasticsearch/Algolia, OpenAI-or-similar — all valid. The recommendations above optimise for a
> **small team shipping fast with one language** while leaving the alternatives open.

---

## 3. System architecture

```
                         ┌──────────────────────────────────────────────┐
   Customer App (RN)  ───▶│                                              │
   Supplier App (RN)  ───▶│              API Gateway / BFF               │
   Website (Next.js)  ───▶│         (NestJS, REST/JSON + JWT)            │
   Admin (Next.js)    ───▶│                                              │
                         └───────────────┬──────────────────────────────┘
                                         │
        ┌──────────────┬────────────────┼─────────────────┬───────────────┐
        ▼              ▼                ▼                 ▼               ▼
   ┌─────────┐   ┌──────────┐    ┌────────────┐   ┌────────────┐  ┌──────────────┐
   │PostgreSQL│   │  Redis   │    │ Typesense  │   │ AI Service │  │ Object store │
   │(+pgvector)│  │+ BullMQ  │    │  (search)  │   │  (Claude)  │  │  S3 + CDN    │
   └─────────┘   └────┬─────┘    └────────────┘   └─────┬──────┘  └──────────────┘
                      │ async jobs                        │
        ┌─────────────┴───────────────┬──────────────────┴──────────┐
        ▼                             ▼                              ▼
  ┌────────────┐              ┌───────────────┐             ┌─────────────────┐
  │ Report gen │              │ WhatsApp send │             │ Excel importer  │
  │  (cron)    │              │ (BSP API)     │             │  + indexer      │
  └────────────┘              └───────────────┘             └─────────────────┘

  External: Razorpay (payments) · WhatsApp BSP · MSG91 (SMS/OTP) · FCM (push) · GST/PAN verify APIs
```

**Backend modules (one codebase, clear boundaries — maps to doc 1):**
auth & RBAC · supplier-KYC · customer-KYC · subscription/billing · product-catalogue ·
pricing (MOQ & slabs) · search (index + query) · AI (recommendation, chat/agent, generation) ·
orders (multi-supplier split) · cart · transport-mapping · reports/analytics ·
WhatsApp/notifications · SEO/CMS · community · stories · admin/approvals · disputes · reviews ·
dead-stock/clearance · advance-booking · invoice/GST · feature-requests · QR/catalogue · media.

**Async workers (BullMQ on Redis)** handle anything slow or scheduled: Excel imports, search
re-indexing, AI generation (batchable), WhatsApp/SMS sending, daily report generation, demand
forecasting, embedding generation, invoice PDF rendering. Keeping these off the request path keeps
the API responsive.

---

## 4. Data layer

- **PostgreSQL** is the source of truth (orders, invoices, KYC, catalogue, subscriptions). It gives
  ACID transactions (critical for multi-supplier order split + payment + invoice), JSONB for
  flexible product attributes, and `pgvector` so semantic search lives next to the data at MVP scale.
- **Redis** for caching hot reads (category trees, supplier profiles, search facets), session/refresh
  storage, rate limiting, and as the BullMQ job broker.
- **Typesense** holds the searchable product/supplier index, rebuilt by an indexer worker on product
  changes. It owns typo-tolerance, faceting, and ranking; Postgres stays the system of record.
- **S3 + CloudFront** for all media; KYC documents go in a separate, access-restricted, encrypted
  bucket with audit logging.

Full entity model in doc 3.

---

## 5. Clients

- **Website (Next.js):** public catalogue, category/supplier/product pages (server-rendered for
  SEO), AI search, lead capture, login, and the customer/supplier dashboards' web equivalents. The
  **admin panel** is a separate Next.js app against the same API.
- **Customer & supplier apps (React Native + Expo):** native iOS/Android from one TS codebase.
  Expo gives fast builds and over-the-air JS updates (ship fixes without app-store review). Shared
  packages (API client, types, validation, design system) live in the monorepo so web and apps stay
  in sync.
- **Monorepo (pnpm/Turborepo)** layout, indicative:
  `apps/web`, `apps/admin`, `apps/customer`, `apps/supplier`, `apps/api`,
  `packages/types`, `packages/api-client`, `packages/ui`, `packages/config`.

---

## 6. AI strategy

The AI is the differentiator, so it gets its own section. Wrap all model calls behind an internal
**AI service** with a task-based interface (`generateProductCopy`, `answerBuyerQuestion`,
`scoreLead`, `forecastDemand`, `parseSearchQuery`, …). This lets you pick the cheapest capable
model per task and swap providers without touching product code.

### 6.1 Model tiering (Claude)

Use the right model for each job rather than one model everywhere. Current Claude line-up and list
pricing (per 1M tokens; verify live before launch as pricing changes):

| Model | Model ID | Context | Input | Output | Use for |
|---|---|---|---|---|---|
| **Claude Haiku 4.5** | `claude-haiku-4-5` | 200K | $1.00 | $5.00 | High-volume cheap tasks: classification, tagging, simple extraction, query normalisation, autocomplete |
| **Claude Sonnet 4.6** | `claude-sonnet-4-6` | 1M | $3.00 | $15.00 | The workhorse: most chat, product-copy/SEO generation, search-query understanding, report summaries |
| **Claude Opus 4.8** | `claude-opus-4-8` | 1M | $5.00 | $25.00 | The hardest reasoning: the agentic AI sales agent (multi-step, takes orders), supplier-matching, demand forecasting, sourcing |

Default to **Sonnet 4.6** for general work, drop to **Haiku 4.5** for cheap/bulk, escalate to
**Opus 4.8** only where multi-step reasoning genuinely pays off. This typically cuts AI spend by a
large factor versus running everything on the top model.

### 6.2 Cost-control patterns (build these in from day one)

- **Prompt caching** — cache stable prefixes (system prompt, supplier/catalogue context) so repeat
  calls pay ~0.1× on the cached portion (up to ~90% savings on that part). Essential for chat and
  per-supplier assistants.
- **Batches API** — for non-latency-sensitive bulk work (generating SEO descriptions for 100k
  products, nightly demand forecasts, report summaries) use the Batches API at **50% off**.
- **Tiered routing** — route each task to the cheapest capable tier (above).
- **Structured outputs** — use schema-constrained output for anything you parse (product attributes,
  extracted fields, lead scores) so results are reliable and don't need re-prompting.
- **Token discipline** — keep retrieved context tight; don't dump whole catalogues into prompts.

### 6.3 Search & multilingual

- **Keyword/faceted search:** Typesense handles exact/typo-tolerant matching and filters.
- **Semantic/AI search:** embed products with a **multilingual embedding model** (so Hindi, English,
  and Hinglish map into the same vector space) and store vectors in **pgvector**. At query time:
  understand intent (LLM, cheap tier) → retrieve by keyword (Typesense) + vector (pgvector) → blend
  & rank. This is standard hybrid retrieval and gives strong results for natural-language queries.
- **Hindi + English:** Claude is natively multilingual for understanding/generation; the embedding
  model handles bilingual retrieval. So "बेबी शावर सजावट" and "baby shower decoration" return the
  same products. (Anthropic does not sell an embeddings endpoint — use a dedicated embeddings
  provider such as Voyage AI, or a self-hosted multilingual model like BGE-M3, for the vector step.)
- **Voice search:** speech-to-text (managed STT) → the same text pipeline.
- **Image search:** Claude vision (or an image-embedding model) to turn a photo into a query/embedding,
  then hybrid retrieve.

### 6.4 Agentic features

The AI **sales agent** and **supplier assistant** are tool-using agents: the LLM is given tools
(`search_products`, `get_supplier`, `get_price_slab`, `create_inquiry`, `add_to_cart`,
`place_order`, …) and runs a controlled loop. Keep order-affecting tools **gated** (the agent
proposes; the user confirms) for safety. Lead scoring, demand forecasting, and clearance suggestions
are simpler request/response calls with structured output.

---

## 7. Integrations (and their gotchas)

- **Razorpay** — payments, UPI, cards; **subscriptions** via recurring mandates (e-NACH/UPI AutoPay)
  for the monthly customer plan and annual supplier plan. Handle webhooks idempotently; reconcile.
- **WhatsApp Business Platform via a BSP** — **the big compliance/cost item.** You must use
  **pre-approved message templates** for business-initiated messages and respect **opt-in** rules.
  Meta bills **per conversation/message** (marketing templates cost more than utility), so **bulk
  campaigns carry real per-message cost** — price that into the campaign revenue line (see doc 5).
  A BSP (AiSensy/Gupshup/Interakt/WATI) gives template management, opt-in tracking, and bulk tooling.
- **GST/PAN verification APIs** — for KYC automation (with manual admin override always available).
- **MSG91 / SMS** — OTP login + transactional SMS; OTP is the primary login for buyers/suppliers.
- **FCM** — push notifications to both apps.
- **Google Search Console** — for the SEO surfaces (doc 1 §14).

---

## 8. Scalability

The stated targets — **10,000 customers, 1,000 suppliers, 100,000+ products** — are **modest** for
this architecture; it's well within a single well-tuned Postgres + Typesense + Redis setup with
horizontally scaled stateless API instances. Concretely:

- **Stateless API** behind a load balancer → scale out by adding instances; sessions live in Redis,
  not memory.
- **PostgreSQL** handles 100k+ products and the order/transaction volume of thousands of B2B buyers
  comfortably; add read replicas for report-heavy reads when needed; partition large append-only
  tables (events, story views, notifications) later.
- **Typesense** indexes 100k–1M products with millisecond queries on a modest node; shard/replicate
  when traffic grows.
- **Async workers** absorb spikes (bulk imports, campaign sends, report runs) without touching the
  request path; scale workers independently.
- **Media** served from CDN, not the API.
- **AI** scales with usage/budget, not infra — managed by Anthropic; you control spend via tiering,
  caching, and batching (§6.2).

Headroom to 10× the stated scale is mostly configuration (bigger DB instance, more API/worker
replicas, search replicas), not re-architecture. See doc 6 for the direct Q&A.

---

## 9. Security & compliance

- **Sensitive KYC data** (Aadhaar, PAN, bank): encrypt at rest, restrict access by role, **audit
  every read**, and minimise retention. Store KYC documents in a dedicated locked-down bucket. Treat
  Aadhaar with particular care under Indian data norms.
- **Payments:** never store card data — Razorpay handles it (PCI scope stays with the gateway).
  Verify webhooks; make payment handlers idempotent.
- **AuthN/Z:** OTP login + JWT/refresh; strict RBAC on every endpoint; rate-limit OTP and login.
- **Data protection:** TLS everywhere; secrets in a manager (not code/env files in the repo);
  least-privilege IAM; backups + tested restore for Postgres.
- **Tenant isolation:** suppliers must only ever see their own leads/orders/analytics; enforce at the
  query layer, not just the UI.
- **Audit log:** approvals, KYC access, subscription changes, refunds, and admin actions are logged.
- **Abuse/spam:** WhatsApp opt-in enforcement; campaign approval gate; review moderation.

---

## 10. Environments & delivery

- **Environments:** local → staging → production, each with isolated DB/Redis/search/storage.
- **CI/CD:** lint + typecheck + test on every PR; automated deploys to staging; one-click/promote to
  production. Run DB migrations as a tracked, reversible step.
- **Infrastructure as code** (Terraform) once past the prototype so environments are reproducible.
- **Feature flags** for risky/phased features (Stories, AI agent, campaigns) so they can ship dark
  and roll out gradually.

---

## 11. Key architectural decisions to lock early

These are cheap to decide now and expensive to change later:

1. **TypeScript monorepo** (web + apps + API share types).
2. **PostgreSQL** as system of record; **multi-supplier order = parent order + per-supplier
   sub-orders** (doc 3) — get this right before any checkout code.
3. **Price slabs + MOQ + quantity-multiples** modelled as first-class data, computed server-side at
   cart/checkout — never trust client-side pricing.
4. **AI behind a task-based service interface** with tiered model routing + caching + batching.
5. **Search index is derived state** rebuilt from Postgres; never the source of truth.
6. **WhatsApp/SMS/AI/imports/reports run as async jobs**, never inline in requests.

Everything else can evolve. These six shape the data and money flows, so settle them in Phase 0.
