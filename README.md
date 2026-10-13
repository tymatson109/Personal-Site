# Ty Matson

Personal site for Ty Matson's projects and writing: Next.js on Vercel, Neon Postgres for content, Vercel Blob for images, GitHub sign-in for the admin.

## Run it

```sh
npm install
vercel env pull .env.local   # DATABASE_URL for the Neon database; never commit it
npm run dev
```

The admin at `/admin` signs in with GitHub and needs `AUTH_SECRET`, `AUTH_GITHUB_ID` and `AUTH_GITHUB_SECRET` (a GitHub OAuth app whose callback is `<site>/api/auth/callback/github`). Only the GitHub ids in `lib/admin.ts` get in.

Pages read the database while building and running, so `npm run dev` and `npm run build` need `DATABASE_URL`. Any Postgres with `npm run db:migrate` applied works too.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Local dev server |
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript with no emit |
| `npm run lint` | ESLint |
| `npm test` | Vitest unit tests |
| `npm run db:migrate` | Applies every migration to the empty Postgres at `DATABASE_URL` |
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
