# Kiwi Party AI — Delivery & Handover

A plain-English guide to the delivered product. No technical knowledge needed.

---

## What this is

**Kiwi Party** is a complete, working **AI-powered party-supplies marketplace app** for India — like
IndiaMART, but specialised for party products and with AI built in. It has three sides:

- **Buyers** (party shops, decorators, event planners) — search, compare, and order from verified
  suppliers; multiple suppliers in one order; GST invoices; reorder; AI assistant.
- **Suppliers** (manufacturers / importers / wholesalers) — list products (one-by-one or bulk CSV),
  manage orders & leads, post **Stories**, see analytics, get notifications.
- **Admin** (you / the operator) — approve suppliers & buyers (KYC), see revenue & KPIs, govern the
  catalogue.

It installs to a phone's home screen and runs like a **native app** — no app store needed.

---

## How to put it live (≈ 3 minutes, free)

1. Open the project on GitHub and click the **“Deploy to Render”** button in the README
   (or go to **render.com → New → Blueprint → pick this repo → Apply**).
2. Sign in to **Render** with a GitHub account (free plan is fine for a demo).
3. Render builds it automatically and gives you a public link like `https://kiwiparty-web.onrender.com`.
4. Share that link. On a phone, open it → browser menu → **“Add to Home Screen”** → it installs as the
   **Kiwi Party** app.

> The free plan sleeps after inactivity and resets demo data on restart — perfect for showing the
> client. For real, always-on use with permanent data, upgrade the Render plan (and we'll point it at
> a permanent database — a 1-line change).

**Demo logins** (one-time code is `123456`):

| Role | Phone number |
|---|---|
| Buyer | `9000000001` |
| Supplier | `9000000010` |
| Admin | `9000000099` |

---

## What's included (all working)

- 🔍 **AI search** — type plain English ("baby shower decoration under ₹5000") and it understands.
- 🤖 **AI assistant** — a chat that helps buyers find products.
- 🛒 **Orders** — cart across multiple suppliers, splits into one order + **GST invoice per supplier**,
  enforces minimum order quantities and bulk price slabs, reorder.
- 🎈 **Supplier Stories** — Instagram-style visual selling with views & lead analytics.
- ⭐ **Reviews & ratings** + supplier **trust score**.
- ❤️ **Wishlist**, 🔔 **notifications**, 📊 **buyer & supplier reports**.
- 🏭 **Supplier tools** — dashboard, add product (with **AI description**), **bulk CSV upload**,
  order management, analytics, profile.
- 🛠️ **Admin** — KPIs (revenue, GMV), **KYC approvals**, audit log.
- 💳 **Memberships** — supplier yearly / buyer monthly plans.
- 📱 **Installable app** (works on Android & iPhone), 🔎 **SEO** (Google-ready).

---

## Turning on the "real" services (optional, when ready)

The app works fully in demo mode out of the box. To make these **real**, paste the relevant keys into
Render's **Environment** tab (full list with instructions in `apps/web/.env.example`):

| Service | What it enables | Without a key (demo) |
|---|---|---|
| **Claude (Anthropic)** | Real AI for search, descriptions, assistant | Smart built-in fallback |
| **Razorpay** | Real online payments | Mock "paid" |
| **MSG91** | Real OTP login by SMS | Fixed demo code `123456` |
| **WhatsApp** | Order/inquiry alerts on WhatsApp | In-app notifications only |

Each is independent — add them one at a time, whenever you have the accounts.

---

## Honest status

- **Done & working:** everything above, verified end-to-end (automated tests pass, the full
  buyer/supplier/admin journeys all work).
- **Needs your accounts to flip from demo → real:** the API keys above (Razorpay, WhatsApp, SMS,
  Claude) and a paid hosting plan for permanent data.
- **Not built yet (separate future phases):** native iOS/Android **app-store** apps (the installable
  web app covers most needs without the stores), deeper "semantic" AI search, live-selling video, and
  a community feed. These are scoped in [`docs/`](docs) and can be added next.

---

## Where things live

- The app: [`apps/web/`](apps/web) (see its README for run/deploy details).
- The plan & decisions: [`docs/`](docs) — product spec, architecture, roadmap, cost estimates.
- Deploy config: `render.yaml` + `apps/web/Dockerfile` (works on Render, Railway, Fly, any Docker host).
