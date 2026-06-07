# 03 — Data Model

The core entities, how they relate, and the parts that are easy to get wrong (multi-supplier
orders, price slabs/MOQ, subscriptions, KYC, stories). This is a logical model to implement in
PostgreSQL — field lists are indicative, not exhaustive DDL. Get the relationships and the four
"tricky parts" (§) right before writing checkout, billing, or KYC code.

Conventions: every table has `id` (UUID), `created_at`, `updated_at`; soft-delete via `deleted_at`
where history matters; money in **integer paise** (never floats); enums as Postgres enums or
constrained text.

---

## 1. Entity map (high level)

```
User ──< StaffRole                         (admin/sales/support)
User ──1:1── SupplierProfile ──< Product ──< ProductImage / ProductVideo
                  │                 │
                  │                 ├──< PriceSlab
                  │                 └──< Story ──< StoryView
                  ├──< KycDocument
                  └──< Subscription ──< Payment ──< Invoice

User ──1:1── CustomerProfile ──< Address
                  ├──< KycDocument
                  ├──< Subscription
                  ├──< Cart ──< CartItem
                  ├──< Order(parent) ──< SupplierOrder ──< OrderItem
                  ├──< Inquiry / Rfq ──< Quote
                  ├──< Review
                  ├──< Favorite (supplier|product)
                  └──< Lead (scored)  ▶ seen by Supplier

Category ──< Category (self, sub-categories) ──< Product
WhatsAppCampaign ──< CampaignMessage
Notification · DisputeTicket · FeatureRequest · AuditLog · TransportRoute
```

---

## 2. Identity & roles

### `User`
`id · phone (unique, OTP login) · email · password_hash (staff only) · primary_role
(customer|supplier|admin|sales|support|logistics) · status (active|suspended) · last_login_at`

- One `User` is **one login**. Buyer/supplier specifics live in their profile table.
- Staff can hold extra roles via `StaffRole (user_id, role)` for fine-grained internal permissions.

### `RolePermission` / RBAC
Map role → permissions (e.g. `kyc.approve`, `product.approve`, `campaign.approve`, `dispute.manage`).
Enforce on every endpoint. Suppliers and customers see **only their own** data — enforce at the
query layer.

---

## 3. Supplier

### `SupplierProfile`
`user_id · company_name · business_type (manufacturer|importer|wholesaler) · gst_number ·
pan_number · aadhaar_ref (tokenised) · email · address · city · state · warehouse_location ·
logo_url · visiting_card_url · upi_qr_url · transport_details · categories[] ·
kyc_status (draft|submitted|under_review|approved|rejected) · verified_badges[] · trust_score ·
plan_status`

### `SupplierMobile`
`supplier_id · phone · is_primary` — supports the **3 mobile numbers** requirement (one-to-many,
not three columns).

### `KycDocument` (shared by supplier & customer)
`owner_type (supplier|customer) · owner_id · doc_type (gst|pan|aadhaar|bank|cheque|other) ·
file_url (locked bucket) · status · reviewed_by · reviewed_at · notes`

> KYC docs live in an access-restricted, encrypted bucket; every read is audit-logged (doc 2 §9).

---

## 4. Customer

### `CustomerProfile`
`user_id · shop_name · owner_name · gst_number · pan_number · aadhaar_ref (tokenised) ·
business_category (party_shop|decorator|event_planner|wholesaler) · city · state · kyc_status ·
plan_status`

### `Address`
`customer_id · type (billing|delivery) · line1 · line2 · city · state · pincode · is_default ·
transport_preference` — supports **multiple delivery addresses** and **city-wise transport**.

---

## 5. Catalogue

### `Category`
`name · slug · parent_id (self-ref for sub-categories) · icon_url · seo_title · seo_description ·
sort_order · is_active`

### `Product`
`supplier_id · category_id · name · slug · sku · description · ai_description · seo_title ·
seo_description · base_price_paise · gst_percent · moq · quantity_multiple · stock_quantity ·
packing_details · size · material · color · design · weight_grams · delivery_time_days ·
service_city · transport_option · return_policy · status (active|inactive|out_of_stock) ·
tags[] (e.g. clearance, dead_stock, festival:diwali, new_arrival) · embedding (pgvector) ·
view_count · inquiry_count · order_count`

### `ProductImage` / `ProductVideo`
`product_id · url · sort_order · alt_text` (alt_text feeds image SEO).

### `ProductVariant` *(phase: Should)*
`product_id · attributes (jsonb) · sku · price_override_paise · stock_quantity`

---

## § Tricky part A — Pricing: MOQ, quantity multiples, price slabs

