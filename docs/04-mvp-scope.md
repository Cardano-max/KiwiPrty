# 04 — MVP Scope

What to build first, what to defer, and how we'll know it worked. The MVP proves the core loop —
**a verified supplier lists products → a verified buyer discovers and orders → both sides get value
and pay** — without the breadth that would stretch the first release past ~5 months.

The brief itself proposes an MVP cut ("Start with only…"); this doc makes that precise with MoSCoW
prioritisation, an explicit out-of-scope list, and success metrics. Priorities trace back to doc 1.

---

## 1. MVP goal & guardrail

**Goal:** a working two-sided marketplace where suppliers self-list (after KYC approval), buyers
search and place real multi-supplier orders with GST invoices, subscriptions are collected, and both
sides get core analytics — with **AI search** live as the headline differentiator from day one.

**Guardrail:** if a feature isn't needed to prove that loop or to charge for it, it's not MVP. Depth
(advanced AI agent, Stories, community, full SEO, deep logistics) comes in later phases (doc 5).

---

## 2. MoSCoW summary

### Must have — the MVP (ship in Phase 1)
- **Accounts & KYC:** supplier & customer registration with document upload and admin
  approval workflow; OTP login; RBAC.
- **Subscriptions & billing:** supplier annual plan + customer monthly plan via Razorpay; GST
  invoicing; subscription status gates access.
- **Catalogue:** product CRUD with all core fields, images, **MOQ + quantity-multiples + price
  slabs**, stock & status; **Excel/CSV bulk import**; category/sub-category management.
- **Discovery:** keyword + faceted search; **AI search (text, Hindi + English)**; product
  comparison; **New Arrivals** and **Dead-Stock Clearance** sections.
- **Buying:** cart → **multi-supplier order split** → Razorpay payment → **per-supplier GST
  invoice**; order status & tracking; reorder.
- **Inquiries:** "Get best price" / inquiry to supplier; WhatsApp inquiry; supplier lead list.
- **WhatsApp/notifications:** order & inquiry alerts; renewal/payment reminders; push (FCM); OTP SMS.
- **Reports (core):** supplier daily sales/views/inquiries + product-wise views + conversion; admin
  KPIs (suppliers, customers, GMV, subscription revenue, active products).
- **Admin panel:** approvals, KYC verification, subscription control, product/category governance,
  order monitoring, payments, basic disputes.
- **Surfaces:** customer app, supplier app, admin panel, and an indexable public **website**
  (product/category/supplier pages render server-side).

### Should have — fast-follow (Phase 2)
AI **sales agent** (chat that recommends/quotes/assists) & AI **supplier assistant** (copy/SEO/
pricing/MOQ suggestions); voice & image search; recommendations ("similar", "buy together",
trending); RFQ/quotes; advance booking; reviews & ratings + trust score; daily supplier **WhatsApp
report**; abandoned-cart & follow-up messages; **bulk WhatsApp campaigns** (admin-approved); customer
reports; transport mapping + lightweight shipment tracking; proforma/estimate invoices; coupons.

### Could have — later (Phase 3+)
**Supplier Stories** (flagship — doc 7); live selling; community feed; full SEO programme (blog/CMS,
AI blog writer, city/festival landing pages, schema, GSC); AI demand forecasting & clearance
strategy; combo/kit builder; QR catalogues & PDF export; supplier API feed; credit limits; standalone
AI dashboard; transport-partner portal; loyalty/referrals.

### Won't have (yet)
"Party Influencer Stories" / sponsored creator content; B2C retail; cross-border; owning inventory;
commission-on-GMV billing.

---

## 3. MVP feature checklist (build-ready)

