# 01 — Product Requirements (PRD)

Kiwi Party AI — AI Party-Supplies Search Engine & B2B Multivendor Marketplace.

This document organises the full product vision into a structured PRD: the problem and vision,
the people who use it, the business model, and the complete feature set grouped by domain with
priority tags. Prioritisation drives the MVP (doc 4); estimates follow in doc 5.

Priority legend (MoSCoW): **[M]** Must (MVP) · **[S]** Should (fast-follow) · **[C]** Could (later) · **[W]** Won't-yet (future vision).

---

## 1. Vision & problem

India's party-supplies trade (balloons, decorations, birthday/baby-shower kits, return gifts,
festival décor, props) is large, highly visual, and fragmented across manufacturers, importers,
and wholesalers. Buyers — party shops, decorators, event planners — source by phone, WhatsApp,
and physical mandi visits. Discovery is slow, price comparison is manual, dead stock is hard to
clear, and there is no trusted, searchable, India-wide catalogue.

**Kiwi Party AI** makes party-product sourcing *searchable, comparable, and AI-assisted*:

- **For buyers:** find the right product across verified suppliers in seconds — by text, voice,
  photo, event, or festival — compare price/MOQ/stock/city/delivery, and order from multiple
  suppliers in one place.
- **For suppliers:** a digital storefront in front of a verified buyer base, with leads, orders,
  analytics, dead-stock clearance, WhatsApp campaigns, and an AI assistant that writes listings,
  prices products, and predicts demand.

**Positioning:** IndiaMART's reach + Nivoda's verified-supplier/one-place-sourcing rigour + a
conversational AI shopping agent — specialised for one vertical (party supplies) so the catalogue,
search, and AI are tuned to it.

**North-star outcome:** a supplier's primary reason to pay is that Kiwi Party reliably brings them
qualified orders they wouldn't otherwise get; a buyer's reason to pay is faster, cheaper, more
reliable sourcing than phone/WhatsApp.

---

## 2. User roles

| Role | Who | Core needs |
|---|---|---|
| **Customer (Buyer)** | Party shops, decorators, event planners, regional wholesalers | Discover, compare, order, reorder, track; manage city-wise transport; see clearance deals |
| **Supplier (Seller)** | Manufacturers / importers / wholesalers **only** (verified) | List products, manage stock/leads/orders, run campaigns, see analytics, get AI help |
| **Admin** | Platform operator | Approvals, KYC, subscriptions, catalogue/category governance, payments, disputes, reports |
| **Sales team** | Kiwi Party staff | Onboard suppliers/customers, manage renewals, upsell add-ons, track pipeline |
| **Support team** | Kiwi Party staff | Tickets, disputes, KYC assistance, account help |
| **Transport / logistics partner** | 3PL / transporters | Receive dispatch info, update shipment status (lightweight in early phases) |

Roles are enforced by a single role-and-permission system (see doc 3). One person/account may hold
multiple staff roles.

---

## 3. Business model & monetisation

### Core subscriptions
- **[M]** Supplier plan: **₹1,00,000 / ₹1,20,000 + GST per year** (tiered).
- **[M]** Customer plan: **₹3,000 + GST per month** (premium access to wholesale suppliers, AI
  assistant, advance booking, clearance offers).

### Add-on revenue (all gated behind admin approval where they touch buyers)
- **[S]** Featured supplier placement
- **[S]** Sponsored product listings
- **[S]** Bulk WhatsApp campaigns (priced per campaign; note: carries real per-message Meta cost — see doc 5)
- **[S]** Festival promotion packages & festival pre-booking campaigns
- **[C]** Lead boost
- **[C]** Banner ads
- **[C]** Premium reports / analytics
- **[C]** Customer requirement broadcast to suppliers (RFQ blast)

> Commission on GMV is **not** part of the stated model (subscription + ads). The data model still
> records order value so commission could be introduced later if desired.

---

## 4. Onboarding & KYC

### 4.1 Supplier registration **[M]**
Collect and verify: company name; business type (**Manufacturer / Importer / Wholesaler** — these
only); GST number; PAN; Aadhaar; bank account; **3 mobile numbers**; email; address + city +
warehouse location; product categories; transport details; UPI/QR; logo; visiting card.

- **[M]** Document upload + status workflow: `Draft → Submitted → Under review → Approved / Rejected`.
- **[S]** Automated GST/PAN format validation and (where available) verification-API checks; manual
  override by admin always available.
- Verified badges: GST-verified, Manufacturer / Importer badge, trust score (see §10).

### 4.2 Customer registration **[M]**
Collect: shop/company name; owner name; mobile; GST; PAN; Aadhaar; billing address; **multiple
delivery addresses**; city; state; **city-wise transport preferences**; business category (party
shop / decorator / event planner / wholesaler).

- **[M]** Monthly subscription payment to activate buying.
- **[M]** Admin/sales approval workflow mirroring suppliers.

