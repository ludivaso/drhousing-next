# DR Housing — Session Progress

## QA Bug Fixes — 2026-04-05

- [x] BUG 1 — Agent card: fetch agent via listing_agent_id, pass to PropertyDetailClient
- [x] BUG 2 — Display formatters: formatLabel() applied to tier, features, amenities
- [x] BUG 3 — HTML lang attribute: layout.tsx reads lang cookie server-side
- [x] BUG 4 — Language persistence: already via localStorage + cookie (prior fix)
- [x] BUG 5 — Homepage canonical: alternates.canonical added to metadata
- [x] BUG 6 — hreflang: removed ?lang=en, x-default added to sitemap
- [x] BUG 7 — Related properties: .or() values quoted for PostgREST string safety
- [x] BUG 8 — Lightbox: role="dialog" + aria-modal added for DOM detection
- [x] BUG 9 — Footer Dashboard: hidden behind supabase.auth.getUser() check
- [x] tsc --noEmit: 0 errors
- [x] npm run build: pass
- [x] git push origin main: 58e7fad

## Previous Sessions

### Session 2 — Groups 1–4 (2026-04-04)
- [x] Admin listings: 96px thumbs, 100/page, inline filters, bulk actions, inline edit
- [x] Hover preview card (1500ms, thumbnail only, right-side with flip)
- [x] New listing form: AI import, 7 sections, bilingual, placeholder image
- [x] Language toggle: 🇨🇷/🇺🇸 flags, cookie write + reload

### Session 1 — Milestones (2026-04-04)
- [x] Contact form fix (zod defaultValues)
- [x] Favicon replacement (DR Housing brand)
- [x] OG image system (direct hero photo URLs)
- [x] Title deduplication, FilterBar scroll, favorites instant removal