| Area | In MVP | Notes |
|---|---|---|
| OTP login + RBAC | ✅ | Mobile-OTP for buyers/suppliers; email/pass for staff |
| Supplier KYC + approval | ✅ | 3 mobiles, GST/PAN/Aadhaar/bank, docs, status workflow |
| Customer KYC + approval | ✅ | Multiple addresses, city-wise transport pref |
| Subscriptions (Razorpay) | ✅ | Supplier yearly + customer monthly; access gating |
| GST invoicing | ✅ | Per-supplier order invoice; sequential numbers |
| Product CRUD + media | ✅ | All core fields; images (video = Should) |
| MOQ / qty-multiples / price slabs | ✅ | Server-computed; doc 3 §A |
| Excel/CSV bulk import | ✅ | Template + validation + async (doc 6) |
| Categories / sub-categories | ✅ | Admin-managed |
| Keyword + faceted search | ✅ | Typesense |
| AI search (text, Hindi+English) | ✅ | Hybrid retrieval + LLM intent (doc 2 §6.3) |
| Product comparison | ✅ | Price/MOQ/stock/city/delivery |
| New Arrivals + Clearance sections | ✅ | Other curated sections = Should |
| Cart → multi-supplier order split | ✅ | doc 3 §B |
| Payment + order tracking + reorder | ✅ | Razorpay; status lifecycle |
| Inquiry / Get-best-price + WhatsApp inquiry | ✅ | Routed to supplier as lead |
| Supplier lead list | ✅ | AI scoring = Should |
| WhatsApp order/inquiry/renewal alerts | ✅ | Template-based; opt-in |
| Push (FCM) + OTP SMS | ✅ | |
| Supplier daily core reports | ✅ | Sales/views/inquiries/conversion |
| Admin KPIs | ✅ | Suppliers/customers/GMV/sub-revenue/active products |
| Admin panel (approvals/KYC/subs/orders/payments/disputes) | ✅ | |
| Customer app / Supplier app / Website / Admin | ✅ | 4 surfaces in MVP |
| AI sales agent / supplier assistant | ⛔→P2 | Fast-follow |
| Voice/image search, recommendations | ⛔→P2 | |
| Reviews, RFQ, advance booking, campaigns | ⛔→P2 | |
| Stories, community, full SEO, forecasting | ⛔→P3 | |

---

## 4. Why these are the cut lines

- **AI search is in, the AI agent is out (for MVP).** AI search is the headline buyers will judge the
  product on, and it's well-bounded (a retrieval + ranking pipeline). The agentic sales/supplier
  assistants are higher-effort, higher-risk (tool use, order actions) and land cleanly in Phase 2
  once the catalogue and order data exist for them to act on.
- **Multi-supplier orders + GST invoicing are in.** They're the heart of the buying loop and the
  hardest data design (doc 3 §§B, C) — building them late would force rework. Better to nail them in
  the MVP.
- **Stories, community, and full SEO are out.** High value but additive; they don't gate the core
  loop and each is a meaningful build. SEO can begin minimally (indexable pages) in MVP and grow.
- **Reports are core-only.** Enough for suppliers to see value and admins to run the business; the
  long report list (city/festival demand, repeat-order, campaign analytics) follows the data.

---

## 5. MVP success metrics

Track from day one; they decide whether to widen scope.

**Activation / supply**
- ≥ N suppliers KYC-approved and live with ≥ 20 products each.
- ≥ X total active products indexed and searchable.
- Median time from supplier signup → first product live.

**Demand / core loop**
- ≥ M customers KYC-approved and subscribed.
- Search → product-view → inquiry → order **conversion** at each step.
- ≥ first real **multi-supplier orders** placed with GST invoices generated.
- Reorder rate (repeat buyers).

**Monetisation**
- Supplier & customer subscriptions collected (₹ MRR/ARR); renewal intent.
- Subscription payment success rate (Razorpay).

**AI quality**
- AI-search result relevance (click-through on AI results; "no good result" rate).
- Hindi/English/Hinglish query coverage (share of queries answered well).

**Health**
- Crash-free sessions (apps); API p95 latency; uptime.
- AI spend per active user (validate the cost-control patterns in doc 2 §6.2).

---

## 6. Explicit out-of-scope for MVP

To keep the release tight, the MVP **excludes**: the AI sales/supplier agents, voice/image search,
recommendations & "buy together", RFQ/quotes, advance booking, reviews/trust score, bulk WhatsApp
campaigns & festival promos, the full report catalogue, Supplier Stories & live selling, community
feed, the full SEO programme (blog/CMS/city-festival pages/AI writer), demand forecasting, combo
builder, QR/PDF catalogues, supplier API feed, credit limits, transport-partner portal, and
loyalty/referrals. All are scheduled in doc 5.

---

## 7. Definition of done (MVP)

The MVP is done when, end-to-end in production: a supplier can register → pass KYC → subscribe →
bulk-upload products with slabs/MOQ; a customer can register → pass KYC → subscribe → search
(keyword + AI, Hindi/English) → compare → build a multi-supplier cart → pay → receive per-supplier
GST invoices → track and reorder; both get core reports and WhatsApp/push alerts; and admin can run
approvals, KYC, subscriptions, and order/payment oversight — all on stable, monitored infrastructure.
