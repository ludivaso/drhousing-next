# DR Housing — Session Handoff Document
**Date:** 2026-04-05 | **Branch:** main | **Repo:** git@github.com:ludivaso/drhousing-next.git

---

## Project Identity

- **Repo:** `ludivaso/drhousing-next` (SSH authenticated as ludivaso)
- **Main repo path:** `/Users/diegovargas/Desktop/Diego/website2026/test GPT migration/drhousing-next`
- **Worktree:** `/Users/diegovargas/Desktop/Diego/website2026/test GPT migration/drhousing-next/.claude/worktrees/agitated-blackburn`
- **Deploy target:** Vercel (preview + prod at drhousing.net — do NOT break prod)
- **Last commit pushed:** `58e7fad` on `main`

---

## Stack

- Next.js 14 App Router (NOT Pages Router)
- TypeScript strict mode
- Supabase (project ID: `vtmesmtcnazoqaputoqs`) — anon key only, no service role
- Tailwind CSS with custom design tokens
- `@dnd-kit` for drag-and-drop (admin featured listings)
- `react-hook-form` + `zod` on contact/inquiry forms
- i18n via custom `useI18n()` context (localStorage + cookie, NOT next-intl)
- Fonts: Lora (serif) + Poppins (sans) via next/font
- Colors: `#F5F2EE` bg, `#C9A96E` gold, `#1A1A1A` text, `#1B3A2D` forest green

---

## Key File Map

| File | Purpose |
|------|---------|
| `app/layout.tsx` | Root layout — reads `lang` cookie, sets `<html lang>` |
| `app/(site)/page.tsx` | Homepage — `force-dynamic`, reads lang cookie |
| `app/(site)/propiedades/page.tsx` | Listings grid — `force-dynamic`, passes lang to PropertyCard |
| `app/(site)/property/[slug]/page.tsx` | Property detail — `force-dynamic`, fetches agent by FK, passes to client |
| `components/PropertyDetailClient.tsx` | Property detail UI — lightbox, agent card, formatLabel, lang-aware |
| `components/PropertyCard.tsx` | Card component — accepts `lang` prop |
| `components/Navbar.tsx` | Flag emoji toggle (🇨🇷/🇺🇸), calls setLang |
| `components/Footer.tsx` | Hides Dashboard link behind `supabase.auth.getUser()` |
| `components/HomeClient.tsx` | Homepage client — accepts `lang` prop |
| `lib/i18n/context.tsx` | i18n provider — reads cookie first, then localStorage; setLang writes cookie + reloads |
| `lib/supabase/queries.ts` | Supabase query helpers — `getPropertyBySlug`, `getAgents`, etc. |
| `lib/supabase/client.ts` | Supabase browser client (anon key) |
| `src/integrations/supabase/types.ts` | Full DB schema types (PropertyRow, AgentRow, etc.) |
| `app/admin/listings/page.tsx` | Admin listings table — bulk actions, inline edit, hover preview |
| `app/admin/listings/[id]/page.tsx` | Full property edit form — single-page, all sections, auto-save |
| `app/admin/listings/new/page.tsx` | New listing form — AI import box, 7 sections |
| `app/sitemap.ts` | Sitemap — hreflang without ?lang=en |
| `middleware.ts` | Gates `/admin/*` routes (auth only, no lang handling) |
| `PROGRESS.md` | Session checkpoint log |

---

## Database Schema — Key Tables

### `properties` table (93 columns, key ones):
```
id, slug, reference_id
title, title_en, title_es
subtitle, subtitle_en
description, description_en, description_es
status, property_type, tier, currency
price_sale, price_rent_monthly, original_price, price_note
bedrooms, bathrooms, garage_spaces, levels, floor_number
construction_size_sqm, land_size_sqm, terrace_sqm, garden_sqm
year_built, year_renovated, property_condition
location_name, lat, lng, building_name, zone
images (string[]), featured_images (string[])
youtube_url, youtube_enabled, youtube_label_es, youtube_label_en
amenities (string[]), amenities_en, amenities_es
features (string[]), features_en, features_es
furnished, pet_policy, deposit_amount, min_lease_months
hoa_monthly, annual_property_tax
folio_real, plano_catastrado, ownership_type
has_encumbrances, encumbrances_notes, condo_regulations_available
listing_agent_id (FK → agents.id)
external_agent_name, external_agent_phone, listing_source
featured, featured_order, hidden, visibility
internal_notes, plusvalia_notes
facebook_published, encuentra24_published
availability_date, created_at, updated_at
```

