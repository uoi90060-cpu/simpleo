# Simple Cook

> **Going live:** this copy includes a real server (`server/`) for Railway: accounts, live messages, stories, food map and the camera scanner, with no Supabase needed. Start with **docs/RAILWAY.md**.


A cooking and food social platform: recipes, reels, long videos, creators, points, light + dark mode.
Vanilla HTML / CSS / JavaScript frontend (no build step) with a **PostgreSQL + Supabase backend foundation**.

> **Status (Phase 1):** the frontend runs in two modes.
> **Local demo mode** (default, nothing to configure) behaves exactly like the original prototype.
> **Supabase mode** (set `config.js`) uses real accounts, a real database, row-level security and server-calculated points.
> The database schema, security policies and adapter are written and unit-wired, but **have not yet been run against a live Supabase project** (no network/Postgres in the build environment). See `docs/TESTING.md` for exactly what was and was not verified, and `docs/SETUP.md` for the 20-minute live verification.

## Quick start (local demo, no backend)

```bash
python3 -m http.server 8000     # then open http://localhost:8000
```
Demo account: `anis` / `demo1234`. The footer's "Reset demo data" clears local data. (Both disappear in Supabase mode.)

## Quick start (real backend)

1. Create a Supabase project, run `supabase/migrations/*.sql` then `supabase/seed.sql` (see `docs/SETUP.md`).
2. Put the project URL and **publishable** key in `config.js` (or generate it: `node tools/write-config.js` from `.env`).
3. Serve the folder. Register, confirm your email, log in.

## Project structure

```
index.html, style.css           page shell + design (unchanged identity)
config.js                       PUBLIC runtime config (empty = local demo mode)
data.js                         seed content (source for supabase/seed.sql)
api.js                          local-mode data layer (localStorage) + shared ranking/search logic
backend/supabase-adapter.js     real backend: auth, queries, optimistic writes, uploads (overrides api.js)
ui.js, views.js, script.js      components, pages, router/forms/boot
supabase/migrations/            0001-0008: schema, triggers, points, RLS, storage
supabase/seed.sql               GENERATED from data.js (node tools/generate-seed.js)
supabase/tests/rls_smoke.sql    isolation checks to run on a live project
tools/                          generate-seed.js, write-config.js, check-sql.py
lib/                            recipe-core.js (scaling, matching; browser+Node), recipe-pipeline.js (compile/validate/duplicates)
scripts/                        import-recipes.js, build-world.js, validate-recipes.js, detect-duplicates.js
data/                           reference/ (countries, regions, ingredients), recipes/ (batches), world.js (generated)
world.js                        international-recipe data layer (names, languages, registers them as fixed recipes in local mode)
supabase/seed_world.sql         GENERATED idempotent world-recipe seed
tests/                          e2e-local.py, e2e-adapter.py, e2e-security.py (+ fake-supabase.js test double)
docs/                           RESEARCH, ARCHITECTURE, SETUP, TESTING, ROADMAP
_headers                        security headers for Netlify / Cloudflare Pages
.env.example                    environment variable template
```

## Chat bot

A floating chat button on every page opens the Simple Cook bot (your Zapier chatbot) for any visitor, no login and no API key on the site. Setup, the "Built on Zapier" label and usage limits: `docs/CHATBOT.md`. Test: `python3 tests/e2e-chatbot.py`.

## Phase 2: international recipes (in Explore → Fixed recipes)

The international recipes are ordinary **fixed recipes**: open **Explore → Fixed recipes** (95 recipes: the 24 original ones plus **71 new international recipes**). There is no separate World page. Each new recipe page adds: country flags and origin (with an honest confidence label for shared or disputed dishes), ingredient checklist, **serving scaling**, step-by-step method with times and temperatures, **cooking mode** with timers, derived allergen and diet tags, EN/FR/AR names with right-to-left layout, and a report-an-inaccuracy form.
**Target was 1,000 recipes; there are 71 (7.1%). Phase 2 is not complete.** Only 4 recipes have photos (owner-supplied, licence unconfirmed); the rest show the illustrated plate. See `docs/PHASE2_PROGRESS.md` and the generated `docs/RECIPE_QUALITY_REPORT.md`.
Add recipes: edit `data/recipes/batch-*.json`, then `node scripts/import-recipes.js` (see `docs/RECIPE_DATA_FORMAT.md`). Add a photo: put the file in `assets/recipes/` and register it in `data/reference/images.json`.
Tests: `node tests/unit-core.js`, `python3 tests/e2e-world.py`.

## Points (now computed by the server)

Post recipe +50 · reel +30 · video +80 · like +5 · save +10 · comment +8 (once per person per post) · share +6 ·
new follower +15 · view +1 · commenting on others +2 · dislike −2. No points for acting on your own content or on the official account.
In Supabase mode these are written to a ledger by database triggers with a uniqueness constraint, so repeated or forged requests cannot create duplicate points; deleting a post reverses the points it generated.

## Known limits

See `docs/TESTING.md` ("Remaining limitations"). Highlights: the full catalog is loaded into memory at start (fine for ~2,000 items; the 1,000-recipe phase needs server-side paging/search), login in Supabase mode is by email only, and video files are stored but not transcoded.
