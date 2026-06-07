# 07 — Supplier Stories (Kiwi Party Reels) — Feature Spec

A focused spec for the flagship differentiator: **Supplier Stories** — Instagram-Stories-style
visual selling, purpose-built for B2B party-supplies sourcing. Party products are highly visual, so
discovery-through-content is a natural fit and, done well, becomes a top reason suppliers pay to be on
Kiwi Party.

This sits in **Phase 3** (doc 5) — after the marketplace core (catalogue, orders, inquiries,
analytics) exists, because Stories *drive* those existing flows rather than replace them. Data model
foundations are in doc 3 §D.

---

## 1. Concept

> Instagram Stories + WhatsApp Status + IndiaMART catalogue — for verified party suppliers.

A supplier posts short visual content (a new arrival, a price drop, a warehouse/dispatch clip, a
festival collection); verified buyers discover it in a Stories feed, swipe through, and act directly —
message, ask for best price, wishlist, add to cart, or order — without leaving the story. Every story
is measurable, so suppliers can see exactly which content drove views, leads, and revenue.

**Why it matters:** it converts a supplier's catalogue from a static list into a living feed, gives
buyers a fast, visual way to spot what's new/hot/clearing, and creates a high-intent surface for paid
promotion.

---

## 2. What suppliers can post

Content types (free-form, mapped to story `type` in doc 3 §D):

- New product arrivals · trending products · **dead-stock clearance** · festival collections
- Warehouse stock videos · dispatch videos · manufacturing videos
- Price-drop offers · combo-kit offers · product demos · customer testimonials

Story **formats**:

| Format | Purpose |
|---|---|
| Photo story | Single image + caption |
| Video story | Short clip (with cover frame) |
| Product story | Linked to a catalogue product (price/MOQ/CTA pulled in) |
| Offer story | Discount/price-drop with validity countdown |
| Poll story | "Which design should we stock?" — engagement + demand signal |
| Countdown story | Festival drop / sale start timer |
| Festival story | Tagged to a festival theme (Diwali, Rakhi, …) |

**Duration:** live for **24 hours** by default; suppliers can **pin to permanent Highlights** (by
collection, e.g. "Diwali 2026", "Clearance") and feature select stories on their profile.

---

## 3. What buyers can do (per story)

Each story exposes direct CTAs (mapped to existing entities — doc 3):

1. **Direct message** the supplier (in-app) → creates an `Inquiry`
2. **WhatsApp** the supplier → WhatsApp inquiry
3. **AI chat** about the product → AI sales agent (Phase 2 dependency)
4. **Get best price** (RFQ-style) → `Inquiry` flagged as quote request
5. **Add to wishlist** → `Favorite`
6. **Add to cart** → `CartItem` (then normal multi-supplier checkout)
7. **Save story** · **Share story** · **Follow supplier** → `Follow` edge

Because these reuse the marketplace's inquiry/cart/order plumbing, a story view flows straight into
the same lead and order pipeline — no parallel system.

---

## 4. Story analytics (for suppliers)

The payoff for suppliers. Per story and aggregated:

- **Reach:** total views, unique viewers
- **Audience:** viewer names, city, business category (party shop / decorator / event planner /
  wholesaler)
- **Engagement → revenue:** messages, inquiries, orders, **conversion rate**, **revenue generated**

Example (per the brief):

| Metric | Value |
|---|---|
| Story views | 1,200 |
| Messages | 150 |
| Inquiries | 90 |
| Orders | 35 |
| Revenue generated | ₹85,000 |

Computed from `StoryView` joined to the `Inquiry`/`Order` records attributed to the story (doc 3 §D).
The high-write `StoryView` table is partitioned / rolled up at scale (doc 2 §8).

---

## 5. AI story features

Lower the effort to post — the make-or-break for adoption.