### `agents` table:
```
id, full_name, role, bio, phone, email, photo_url, languages, service_areas, created_at, updated_at
```

### Zones (exact string values in DB):
```
Escazú, Santa Ana, La Guácima, Ciudad Colón, Rohrmoser,
La Sabana, Pavas, San Rafael de Alajuela, Guanacaste, Pacífico Sur, Sin zona
```

---

## Everything Done This Session

### Session A — Admin Table + Forms + Language (commit `1c6cca2`)

**Group 1 — Admin Listings Table (`app/admin/listings/page.tsx`)**
- 1A: Thumbnails 96×96px, use `featured_images[0]` first
- 1B: PAGE_SIZE 20 → 100
- 1C: Inline column header filters (title, zone, status, type, featured) — removed collapsible panel
- 1D: Checkbox column + bulk action bar (Publicar/Ocultar/Destacar/Quitar/Eliminar)
- 1E: Inline quick-edit row (title, status, zone, price, hidden, featured)

**Group 2 — Hover Preview Card (admin listings)**
- Trigger ONLY on thumbnail `<td>`, 1500ms delay
- Fixed position to RIGHT of thumbnail (rect.right + 16), flips LEFT if overflow
- Shows hero image, status badge, title, zone, gold price, specs, 100-char description

**Group 3 — Two Edit Buttons Per Row**
- Pencil icon → inline edit toggle (Edición rápida)
- LayoutDashboard icon → `/admin/listings/[id]` full edit page (Edición completa, green hover)

**Group 4 — Language Toggle**
- Navbar: 🇺🇸 EN / 🇨🇷 ES flag emojis (Globe icon removed)
- `lib/i18n/context.tsx`: setLang writes `document.cookie` (1yr) + `window.location.reload()`
- Init reads cookie first, then localStorage fallback

**Group 5 — New Listing Form (`app/admin/listings/new/page.tsx`)**
- Full rebuild: 7 sections (IA, Esencial, Especificaciones, Contenido ES|EN, Imágenes, Visibilidad, Guardar)
- AI import box at top (URL → `import-listing-url` edge fn, text → `ai-listing-generate` edge fn)
- Bilingual title + description fields
- Placeholder image (Unsplash), image URL manager with add/remove
- Non-blocking validation with red borders + yellow banner

### Session B — Language Switching + Edit Form Full Rebuild (commit `bdea998`)

**Group 1 — Force-dynamic + cookie lang on server pages**
- `app/(site)/property/[slug]/page.tsx`: `force-dynamic`, reads lang cookie, passes to PropertyDetailClient
- `generateMetadata`: lang-aware og:title/og:description
- `app/(site)/propiedades/page.tsx`: passes lang to all PropertyCards
- `app/(site)/page.tsx`: `force-dynamic`, passes lang to HomeClient
- `components/HomeClient.tsx`: accepts `lang` prop, falls back to i18n context
- `components/PropertyDetailClient.tsx`: accepts `lang` prop

**Group 2 — Hover card fix**
- Trigger only on thumbnail cell, not entire row
- 1500ms delay, position right of thumbnail, flips left if overflow

**Group 3 — Two edit buttons** (see Session A Group 3 — refined here)

