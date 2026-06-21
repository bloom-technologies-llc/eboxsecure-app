# EboxSecure End-to-End Demo Script

One story: **Sarah** discovers EboxSecure, signs up, orders from a partnered Shopify store, her package is received and scanned at an Ebox location, and she (and her trusted contact) pick it up. Along the way we touch every milestone in the Requirements Document.

---

## Prep (before demo day)

**Everything runs PROD — no QA anywhere: web apps, mobile builds, Shopify store, data.**

- [ ] Production apps deployed & healthy: marketing site, client web (app.eboxsecure.com), admin portal, Shopify POC store
- [ ] Mobile **production builds** cut via EAS `production` profile (points at prod URLs — requires `mobile-env-profiles` PR merged + live Clerk publishable key set in EAS production env: `eas env:create --environment production --name EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`)
- [ ] Phone 1 (Sarah): client-mobile **prod build** installed, FaceID enrolled. Phone 2 (employee): mobile-scanner **prod build** installed
- [ ] Payment path confirmed on prod: Stripe is live mode, so test cards won't work — use the payment-bypass flow or a real card (refund after)
- [ ] Prod admin portal has analytics data so dashboard isn't empty (run `seed-analytics` / `seed-carriers` against prod DB if needed)
- [ ] Accounts ready: corporate admin login, location employee login (same location used in demo)
- [ ] Two physical shipping labels printed: (1) addressed to Sarah's order from Shopify store, (2) a "non-partnered retailer" label using Sarah's **virtual address**
- [ ] One extra label for the **wrong-location / unwanted package** scan
- [ ] A second phone number / email for the trusted-contact invite
- [ ] One **overdue package** pre-staged for Sarah (delivered date older than her plan's holding limit) — needed for the late-fee beat
- [ ] Fresh demo customer (Sarah) does NOT exist yet — sign-up happens live

---

## Act 1 — Discovery (Marketing Site) ~3 min

> Covers: **Landing Page (all milestones)**

- "A new customer finds us through search."
- Open marketing site → scroll Home
- Click through: **About → For Customers → For Businesses → Integration → Pricing → FAQ** (briefly — "12 pages live, incl. Terms & Privacy")
- Go to **Locations** → search by city → results on map
  - "Sign in to add a location to your account" — note it, we'll do it after sign-up
- Go to **Partners/Retailers** → submit **"request integration with a store"** form
- Submit **Contact** form → show it routes to email inbox

---

## Act 2 — Sign Up, Onboarding & Subscription (Client Web) ~5 min

> Covers: **Auth (email/pw, photo ID + legal name), Subscriptions (tiers, monthly/yearly), Location Mgmt (map, favorites), App Redesign (web)**

- Client web → **Sign up** with email/password (Sarah)
- Onboarding flow: enter **full legal name**, upload **photo ID** (phone hand-off step)
- Pick a plan: show **Basic vs Premium differences**, toggle **monthly/yearly** → subscribe with test card
- "Premium unlocks more package allowance + longer holding" — feature gating is live
- **Locations** → search → open location detail → **dynamic Google Map** → **favorite** the demo location
- Point out the location's **virtual address** on the detail page — "this is how you ship from ANY retailer, even non-partnered ones"

---

## Act 3 — Mobile Auth (Client Mobile, Phone 1) ~3 min

> Covers: **Shared web/mobile auth, 2FA, FaceID, password reset, App Redesign (mobile)**

- Open client-mobile → sign in with **same credentials** ("one account, web + mobile")
- Profile → Manage Security → **add phone, enable 2FA** → sign out/in → enter SMS code
- Sign in again with **FaceID**
- Quickly show **Forgot password** flow from the sign-in screen (send reset email)

---

## Act 4 — Order from a Partnered Store (Shopify) ~4 min

> Covers: **Shopify e-commerce integration (embedded plugin + POC store), Package statuses (ordered/en-route)**

- Open the **POC Shopify store** → add product to cart → checkout
- In checkout: **Ebox location picker extension** → sign in as Sarah → select her favorited location
- Place order
- "Webhook fires → order lands in EboxSecure instantly"
- Client web/mobile: order appears, status **Ordered**
- Admin portal: same order visible → mark/simulate fulfillment → status moves to **En-route**

---

## Act 5 — Package Arrives (Mobile Scanner, Phone 2) ~6 min

> Covers: **Stand-alone scanner (all milestones), Virtual Address, carrier-agnostic linking, notifications on scan**

- Open mobile-scanner → **log in with location credentials** ("scanner is tied to this Ebox location")
- **Scan label 1** (Sarah's Shopify order):
  - Label parsed → matched to her order **regardless of carrier** → marked **Delivered / In-location**, added to inventory
  - Phone 1: Sarah gets a **notification immediately**
- **Scan label 1 again** → blocked: "**already processed**" (dedup)
- **Scan label 2** (non-partnered retailer, addressed to Sarah's **virtual address**):
  - No pre-existing order → matched to Sarah via virtual address → **order created from scan**
- **Scan label 3** (not deliverable here) → show **wrong-location / unwanted package** handling
- Admin portal: orders list reflects all statuses live

---

## Act 6 — Pickup & Trusted Contacts ~5 min

> Covers: **QR secure key, share QR, trusted contacts (add + invite non-user), notification preferences, late pickup fee**

- Phone 1 (Sarah): open order → **QR code** ("this is her secure pickup key")
- Settings → **Notification preferences** → show email / text / push toggles per notification type
- Settings → **Trusted contacts** → add an existing user; then **invite a non-user** (show invite email/SMS arrive)
- **Share QR** with the trusted contact
- Phone 2 (employee): **scan Sarah's QR** → identity validated → mark picked up
- Trusted contact pickup: scan **shared QR** for the second package → picked up
- Late fee: pick up the pre-staged **overdue package** → "held past the plan limit — **late pickup fee** charged to her subscription" → show fee notification

---

## Act 7 — Admin Portal Tour ~5 min

> Covers: **Admin portal (dashboard, packages, stores, carriers, people mgmt, ACL), Location Mgmt (add/edit/remove)**

- Log in as **corporate** account
- **Dashboard** → data visualizations (volume, pickup times, trends — seeded history)
- **Orders** → list of all packages + statuses (find today's demo orders)
- **Locations** → list of all stores → **add a new Ebox store by address** → edit it → remove it
- **Carriers** → list
- **Customers / Employees** → find Sarah; show employee management
- Note: *Payments & subscriptions management — WIP, not in today's demo*
- Sign out → log in as **location employee** account → "same portal, scoped to one location" (**ACL**) — limited nav, only their location's data

---

## Act 8 — Subscription Lifecycle (wrap-up) ~2 min

> Covers: **Change/cancel subscription, grace period**

- Client web → Settings → Subscription → **change plan** (upgrade/downgrade)
- Switch **monthly ↔ yearly**
- **Cancel** → show access continues through the paid period (**grace period**)
- Close: "Every flow you saw — web, mobile, scanner, Shopify, admin — is production."

---

## Not demoable (process milestones)

- Initialization (CI/CD, repo, environments) — done, evidenced by everything above running in prod
- End-to-End Testing & Knowledge Transfer — scheduled post-demo per SOW

## Milestone coverage map

| Doc feature | Act |
|---|---|
| Full Application Redesign | 2, 3, 7 |
| Auth & Authorization (all 6) | 2, 3 |
| Package Management (statuses, QR, UI, virtual address) | 4, 5, 6 |
| Integrations (Shopify + scanner) | 4, 5 |
| Location Management | 2, 7 |
| Subscriptions (all 5) | 2, 6, 8 |
| Admin Portal (all green; payments mgmt flagged WIP) | 7 |
| Landing Page | 1 |
| Notifications | 5, 6 |
| Trusted Contacts (all 3) | 6 |
