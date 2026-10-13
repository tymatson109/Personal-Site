<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Ty Matson's personal site

Next.js (App Router) on Vercel. Content lives in Neon Postgres, images in Vercel Blob, and the admin signs in with GitHub through Auth.js. Public pages are static and refresh when content is published. The admin at `/admin` is for Ty only.

## Hard rules

- **Ty merges.** Work on a branch (`feature/*`, `fix/*`, `chore/*`), open a pull request into `master`, and stop. Never push to `master`, never merge, never change production settings, Vercel or Neon dashboards.
- **One PR, one concern.** Follow the numbered PR plan; queue new requests until the current PR is up.
- **Ty checks on a phone.** Do not verify UI in a browser or emulator. Verify with typecheck, lint, tests and build, and say plainly what was not seen running.

## Invariants

- **One content contract.** `types/entry.ts` (`Entry`, `Block`, `Section`) is the only shape for content. The editor, the Substack sync and every page convert into or read from it. Never a second shape.
- **`lib/` logic is pure** where it decides things (read time, formatting, ordering, feed parsing): no React, no database, no network, no `Date.now()` (time is a parameter). Every pure module has a test file next to it.
- **Server authority.** Every admin page, server action and route starts with `requireAdmin()` from `features/admin/session.ts`, which checks the session and the allowlist in `lib/admin.ts` (GitHub account ids) on every request. Never gate admin work in a layout or the proxy alone. The one route that runs with no one signed in is the scheduled Substack sync in `app/api/cron/substack`, which checks `CRON_SECRET` through `scheduledRun()` in `features/cron/session.ts` instead. The browser never holds a database URL or any secret. Only `NEXT_PUBLIC_*` public values reach the client.
- **Row-level security on every table.** The site never queries as the database owner. Public pages run as `site_reader`, which sees published content only; admin actions run as `site_admin` through `asAdmin(admin, …)` in `lib/db.ts`, which takes the `Admin` that `requireAdmin()` returns, so no write can run before the session check. The Substack sync runs as `site_sync` through `asSync(run, …)`, which can only add Substack posts and refresh their words. Every admin write then calls `revalidatePath("/", "layout")` so the static public pages pick it up. Both are enforced in the database by RLS and checked by `db/tests/rls.sql`.
- **Untrusted input stays untrusted.** Substack feed HTML and editor content are sanitized before rendering. No `dangerouslySetInnerHTML` on unsanitized strings.
- **Migrations:** a new timestamped file in `db/migrations/` every time, never edit an applied one, RLS and `site_reader`/`site_admin` grants on every new table, a check for them in `db/tests/rls.sql`, count rows before anything destructive and say the number. Production has no migration runner yet: Ty pastes each new migration into Neon's SQL Editor, so a PR with a migration says so at the top.
- **Pages read content only through `features/content/queries.ts`**, which runs every query as `site_reader` through `asReader` in `lib/db.ts`. Rows become the contract in `lib/rows.ts`, which drops anything malformed.
- **Uploads:** photos and recordings go from the browser straight to Vercel Blob through `app/api/admin/upload`, which hands out a token only after `requireAdmin()`. Blocks keep files in `media`, and `lib/media.ts` decides which URLs count as ours; anything else is dropped when read.
- **One module builds outbound links:** `lib/links.ts` (GitHub, LinkedIn, email, Substack). A link set to `null` stays hidden until it is filled in.

## Design

UI follows the `app-ui-design-audit` skill: the one home for Ty's design rules. Site-specific additions and exceptions:

- Pages scroll (it is a website). Everything else in the skill applies, including "show the real thing, never filler art".
- Every color, size, spacing, radius, font and duration comes from `components/ui/tokens.css`. A value with no token gets a new token. `components/ui/tokens.test.ts` fails on any hardcoded color or size in other stylesheets, or on a token that doesn't exist.
- Components style with CSS Modules next to the component. `app/globals.css` holds base element styles only.
- Reduced motion zeroes `--dur`, `--dur-fast` and `--rise` in the tokens, so CSS motion built on them needs no extra check. JavaScript motion still checks `prefers-reduced-motion` itself.
- Look: minimal editorial, monochrome with one electric-blue accent, Geist for text and Geist Mono for labels, light and dark following the system.
- Motion is expressive but always honors `prefers-reduced-motion`.
- Page headlines use `RiseWords`; blocks that should rise in as they scroll into view get `data-reveal` (handled once by `ScrollReveal` in the site layout). Never hide content that is already on the first screen.

## Code quality

- One function, one purpose. Repeated once means shared. Near-duplicate components become one parameterized component.
- No TypeScript `enum` (string unions plus `Record`), no `any`.
- Comments are one line, say why not what, and describe current purpose, not the story of how it was found.
- Test names are full sentences. A bug fix starts with a failing test.

## Before you say it is done

1. `npm run typecheck`
2. `npm run lint`
3. `npm test`
4. `npm run build` (needs `DATABASE_URL`; CI builds against a freshly migrated Postgres)
5. `npm run db:test` when `db/` changed (needs `DATABASE_URL` to an empty Postgres; CI runs it on every PR)
6. Read your own diff against this file, then fill in the PR template, including Risk and Rollback.