> **Compliance note:** Aadhaar and bank data are sensitive. Store encrypted, access-logged, and
> minimise what's retained. See doc 2 §security.

---

## 5. Product catalogue

### 5.1 Product fields **[M unless noted]**
Name; category; sub-category; SKU; images (multiple); video **[S]**; price; **MOQ**; **quantity
multiples** (e.g. 5-10-15 or 100-200-300); **price slabs** (qty → unit price); GST %; stock
quantity; packing details; size; material; colour; design; weight; delivery time; serving city;
transport option; return policy; **clearance / dead-stock tag**; festival tag **[S]**; product
status (active/inactive/out-of-stock).

### 5.2 Catalogue management
- **[M]** Unlimited product upload.
- **[M]** **Excel/CSV bulk import** with template, validation, and async processing (see doc 6).
- **[M]** Stock management; product status.
- **[S]** Product variants & attribute sets.
- **[S]** Product clone / duplicate.
- **[S]** AI-generated product description & SEO copy (see §9).
- **[C]** Digital catalogue builder + PDF catalogue export; product/shop **QR codes**.
- **[C]** Supplier-facing API feed for very large catalogues.

### 5.3 Categories
~35 categories / 800+ products at launch scale (Balloons, Decorations, Return Gifts, Birthday,
Baby Shower, Anniversary, Party Props, Welcome Baby, Haldi, Mehndi, Bride/Groom To Be, Foil/Latex
Balloons, Curtains, Cake Toppers, Party Poppers, LED Lights, Theme Kits, …). **[M]** Category &
sub-category management lives in admin.

---

## 6. Discovery & search

- **[M]** Keyword search across products, categories, suppliers.
- **[M]** Faceted filters: category, city, price, MOQ, stock, supplier, delivery time, tags.
- **[M]** **AI search** (text) — natural-language and event/festival queries
  (e.g. "baby shower decoration under ₹5000", "Diwali wholesale décor in Surat").
- **[M]** **Hindi + English** (and Hinglish) query understanding.
- **[S]** Voice search.
- **[S]** **Image search** ("search by photo").
- **[M]** Product comparison (side-by-side price/MOQ/stock/city/delivery).
- **[S]** Recommendations: similar products, alternatives, "buy together", trending, best-selling,
  festival-trending, higher-margin suggestions.
- **[C]** Saved searches & search-keyword reports.

Discovery surfaces also include curated sections: **New Arrivals**, **Trending**, **Hot Offers**,
**Dead Stock Clearance / Liquidation**, **Factory Direct**, **Fast Moving** **[M for at least
New Arrivals + Clearance; S for the rest]**.

---

## 7. Buying: cart, orders, invoicing

- **[M]** Cart, wishlist/favourites (products & suppliers).
- **[M]** **Multi-supplier cart** that **splits into one order per supplier** at checkout.
- **[M]** MOQ rules + quantity-multiple enforcement + price-slab calculation at cart/checkout.
- **[M]** Checkout with **Razorpay**; order status lifecycle; order tracking.
- **[M]** **GST invoice** generation per supplier order; estimate/proforma **[S]**; delivery
  challan / purchase order **[C]**.
- **[M]** Reorder previous order; **[S]** advance order booking / pre-order.
- **[S]** Coupons/offers; "buy together" bundles.
- **[S]** Transport selection per city; saved transporters.
- **[S]** Returns / refund requests; dispute tickets.
- **[C]** Credit-limit requests; negotiation/RFQ-to-order flow.

---

## 8. Inquiries, RFQ & leads

- **[M]** Inquiry / "Get best price" on a product → routed to supplier as a lead.
- **[M]** WhatsApp inquiry & live chat with supplier; **[S]** AI chat with supplier.
- **[S]** RFQ system: buyer posts a requirement; suppliers respond with quotes.
- **[S]** Bulk inquiry across suppliers; **[C]** buyer-requirement broadcast.
- **[S]** Supplier **lead list** with **AI lead scoring** (hot/warm/cold — see §9 and doc 7).

---

## 9. AI features

The differentiator. Threaded across discovery, selling, and operations. Architecture & model
choices in doc 2 §AI.

### Buyer-facing
- **[M]** AI product search (text; Hindi+English) and AI recommendations.
- **[S]** AI sales agent: suggests products, builds combo kits, answers product questions, takes
  orders via chat, recommends a supplier by city/price/stock/delivery, follows up abandoned carts,
  sends reorder reminders.
- **[S]** Voice & image search.
- **[C]** AI decoration-kit / combo builder, AI product sourcing & supplier matching.

### Supplier-facing
- **[S]** AI supplier assistant: writes product titles/descriptions/SEO/hashtags; suggests pricing
  vs. competition; suggests MOQ & slabs; flags trending products; suggests dead-stock clearance
  strategy.
