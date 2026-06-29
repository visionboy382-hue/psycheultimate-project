# Psyche v20 — PRISM personality engine

**Framework, engine, and app by Aryan S.**

A self-contained personality instrument built on **PRISM** — Perception, Response, Identity, Social, Motivation. Forty questions map your five dimensions across twenty facets, place you among **21 archetypes**, and surface signature traits, shadow, stress-shift, growth edge, compatibility, and a shareable card. Runs **100% on-device**: no accounts, no servers, no AI, no network required after first load.

---

## Files

```
index.html              # app shell + design system + launch splash
app.js                  # PRISM engine, data, all five views, share card, credits
manifest.webmanifest    # PWA manifest (installable)
service-worker.js       # offline-first caching
icon-192.png            # app icons
icon-512.png
icon-maskable-512.png
```

`psyche-v20.html` (single file) is the same app with everything inlined — handy for quick sharing or dropping into one host. Use the multi-file folder for the real PWA / APK build.

---

## Run locally

A PWA needs to be served over HTTP (not opened as a `file://`) for the service worker to register.

```bash
cd psyche-v20
python3 -m http.server 8080
# open http://localhost:8080
```

## Deploy (free options)

- **Netlify** — drag the `psyche-v20` folder onto the Netlify dashboard. Done.
- **Vercel** — `vercel` in the folder, or import the repo.
- **GitHub Pages** — push the folder to a repo, enable Pages on the branch.

Once live over HTTPS, it's installable: browsers show an "Install app" prompt, and it works offline.

## Wrap to an Android APK (PWABuilder)

1. Deploy to an HTTPS URL (above).
2. Go to **pwabuilder.com**, paste your URL.
3. It reads `manifest.webmanifest` + `service-worker.js` and packages an Android app.
4. Download the package and sign it; sideload or publish to Play.

(Same pipeline you've used before — the manifest icons and offline SW are already wired.)

---

## Your credit, woven in

- **Launch animation** — the prism logo builds, then "Built by Aryan S."
- **Reading-complete animation** — same credit replays as the closing beat when an assessment finishes. (Web apps can't reliably animate on tab-close, so the credit is tied to the natural "end" of a session — finishing a reading — plus a **Replay intro** button in Settings.)
- **Home footer** and **Settings → About** name you as creator of PRISM and the app.
- **Share card** — every exported PNG carries "Built by Aryan S" in the footer, so the credit travels to Instagram / X with each share.

---

## Expanding the data (to your full 100 / 500+)

Everything lives in clearly-labelled objects at the top of `app.js`:

- `DIMS` — 5 dimensions, each with 4 facets and high/low trait copy. Add facets or expand trait text here.
- `QUESTIONS` — 40 items. Add more with `Q("statement", "Dimension.facetKey", +1 | -1)`. The engine auto-scales scoring to however many questions map to a facet.
- `ARCH` — 21 archetypes keyed by `primary→secondary` dimension. To grow toward 100, add finer keys (e.g. tertiary dimension, or facet-level signatures) and extend `Engine.match` to resolve them.

The scoring, matching, trait-surfacing, and compatibility math all read from these objects — add data, and the whole app picks it up. No engine rewrite needed.

---


---

## Cloud layer (optional · Supabase)

The app is offline-first and needs **no backend to work**. When you want growth + sync features, turn on the cloud — see **SETUP-SUPABASE.md**. It adds, additively:

- **Public share links** — every reading can mint a real URL (`r.html?id=…`) showing the archetype card. Built for sharing to reels/stories. Carries your "Built by Aryan S" credit.
- **Rarity / aggregate stats** — the "Where you stand" card: your percentile per dimension and how rare your archetype is, over the whole population (`get_stats()` RPC, seeded with 520 readings so it's meaningful day one).
- **Accounts + cross-device sync** — email/password; readings back up and sync via row-level-security-protected tables.

Stack: **Supabase** (Postgres + Auth + RLS). No custom server, no env-var deploy swamp. Files: `cloud.js` (client wrapper), `config.js` (your keys), `supabase/schema.sql` + `supabase/seed.sql` (run once), `r.html` (public share page).

If `config.js` is blank, every cloud call is a safe no-op and the app stays fully offline.


*Psyche v20 — the final build.*