- **"Generate Story" (one tap):** supplier picks a product (or it's auto-suggested) → AI produces a
  **poster image**, **caption**, **hashtags**, and an **offer suggestion**. Variants: new-arrival,
  festival promo, price-drop, clearance, birthday/baby-shower theme.
- **AI auto-suggests what to post:** "Balloon Decoration Kit is trending in Mumbai — post a story?"
  (ties into demand signals / AI assistant from doc 1 §9).
- Implementation: Claude for caption/hashtag/offer copy (Sonnet 4.6, with prompt caching on the
  supplier/brand context); an image-generation/templating step for the poster. Generation runs as an
  **async job** (doc 2 §3) and is **batchable** for bulk/scheduled posting (doc 2 §6.2).

---

## 6. Discovery

Buyers find stories by relevance, not just chronology:

- **By category:** Birthday, Baby Shower, Anniversary, Welcome Baby, Haldi, Mehndi, Bride/Groom To
  Be, Return Gifts, …
- **By city:** Surat, Ahmedabad, Mumbai, Delhi, Bangalore, … (matches buyer's sourcing geography)
- **By festival:** Diwali, Christmas, New Year, Rakhi, Navratri, …

Ranking blends recency, the buyer's interests/history, supplier trust score, and engagement —
reusing the recommendation infra from Phase 2.

### Story marketplace sections
Curated rails on top of the feed:
- **New Arrivals** (latest) · **Trending** (most viewed)
- **Hot Offers** (discounts) · **Dead-Stock Clearance** (liquidation)
- **Factory Direct** (manufacturer offers) · **Fast Moving** (high demand)

These mirror the catalogue sections (doc 1 §6) so stories and products stay consistent.

---

## 7. Live selling (stories, extended)

Suppliers can go **Live** (e.g. "Today's Balloon Offer"): buyers watch, ask questions in real time,
request a quote, and place orders during the stream. This is the heaviest sub-feature
(real-time video + chat + checkout) and lands **after** core Stories prove out — treat as a Phase 3
stretch / Phase 4 item. Technically it adds a streaming layer (managed live-video) on top of the
existing chat and order flows.

---

## 8. Supplier profile (Instagram-style)

Stories give the supplier profile a richer shape:

Company logo · followers · product count · **story Highlights** · videos · reviews · rating ·
**GST-verified / Manufacturer / Importer badges**.

This builds directly on `SupplierProfile`, `Follow`, `Story` (highlights), and `Review` (doc 3).

---

## 9. AI lead scoring (powered by story behaviour)

Story engagement is rich intent data. When a buyer views/acts on stories, the system tracks products
viewed, categories, dwell time, and messages, and the AI assigns a **lead score**:

- 🔥 **Hot** · ⭐ **Warm** · ⚪ **Cold**

Suppliers prioritise hot leads. Stored on `Lead.score` + `Lead.signals` (doc 3 §7); scored by a
cheap-tier LLM/heuristic blend (doc 2 §6.4). This makes Stories not just a marketing surface but a
**lead-generation engine**.

---

## 10. Daily supplier WhatsApp report (Stories included)

The morning report (doc 6 §10) gains a Stories section: story views, messages/inquiries/orders from
stories, top-performing story, and "post a story?" nudges — delivered via WhatsApp alongside sales and
trending data.

---

## 11. Future: "Party Influencer Stories"

Decorators, party shops, and event planners post their own content (decoration setups, product
reviews, event videos); **suppliers sponsor** these stories. This creates an
Instagram + IndiaMART + TikTok-Shop-style ecosystem where buyers discover products through trusted
creator content and order directly. This is a **vision-stage** item (doc 1 §10 "Won't-yet") — it
needs the supplier Stories base, a creator role, and a sponsorship/billing model first.

---

## 12. Dependencies & build order

Stories reuse, and therefore depend on:

| Needs (already built by Phase 3) | Used for |
|---|---|
| Catalogue + products | Product/offer stories, CTAs |
| Inquiry / cart / order pipeline | All buyer story actions |
| Reviews / trust / follow | Profile, ranking |
| Recommendation infra (Phase 2) | Story discovery & ranking |
| AI assistant (Phase 2) | "Generate Story", AI chat CTA, lead scoring |
| WhatsApp + reports | Story metrics in daily report |
| Media pipeline (S3/CDN) | Story photo/video hosting |

**Build order within Stories:** (1) post + view photo/video/product stories with 24h expiry +
Highlights; (2) buyer CTAs wired to inquiry/cart/follow; (3) per-story analytics; (4) discovery feed +
sections; (5) "Generate Story" AI; (6) lead scoring + daily-report integration; (7) live selling;
(8) influencer stories (future).

---

## 13. Why this is a paid-tier anchor

For a visual industry, Stories give suppliers (a) a living storefront, (b) a measurable lead/revenue
engine, and (c) a promotion surface (featured/sponsored stories — an add-on revenue line, doc 1 §3).
For buyers, it's the fastest way to spot what's new, hot, and clearing across verified suppliers. That
combination — visual discovery + direct ordering + hard analytics — is the kind of feature that, on
its own, justifies the supplier subscription. It's deliberately sequenced **after** the core
marketplace so it amplifies a working loop rather than standing on an empty one.