**Group 4 — Full Edit Form Rebuild (`app/admin/listings/[id]/page.tsx`)**
- Single-page scrollable (removed tabs)
- 9 sections with `SectionDivider` components
- 30+ new fields loaded/saved: `original_price`, `price_note`, `terrace_sqm`, `garden_sqm`, `floor_number`, `year_renovated`, `property_condition`, `building_name`, `deposit_amount`, `min_lease_months`, `hoa_monthly`, `annual_property_tax`, `pet_policy`, `folio_real`, `plano_catastrado`, `ownership_type`, `has_encumbrances`, `encumbrances_notes`, `condo_regulations_available`, `availability_date`, `facebook_published`, `encuentra24_published`, `external_agent_name`, `external_agent_phone`, `listing_source`, `reference_id`, `listing_agent_id`
- Auto-save every 60s when dirty → "Guardado automáticamente" toast
- Success toast on save (no longer navigates away)
- Google Maps iframe when lat+lng present
- Agents dropdown from `agents` table
- Rental section conditionally shown for for_rent/both status

### Session C — 9 QA Bug Fixes (commit `58e7fad`)

| Bug | Fix |
|-----|-----|
| BUG 1 — Agent card shows placeholder | `page.tsx` fetches agent by `listing_agent_id` FK, passes as `agent` prop; PropertyDetailClient shows real photo/name/role/phone |
| BUG 2 — Raw DB slugs in UI | Added `formatLabel(s)` helper (underscore→space + TitleCase); applied to tier badge, features, amenities |
| BUG 3 — HTML lang not updating | `app/layout.tsx` is async, reads lang cookie, sets `<html lang={lang}>` |
| BUG 4 — Language resets on navigation | Already fixed via localStorage + cookie in prior session |
| BUG 5 — Homepage missing canonical | Added `alternates: { canonical: 'https://drhousing.net' }` to homepage metadata |
| BUG 6 — hreflang uses ?lang=en | Sitemap now emits `es: url, en: url, x-default: url` (no query params) |
| BUG 7 — Related properties empty | `.or()` values now quoted: `location_name.eq."Santa Ana"` (PostgREST requires quotes for strings with spaces) |
| BUG 8 — Lightbox not in DOM | Added `role="dialog" aria-modal="true" aria-label` to lightbox overlay |
| BUG 9 — Dashboard link visible to all | Footer checks `supabase.auth.getUser()`, only renders Dashboard link when `isLoggedIn=true` |

---

## Known Patterns & Gotchas

1. **`cookies()` in Next.js 14** — must `await` it: `const cookieStore = await cookies()`
2. **Supabase `.or()` with spaces** — must quote values: `.or('location_name.eq."Santa Ana"')`
3. **`force-dynamic`** — needed on any Server Component that reads cookies (lang)
4. **`AgentRow` type** — imported from `@/lib/supabase/queries` which re-exports from `@/src/integrations/supabase/types`
5. **Images** — must be in `next.config` domains to use `<Image>`. Use `unoptimized` for external Supabase storage URLs
6. **Admin auth** — middleware gates `/admin/*` via Supabase session cookie. The Supabase anon client is used everywhere (no service role)
7. **`getPropertyBySlug`** — queries `.eq('hidden', false).neq('visibility', 'hidden')` — note it's `neq` not `eq('visibility','public')` to also show private listings in admin preview
8. **i18n** — `setLang` does `window.location.reload()` intentionally so Server Components re-render with new lang cookie
9. **Tier values in DB** — `mid`, `high_end`, `ultra_luxury` (underscores, no spaces) — always pass through `formatLabel()` before display
10. **Zone filter** — uses `.eq('zone', value)` not ILIKE — exact match against the zone text column

---

## Dev Commands

```bash
# Run dev server (port 8080)
npm run dev

# Type check
npx tsc --noEmit

# Production build
npm run build

# Push
git push origin main
```

---

## What's NOT Done Yet (potential next tasks)

- Blog section (`/blog`) — static placeholder, no CMS
- `/desarrollos` — only 2 static entries
- WhatsApp CTA optimization (currently hardcoded +50686540888)
- Admin CRM (leads pipeline) — partially built in Milestone 5
- PDF brochure generation (`/api/pdf/brochure`) — exists but untested in new form
- AI edge functions (`import-listing-url`, `ai-listing-generate`) — wired up in forms but backend functions may need verification
- Image upload (currently URL-paste only — no S3/Supabase Storage direct upload)
- Search/SEO indexing (sitemap is correct but no Search Console verification yet)