This is core B2B logic and a common source of bugs. Model it explicitly and **compute on the
server**; never trust client-supplied prices.

### `PriceSlab`
`product_id · min_qty · max_qty (nullable for open-ended top slab) · unit_price_paise`

Example for one product: `1–99 → ₹12`, `100–299 → ₹10`, `300+ → ₹8`.

Rules enforced at add-to-cart and checkout:
- **MOQ:** ordered qty ≥ `product.moq`.
- **Quantity multiple:** ordered qty is a multiple of `product.quantity_multiple` (e.g. multiples of
  5, or of 100).
- **Slab selection:** unit price = the slab whose `[min_qty, max_qty]` contains the ordered qty.
- **GST:** applied on the line subtotal per `gst_percent`.

Persist the **resolved unit price + GST** onto the order line at checkout (don't recompute later from
the live product — prices change).

---

## 6. Cart

### `Cart` / `CartItem`
`Cart: customer_id (one active cart)`
`CartItem: cart_id · product_id · supplier_id · quantity · resolved_unit_price_paise (snapshot) ·
notes`

The cart is naturally **multi-supplier** — items reference their supplier so checkout can split.

---

## § Tricky part B — Multi-supplier orders (the order split)

A single buyer checkout that contains products from several suppliers must become **one order per
supplier**, because each supplier fulfils, invoices, and is paid separately — but the buyer sees one
transaction. Model a parent order with per-supplier sub-orders:

### `Order` (parent — the buyer's checkout)
`customer_id · total_amount_paise · payment_status · placed_at`

### `SupplierOrder` (one per supplier in that checkout)
`order_id (parent) · supplier_id · status (new|accepted|packed|dispatched|delivered|cancelled) ·
subtotal_paise · gst_paise · total_paise · transport_route_id · dispatch_info · invoice_id`

### `OrderItem`
`supplier_order_id · product_id · quantity · unit_price_paise (snapshot) · gst_percent ·
line_total_paise`

Flow: buyer checks out → create `Order` → group cart items by `supplier_id` → create a
`SupplierOrder` + `OrderItem`s per group → take **one payment** against the parent `Order` →
generate **one GST invoice per `SupplierOrder`**. Status tracking, dispatch, and reorder all operate
at the `SupplierOrder` level; the buyer's order history shows the parent with its sub-orders.

Wrap order creation + payment record + invoice generation in a **DB transaction** (this is why
Postgres). `reorder` clones a past `Order`'s items back into the cart, re-resolving prices/MOQ.

---

## 7. Inquiries, RFQ, leads

### `Inquiry`
`customer_id · product_id · supplier_id · message · channel (in_app|whatsapp) · status` —
the "Get best price" / inquiry action.

### `Rfq` / `Quote` *(phase: Should)*
`Rfq: customer_id · category_id · requirement · target_qty · status`
`Quote: rfq_id · supplier_id · price_paise · moq · notes · status`

### `Lead`
`supplier_id · customer_id · source (story|product_view|inquiry|cart) · score (hot|warm|cold) ·
signals (jsonb: products_viewed, categories, time_spent, messages) · last_activity_at`

Leads are what the supplier acts on; **AI lead scoring** writes `score` + `signals` (doc 2 §6.4,
doc 7).

---

## § Tricky part C — Subscriptions, payments, invoices

Three different money flows share plumbing but mean different things; keep them distinct.

### `SubscriptionPlan`
`name · audience (supplier|customer) · price_paise · gst_percent · interval (monthly|yearly) ·
features (jsonb)` — e.g. supplier ₹1,20,000/yr, customer ₹3,000/mo.

### `Subscription`
`subscriber_type (supplier|customer) · subscriber_id · plan_id · status
(trialing|active|past_due|cancelled|expired) · current_period_start · current_period_end ·
razorpay_subscription_id · auto_renew`

### `Payment`
`payable_type (subscription|order|addon) · payable_id · amount_paise · razorpay_payment_id ·
status (created|paid|failed|refunded) · method · raw_webhook (jsonb)`

- **Subscription payments** (supplier annual / customer monthly) via Razorpay recurring mandates.
- **Order payments** against parent `Order` (Tricky part B).
- **Add-on payments** (featured listing, campaign, festival promo) reference the add-on purchase.
- Payment handling is **idempotent** off Razorpay webhooks; reconcile by `razorpay_payment_id`.

### `Invoice`
`type (gst_invoice|proforma|estimate) · supplier_order_id (for order invoices) ·
subscription_id (for subscription invoices) · number (sequential, immutable) · pdf_url ·
amount_paise · gst_breakup (jsonb) · issued_at`

