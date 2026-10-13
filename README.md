# Ty Matson

Personal site for Ty Matson's projects and writing: Next.js on Vercel, Supabase for content and the admin login.

## Run it

```sh
npm install
npm run dev
```

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Local dev server |
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript with no emit |
| `npm run lint` | ESLint |
| `npm test` | Vitest unit tests |

## Layout

| Path | Holds |
| --- | --- |
| `app/` | Routes (App Router) |
| `features/` | Page sections and their hooks, grouped by area |
| `components/ui/` | Design tokens and shared UI |
| `lib/` | Pure logic with tests next to it, plus clients |
| `types/` | The shared content contract (`Entry`, `Block`, `Section`) |
| `supabase/migrations/` | Database schema, one timestamped file per change |

Rules for working in this repo are in [AGENTS.md](AGENTS.md).
