# Ty Matson

Personal site for Ty Matson's projects and writing: Next.js on Vercel, Neon Postgres for content, Vercel Blob for images, GitHub sign-in for the admin.

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
| `npm run db:test` | Migrations and row-level security checks against an empty Postgres at `DATABASE_URL` |

## Layout

| Path | Holds |
| --- | --- |
| `app/` | Routes (App Router) |
| `features/` | Page sections and their hooks, grouped by area |
| `components/ui/` | Design tokens and shared UI |
| `lib/` | Pure logic with tests next to it, plus clients |
| `types/` | The shared content contract (`Entry`, `Block`, `Section`) |
| `db/migrations/` | Database schema, one timestamped file per change |
| `db/tests/` | Row-level security and constraint checks |

Rules for working in this repo are in [AGENTS.md](AGENTS.md).