> Invoice numbers must be sequential and never reused — generate inside the order/subscription
> transaction. One GST invoice per `SupplierOrder` (each supplier bills the buyer directly).

---

## 8. Add-ons & marketing

### `AddonPurchase`
`buyer_type (supplier) · buyer_id · addon_type (featured|sponsored|lead_boost|festival_promo|banner) ·
target_ref (product_id/category/etc.) · price_paise · status · starts_at · ends_at · payment_id`

### `WhatsAppCampaign` / `CampaignMessage`
`WhatsAppCampaign: supplier_id (or admin) · name · template_id · audience_filter (jsonb) ·
status (draft|pending_approval|approved|sending|completed|rejected) · counts (sent/delivered/read/
responded)`
`CampaignMessage: campaign_id · recipient_phone · status · meta_message_id · cost_paise`

> `cost_paise` per message matters — Meta bills per conversation; this lets you reconcile campaign
> cost vs. the campaign revenue line (doc 5).

---

## § Tricky part D — Supplier Stories (flagship; full spec in doc 7)

### `Story`
`supplier_id · type (photo|video|product|offer|poll|countdown|festival) · media_url · caption ·
linked_product_id (nullable) · offer (jsonb: discount, valid_till) · poll (jsonb) ·
countdown_ends_at · tags[] (category, city, festival) · is_highlight · expires_at (24h unless
highlight) · view_count · message_count · inquiry_count · order_count`

### `StoryView`
`story_id · customer_id · viewed_at · dwell_ms`

Analytics (views, unique viewers, viewer city/category, messages/inquiries/orders, conversion,
revenue) are aggregated from `StoryView` + linked `Inquiry`/`Order`. The high-write `StoryView`
table is a candidate for partitioning/rollups at scale (doc 2 §8). Customer story actions (DM,
get-best-price, wishlist, cart, save, share, follow) map to `Inquiry`, `CartItem`, `Favorite`, and a
`Follow (customer_id, supplier_id)` edge.

---

## 9. Trust, community, support

- `Review` — `author_customer_id · target_type (product|supplier) · target_id · rating(1–5) · text ·
  status(pending|published|rejected)`; supplier `trust_score` derived from reviews + order
  fulfilment + verification.
- `Favorite` / `Follow` — buyer ↔ product/supplier edges.
- `CommunityPost` *(phase: Could)* — feed posts, polls, announcements.
- `DisputeTicket` — `order_id · raised_by · against · type · status · messages[]`.
- `FeatureRequest` — `submitted_by · title · detail · status · votes`.
- `Notification` — `user_id · channel (push|sms|email|whatsapp|in_app) · type · payload · read_at`.
- `AuditLog` — `actor_user_id · action · entity_type · entity_id · before/after (jsonb) · at`
  (approvals, KYC reads, refunds, admin actions).

---

## 10. Transport & reports

- `TransportRoute` — `supplier_id (or customer_id) · from_city · to_city · transporter_name ·
  contact · est_days`; supports city-wise/supplier-wise mapping + auto-selection.
- `Shipment` *(phase: Should)* — `supplier_order_id · transporter · tracking_ref · status · events[]`.
- **Reports** are mostly **computed**, not stored — aggregate from orders/inquiries/views/payments.
  Cache expensive aggregations in Redis and/or maintain rollup tables (e.g. `DailySupplierStats`:
  `supplier_id · date · views · inquiries · orders · sales_paise`) populated by the nightly report
  job, which also feeds the daily WhatsApp report (doc 6).

---

## 11. Indexing & search

- Postgres: index FKs, `status`, `tags` (GIN), `slug` (unique), `Product.embedding` (pgvector
  ivfflat/hnsw), and the hot report columns (`supplier_id, created_at`).
- Typesense: a denormalised product document (name, description, category, supplier, city, price,
  moq, tags, popularity signals) rebuilt by the indexer worker on product changes — derived state,
  never the source of truth (doc 2 §4).

---

## 12. What to build first (data-wise)

Phase 0 should stand up: `User` + RBAC, `SupplierProfile`/`CustomerProfile` + `KycDocument`,
`Category`/`Product`/`PriceSlab` + images, `Cart`, the **`Order`/`SupplierOrder`/`OrderItem`**
split, `Subscription`/`Payment`/`Invoice`, and `AuditLog`. Those are the load-bearing tables — the
four tricky parts (A–D) all touch them. Everything else (stories, community, RFQ, shipments) layers
on cleanly afterward. Build order is in doc 5.
