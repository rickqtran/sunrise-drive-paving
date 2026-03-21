# Sunrise Drive Paving — Project Memory

## What This Project Is
A neighborhood fundraising website for paving W Sunrise Dr in Laveen, AZ. Residents pledge money toward a $200,000 goal. The site shows an SVG parcel map of all 20 households, a funding tracker, community board, FAQ, and photo gallery. There is also a password-protected Admin dashboard.

## Tech Stack
- **Frontend:** React 18 + Vite, Tailwind CSS, React Icons (Feather via `react-icons/fi`)
- **Backend:** Supabase (PostgreSQL) — anon key on frontend, no auth server
- **Deployment:** Vercel via GitHub webhook on `main` branch — **must `git push` to deploy**
- **Repo:** `https://github.com/rickqtran/sunrise-drive-paving`

## Supabase Tables
| Table | Purpose |
|---|---|
| `pledges` | One row per household pledge |
| `messages` | Community board posts |
| `settings` | Key/value store (e.g. `project_goal`) |
| `pledge_log` | Append-only audit trail — NO delete policy intentional |

### RLS Notes
- All tables use Row Level Security with anon key policies
- Supabase silently returns `{ data: null/[], error: null }` when RLS blocks an operation — always use `.select()` on write ops and check `data?.length` to detect silent blocks
- All RLS policies are in `supabase-fix.sql` — run in Supabase SQL Editor when DB changes needed
- `supabase-fix.sql` uses `DROP POLICY IF EXISTS` before every `CREATE POLICY` — safe to re-run

## File Structure
```
src/
  App.jsx                        # Root: loads pledges, subscribes to realtime
  lib/supabase.js                # All DB functions
  components/
    NeighborhoodMap.jsx          # SVG parcel map + pledge form + how-to video
    FundingTracker.jsx           # Progress bar + stats
    CommunityBoard.jsx           # Message board
    WhyPave.jsx                  # Why pave + Sponsor a Neighbor + loan options
    Hero.jsx / Header.jsx / Footer.jsx / FAQ.jsx / PhotoGallery.jsx
  pages/
    AdminPage.jsx                # Admin dashboard (Finances, Moderation, Transactions)
public/
  videos/Instructions.mp4       # Pledge how-to video (31MB, committed to git)
supabase-fix.sql                 # All DB migrations — run manually in Supabase
```

## Pledge Tier System
Tier is encoded in the `message` field with a bracket prefix:

| Tier | Tag in DB | Amount | Color |
|---|---|---|---|
| Bronze / Basic | `[Basic Participation]` | $10,000 | `#cd7f32` |
| Silver / Supporter | `[Community Supporter]` | $11,500 | `#a8a9ad` |
| Gold / Sponsor | `[Community Sponsor]` | Custom (≥$10K) | `#ffd700` |
| Other / Green | `[Custom Contribution]` | Custom (<$10K) | `#22c55e` |

- `parseTier()` maps tag → tier id (`basic`, `silver`, `sponsor`, `other`)
- Gold input box is styled prominently red; Other input box is green
- `formatAmountCompact(n)` formats SVG labels: `$10K`, `$11.5K`, `$0`

## SVG Parcel Map
- `viewBox="0 0 1220 490"`, parcels rendered as `<rect>` with text layers
- Each parcel box: parcel number top, pledge amount large center (tier color), resident name bottom
- `normalizeHouseNum(n)` extracts leading digits to unify `"2817"` and `"2817 W Sunrise Dr"`
- Applied in: `loadPledges()`, realtime subscription, `handleNewPledge()`, `handlePledgeDeleted()`

## Admin Dashboard
- Auth via `sessionStorage` key `isAdminAuthenticated: true`
- Sections: **Finances** (pledge list + edit/delete), **Moderation** (community messages), **Transactions** (audit log)
- Transactions reads from `pledge_log` — append-only, never modified
- `formatArizonaTime(iso)` formats timestamps in `America/Phoenix` (UTC-7, no DST)

## Pledge Log Functions (`src/lib/supabase.js`)
- `logPledgeTransaction({ type, house_number, name, amount, message })` — fire-and-forget insert to `pledge_log`
- `fetchPledgeLogs()` — select from `pledge_log` ordered by `created_at` desc, limit 500
- Called from: `NeighborhoodMap.jsx` (handlePledge, handleReset) and `AdminPage.jsx` (handleDeletePledge, saveEdit)

## Key Patterns & Gotchas
- **Deploying:** Always `git add` + `git commit` + `git push` — Vercel auto-deploys on push to `main`
- **RLS silent failures:** Use `.select()` on DELETE/UPDATE, check `!data?.length` for blocked ops
- **Video fullscreen:** Uses `webkitEnterFullscreen` first (iOS Safari), then standard Fullscreen API with 50ms delay
- **Tier pill layout:** 2×2 grid (`grid-cols-2`) for 4 tiers
- **House number normalization:** Always use `normalizeHouseNum()` when comparing house numbers

## Environment Variables (Vercel + local `.env.local`)
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## Project Owner
- Rick Tran — organizer at 2817 W Sunrise Dr, Laveen, AZ
