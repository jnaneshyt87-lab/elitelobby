# EliteLobby

A premium esports tournament platform for competitive mobile gaming (Free Fire, BGMI, Valorant, COD Mobile). Players can browse/join paid tournaments, track rankings, manage their wallet, and admins can manage everything via a dedicated panel.

## Run & Operate

- `pnpm --filter @workspace/web run dev` — run the Next.js frontend (port 22333)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, legacy Meridian API — not used by EliteLobby yet)

## Stack

- **Frontend**: Next.js 15.1.8, React 19, Tailwind CSS v4, Framer Motion, Lucide React
- **Backend**: Supabase (PostgreSQL + Auth + RLS) — optional, falls back to mock data
- **Fonts**: Orbitron (display), Rajdhani (headings), Inter (body) via Google Fonts
- **Design**: Cyberpunk/dark gaming aesthetic — glassmorphism, neon glows, animated grid background

## Where things live

- `artifacts/web/app/` — Next.js App Router pages
  - `page.tsx` — Landing page (hero, stats, featured tournaments, leaderboard preview, testimonials)
  - `auth/login/page.tsx` — Login
  - `auth/signup/page.tsx` — 2-step registration
  - `dashboard/page.tsx` — Player dashboard (profile, wallet, notifications, tournaments)
  - `tournaments/page.tsx` — Tournament listing with filters
  - `tournaments/[id]/page.tsx` — Tournament detail with registration and room ID reveal
  - `leaderboard/page.tsx` — Global leaderboard with podium and table
  - `admin/page.tsx` — Admin panel (overview, tournaments, users, payments, announcements)
  - `support/page.tsx` — FAQ, support tickets, report player
- `artifacts/web/components/` — Shared components
  - `layout/navbar.tsx` — Sticky glass navbar with mobile menu
  - `layout/footer.tsx` — Footer with Discord CTA
  - `ui/tournament-card.tsx` — Full-featured tournament card with countdown
  - `ui/stats-counter.tsx` — Animated stat counter
- `artifacts/web/lib/` — Utilities
  - `mock-data.ts` — Rich mock data for all entities (tournaments, leaderboard, users)
  - `supabase.ts` — Browser client (null-safe when credentials missing)
  - `utils.ts` — cn(), formatCurrency(), formatTimeLeft(), getRankColor()
- `artifacts/web/supabase/schema.sql` — Full Supabase schema with RLS policies

## Supabase Setup

To connect to a real database, add these secrets:
- `NEXT_PUBLIC_SUPABASE_URL` — your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — your Supabase anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` — your Supabase service role key (for admin operations)

Run `artifacts/web/supabase/schema.sql` in the Supabase SQL Editor to create all tables.

Without these, the app runs fully on mock data.

## Design System

- **BG**: `#050508` near-black
- **Primary**: `#7c3aed` purple with neon glow
- **Secondary**: `#06b6d4` cyan
- **Danger/Live**: `#ef4444` red
- **Gold/Prize**: `#f59e0b` amber
- **CSS classes**: `.glass`, `.glass-card`, `.btn-primary`, `.btn-secondary`, `.btn-gold`, `.btn-danger`, `.gradient-text`, `.gradient-text-gold`, `.live-badge`, `.live-dot`, `.rgb-border`, `.gaming-table`, `.gaming-input`, `.progress-bar`, `.progress-fill`

## User preferences

- Cyberpunk/dark gaming design (Valorant/BGMI aesthetic)
- Indian market focus (₹ currency, UPI payments)
- All pages use `"use client"` since they have interactive elements

## Gotchas

- Tailwind v4 uses `@import "tailwindcss"` in CSS + `@tailwindcss/postcss` in postcss.config.mjs — NO tailwind.config.ts needed
- Next.js 15 App Router: all interactive pages need `"use client"` at the top
- Font loading via `next/font/google` is NOT used — Google Fonts are loaded via CSS `@import` in globals.css (simpler for custom font-family CSS classes)
- Path alias `@/*` maps to `./` (root of artifacts/web), not `./src/*`