- **[S]** AI demand forecasting (festival-wise, city-wise) & dead-stock clearance suggestions.
- **[C]** AI business consultant.

### Platform / ops
- **[S]** AI report summaries (daily sales/inquiry/views; slow- & fast-moving alerts; reorder
  prediction).
- **[S]** AI WhatsApp message generator; **[C]** AI blog/SEO content generator.
- **[S]** AI customer-support chatbot.

---

## 10. Marketplace trust & community

- **[M]** Supplier profiles (logo, categories, location, badges).
- **[M]** Verified-supplier badge; Manufacturer/Importer badge.
- **[S]** Ratings & reviews (product and supplier); supplier **trust score**; top-supplier leaderboard.
- **[C]** Community feed: product-launch posts, festival trend updates, announcements, buyer
  requirement posts, polls, training videos, live demos.
- **[W]** "Party Influencer Stories" — decorators/event planners post content; suppliers sponsor it.

---

## 11. Supplier Stories (flagship — full spec in doc 7)

Instagram-Stories-style visual selling: photo/video/product/offer/poll/countdown/festival stories;
24h + permanent highlights; customer actions (DM, WhatsApp, get-best-price, wishlist, cart, save,
share, follow); per-story analytics (views, unique viewers, viewer city/category, messages,
inquiries, orders, conversion, revenue); AI "Generate Story"; story discovery by category/city/
festival; live selling; story marketplace sections. Phased as **[C]** after the marketplace core
is solid — see doc 4 and doc 7.

---

## 12. WhatsApp & notifications

Official **WhatsApp Business Platform** via a BSP (see doc 2). Template/opt-in compliance required.

- **[M]** Order alerts, inquiry alerts (to supplier).
- **[M]** Subscription/renewal & payment reminders.
- **[S]** Daily supplier report (sales, views, inquiries, pending orders, trending/festival demand).
- **[S]** Customer follow-up, abandoned-cart messages.
- **[S]** **Bulk WhatsApp campaigns** & festival broadcasts (admin-approved; metered cost).
- **[M]** In-app push (FCM), **[S]** SMS (OTP + transactional), **[S]** email.

---

## 13. Reports & analytics

### Supplier **[M for daily core; S for the rest]**
Daily sales / inquiries / views; product-wise views & "who viewed"; order conversion
(view→inquiry→order); customer repeat-order; city-wise & festival-wise demand; dead-stock report;
WhatsApp campaign performance.

### Customer **[S]**
Total orders; supplier-wise & category-wise purchase; reorder history; pending orders; advance
bookings; favourite suppliers; monthly purchase summary; suggested products.

### Admin **[M for core KPIs; S for the rest]**
Total suppliers/customers; GMV; subscription revenue; active products; top categories/suppliers/
customers; campaign revenue; renewal report.

---

## 14. SEO (web)

- **[S]** Auto SEO titles/meta descriptions; clean URLs for product/category/supplier.
- **[S]** Product schema (structured data); sitemap; Google Search Console integration.
- **[C]** Blog/CMS; AI blog writer; image alt-text generator.
- **[C]** Programmatic landing pages: city pages, festival pages, category pages
  (e.g. "Balloon supplier in Surat", "Diwali party decoration wholesale").

SEO depth matters because organic discovery is a cheap acquisition channel for buyers — but it
follows the marketplace core; the public web in MVP can start with indexable product/category/
supplier pages and grow from there.

---

## 15. Logistics & payments (platform plumbing)

- **[M]** Razorpay payments + subscription billing (auto-renew where mandates allow).
- **[M]** GST invoicing.
- **[S]** City-wise / supplier-wise transport mapping; auto transport selection.
- **[S]** Shipment/dispatch tracking & delivery confirmation (lightweight; deepen later).
- **[S]** Outstanding/collections report; payment reminders.
- **[C]** Transport-partner portal/integration.

---

## 16. Cross-cutting requirements

- **[M]** Multi-platform: customer app, supplier app, website, admin panel (AI dashboard rolls into
  admin initially; standalone later **[C]**).
- **[M]** Authentication: mobile-OTP login (India norm) + email/password for staff; JWT + refresh.
- **[M]** Role-based access control across all surfaces.
- **[M]** Audit logging for approvals, KYC access, payments, admin actions.
- **[S]** Localisation scaffolding (Hindi + English UI strings) — search is bilingual from MVP; full
  UI localisation can follow.
- **[M]** Observability: error tracking, structured logs, uptime/health.

---

## 17. Non-goals (for now)

- Cross-border / non-India operations.
- Consumer (B2C) retail — this is B2B (verified businesses both sides).
- Owning inventory or fulfilment — Kiwi Party is the marketplace + software, not the stockist.
- Commission-on-GMV billing (kept optional via data model, not in launch pricing).

See doc 4 for the precise MVP cut line and doc 5 for the order in which the rest is delivered.
