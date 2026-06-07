# Kiwi Party — MVP Core (web + API)

A **runnable, tested** implementation of the Kiwi Party AI marketplace core: the real B2B buying
loop with the hard parts done for real — price slabs / MOQ / quantity-multiples, the **multi-supplier
order split**, and **per-supplier GST invoicing** — plus supplier and admin surfaces, an OTP auth
flow, and a JSON API for future mobile apps.

This is the MVP slice of the larger plan in [`/docs`](../../docs). It is **not** the full
150-feature platform (see _What's implemented vs not_ below), but everything here genuinely works:
the build is green, the domain logic is unit-tested, and the end-to-end flow has been smoke-tested.

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · Prisma 6 · SQLite (dev) · Tailwind · Vitest ·
`jose` (JWT). SQLite keeps local dev zero-config; the Prisma schema is written to port to
PostgreSQL for production (see [`../../docs/02-architecture-and-tech-stack.md`](../../docs/02-architecture-and-tech-stack.md)).

## Run it

```bash
cd apps/web
cp .env.example .env          # SQLite + dev JWT secret + dev OTP
npm install                   # installs deps & generates the Prisma client
npm run setup                 # prisma generate + db push + seed demo data
npm run dev                   # http://localhost:3000
```

Other scripts: `npm run build`, `npm run start`, `npm test`, `npm run typecheck`,
`npm run db:reset` (wipe + re-push), `npm run seed`.

## Demo accounts

Login is OTP-based; in development the OTP is fixed to **`123456`** (no SMS provider needed).

| Role | Phone | Sees |
|---|---|---|
| 🛍️ Buyer | `9000000001` | Marketplace, cart, checkout, orders |
| 🏭 Supplier | `9000000010` | Dashboard, products, orders, leads |
| 🛠️ Admin | `9000000099` | KPIs, supplier/customer KYC approvals |

Try the loop: log in as the **buyer** → search/browse → open a product → add to cart (note MOQ &
price slabs) → add a product from a **different supplier** → open the cart (it splits per supplier)
→ place order → see the order with **one GST invoice per supplier**. Then log in as the **supplier**
to see the order and lead, or the **admin** to approve the pending supplier ("New Era Party Imports").

## What's implemented

- **Auth & roles** — OTP login (dev OTP), JWT session cookie + Bearer for the API, RBAC (customer /
  supplier / admin), registration for buyers and suppliers (suppliers start pending KYC).
- **Catalogue** — categories, products with images, **price slabs**, MOQ, quantity-multiples, stock,
  tags; keyword + faceted search (category / city / tag / sort) with pagination.
- **AI search** — natural-language queries parsed into filters (price ceiling, category, city, tags),
  e.g. "baby shower decoration under ₹5000"; deterministic fallback, Claude-powered with a key.
- **Reviews & ratings** — verified-purchase-gated product reviews, product rating + supplier trust
  score derived from them.
- **Wishlist** — buyers save products; ♥ toggle + `/wishlist`.
- **Reports** — buyer purchase report (spend by supplier/category) and supplier analytics
  (view→inquiry→order funnel, top products, city-wise demand).
- **Public supplier profile** — `/suppliers/[id]` with badges, trust score, stories and products.
- **Pricing & ordering (the hard parts, unit-tested)** — server-side slab resolution + MOQ/multiple
  validation + GST math; **multi-supplier cart → per-supplier order split**; **sequential GST
  invoice per supplier order**; stock decrement; reorder-ready order history.
- **Inquiries / leads** — "Get best price" inquiries routed to suppliers with heuristic hot/warm/cold
  **lead scoring**.
- **Supplier Stories (flagship)** — visual story feed (24h expiry + permanent highlights), story
  detail with add-to-cart / get-best-price CTAs, per-customer **view tracking**, story-attributed
  leads, and a supplier "post story + analytics (views / leads)" manager. See `docs/07`.
- **Supplier** — dashboard (views / orders / inquiries / sales), product list, add-product form
  with **AI "Generate description"**, order status management.
- **AI seam** — `generateProductDescription` uses **Claude** when `ANTHROPIC_API_KEY` is set and a
  deterministic fallback otherwise, so it always works and upgrades to LLM output with a key
  (`POST /api/ai/describe`). This is the task-based AI service pattern from docs/02 §6.
- **Admin** — platform KPIs (suppliers, customers, GMV, subscription revenue) and **KYC approval**
  workflow with audit logging.
- **Subscriptions** — supplier (yearly) and buyer (monthly) plans seeded; subscription revenue in
  admin KPIs. (Razorpay wiring is a deferred integration — see below.)
- **AI sales assistant** — `/assistant` chat + `/api/ai/chat` (Claude when configured, product-search
  fallback that reuses the AI query parser).
- **Notifications** — in-app bell + `/notifications`, fired on inquiry & order events (also WhatsApp
  when configured). **Daily report** cron at `/api/cron/daily-report`.
- **REST API** — health, products, product detail, auth otp/login, cart, checkout, orders, ai/describe,
  ai/chat, payments (Razorpay order + webhook) — Bearer-auth where needed, for mobile clients.

### Integrations (env-gated — fill `.env` to go live)

Every integration uses the **real API when its keys are set, and a working dev fallback otherwise**,
so nothing is blocked while keys are pending. See `.env.example` for the full list.

| Integration | Env keys | Real behaviour | Dev fallback |
|---|---|---|---|
| **Claude AI** | `ANTHROPIC_API_KEY` | Descriptions, search parsing, assistant via Claude | Deterministic logic |
| **OTP/SMS** (MSG91) | `MSG91_AUTH_KEY`, … | OTP generated + SMS-sent, verified from DB | Fixed `DEV_OTP` accepted |
| **Payments** (Razorpay) | `RAZORPAY_KEY_ID/SECRET/WEBHOOK_SECRET` | Order-intent API + webhook capture | Checkout records a mock payment |
| **WhatsApp** (Cloud API) | `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID` | Order/inquiry/report messages | In-app notification only |
| **Daily report** | `CRON_SECRET` | Scheduler POSTs the endpoint | Disabled (401) |

## Tests

```bash
npm test
```

24 unit tests covering the domain core: price-slab resolution, MOQ/quantity-multiple validation,
GST/line math, the multi-supplier order split, Indian-rupee formatting, invoice numbering, and lead
scoring (`src/domain/*.test.ts`).

## Project layout

```
src/
  domain/          pure, I/O-free business logic (+ tests) — pricing, order split, money, invoice
  server/          db client, auth, session, mappers
    services/      catalog · cart · orders · suppliers · admin · inquiries · account
    actions.ts     server actions (login, cart, checkout, inquiry, product, admin)
  app/             App Router pages + /api route handlers
  components/      Header, ProductCard, UI primitives
prisma/
  schema.prisma    the data model (docs/03)
  seed.ts          realistic party-supplies demo data
```

## What's NOT in this slice (deferred — see /docs roadmap)

Razorpay, WhatsApp, SMS/OTP and Claude are **fully wired but env-gated** (table above) — add keys to
go live; until then the dev fallbacks keep everything working. Not yet built: **React Native mobile
apps**, semantic/vector AI search, live selling & community, and full SEO depth (blog/CMS, city/
festival landing pages). The client-side Razorpay Checkout widget is the one remaining wire to take
real card capture end-to-end (the backend order-intent + webhook are done). These are scoped in
[`../../docs/04-mvp-scope.md`](../../docs/04-mvp-scope.md) and
[`../../docs/05-roadmap-and-estimates.md`](../../docs/05-roadmap-and-estimates.md).

## Production notes

- Swap `DATABASE_URL` to PostgreSQL and change the Prisma `datasource` provider to `postgresql`
  (the schema is written to port cleanly; JSON-string list fields can become native arrays).
- Move keyword search to Typesense and add pgvector for semantic/AI search (docs/02).
- Wire Razorpay (payments + subscription mandates) and a WhatsApp BSP + MSG91 (OTP/SMS) behind the
  existing `account`/`orders` service seams.
- Set a strong `JWT_SECRET`; put media on S3/CloudFront; add rate limiting on auth endpoints.
