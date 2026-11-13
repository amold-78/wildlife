# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary (inferred from demo):** Wildlife travelers, families, and nature photographers planning, comparing, and booking Indian jungle safaris.
- **Secondary (inferred from demo):** Forest-gate rangers using the Admin Desk to inspect bookings and verify digital gate passes at entry check-in.
- **Open decision:** Final user segments, tour-operator/lodge partner roles, and real-world onboarding details are deferred while the product is in demo stage.

## Product Purpose

WildTrail is an interactive demo web application for discovering Indian national parks and tiger reserves, matching travelers to suitable sanctuaries, issuing digital gate passes, and simulating ranger gate-check operations. Success in the current demo means travelers can move seamlessly from reserve exploration to a generated digital gate pass while rangers can verify permits end-to-end.

## Positioning

Combines reserve comparison, seasonal sighting probability windows, an interactive Safari Finder wizard, a Wildlife Guide, an Ask Ranger naturalist assistant, and NTCA-aligned ethical safari rules into a single self-contained expedition flow. Currently operates strictly as a client-side demo; real Forest Department or lodge integrations are not yet connected.

## Operating Context

- **Runtime model:** Pure client-side SPA persisting users, bookings, wishlists, reviews, and theme preference in browser `localStorage` (`wildtrail_*` keys).
- **Domain conventions:** Indian National Parks & Tiger Reserves (6 seeded parks: Tadoba Andhari, Pench, Ranthambore, Jim Corbett, Kanha, Kaziranga), INR (`₹`) pricing, Core & Buffer zone permits, 4x4 Gypsy / Canter vehicle shifts, and Day / Night Safari reading modes.
- **Demo credentials:** `demo@wildtrail.com` (traveler) and `admin@wildtrail.com` (ranger admin).

## Capabilities and Constraints

- **Confirmed capabilities:**
  - Scroll-driven Home expedition trail (`HomePage`), searchable/filterable Reserve Explorer (`ExplorePage`), multi-step Safari Finder (`SafariFinderPage`), reserve detail & slot selector (`SafariDetailPage`), traveler booking checkout (`BookingFlowPage`), digital Gate Pass & itinerary views (`MySafariPage`, `UserProfilePage`), species guide (`WildlifePage`), Ranger Admin verification desk (`AdminDashboardPage`), and local Ask Ranger Q&A drawer (`AskRangerModal`).
- **Constraints & open decisions:**
  - No backend database, payment gateway, or live NTCA / Forest Department API integration is active yet (demo state only; details to be provided later).
  - External stock image URLs exist in seeded catalog modules (`src/data/safaris.js`, `src/data/wildlife.js`) alongside local generated hero imagery.
  - Real authentication, server persistence, and production permit compliance rules remain open decisions for post-demo specification.

## Brand Commitments

- **Name:** WildTrail — *National Parks of India*.
- **Voice & stance:** Knowledgeable, conservation-first expedition guide grounded in NTCA responsible wildlife tourism rules (respecting distance, acoustic silence, zero plastic, no flash photography, and following licensed guides).

## Evidence on Hand

- **Local visual & code assets:** `src/assets/images/hero_tadoba_tiger_1794551605341.jpg` and full interactive React routes under `src/pages/`.
- **Seeded demo datasets:** `src/data/safaris.js`, `src/data/wildlife.js`, `src/data/reviews.js`, `src/data/blogs.js`, `src/data/rangerKnowledge.js`.
- **Absences not to fabricate:** Sighting indices, dawn field dispatches, traveler reviews, and issued gate permit numbers are simulated demo fixtures. Future work must not invent real-world customer testimonials, press, partnerships, or live government licensing claims.

## Product Principles

1. **Preserve the demo end-to-end:** Keep all client-side booking, finder, wishlist, and ranger check-in flows immediately workable without external servers or API keys.
2. **Keep demo boundaries honest:** Treat seeded sighting metrics, permits, and live reports as illustrative demo data until real integrations are introduced.
3. **Anchor in conservation ethics:** Surface responsible safari rules as a core part of the expedition experience, not hidden legal fine print.
4. **Leave room for later specification:** Keep open product decisions (real backend, payment flows, additional roles) cleanly marked so future updates can replace demo stubs without breaking existing flows.
