<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Ty Matson's personal site

Next.js (App Router) on Vercel with Supabase for content, media and the admin login. Public pages are static and refresh when content is published. The admin at `/admin` is for Ty only.

## Hard rules

- **Ty merges.** Work on a branch (`feature/*`, `fix/*`, `chore/*`), open a pull request into `master`, and stop. Never push to `master`, never merge, never change production settings, Vercel or Supabase dashboards.
- **One PR, one concern.** Follow the numbered PR plan; queue new requests until the current PR is up.
- **Ty checks on a phone.** Do not verify UI in a browser or emulator. Verify with typecheck, lint, tests and build, and say plainly what was not seen running.

## Invariants

- **One content contract.** `types/entry.ts` (`Entry`, `Block`, `Section`) is the only shape for content. The editor, the Substack sync and every page convert into or read from it. Never a second shape.
- **`lib/` logic is pure** where it decides things (read time, formatting, ordering, feed parsing): no React, no Supabase, no network, no `Date.now()` (time is a parameter). Every pure module has a test file next to it.
- **Server authority.** Every admin write goes through a server action or route that checks the session and the admin allowlist. The browser never holds a service-role key. Only `NEXT_PUBLIC_*` public values reach the client.
- **Row-level security on every table.** Visitors can read published content only. Writes are admin-only, enforced in the database, not just the UI.
- **Untrusted input stays untrusted.** Substack feed HTML and editor content are sanitized before rendering. No `dangerouslySetInnerHTML` on unsanitized strings.
- **Migrations:** a new timestamped file in `supabase/migrations/` every time, never edit an applied one, RLS on every new table, count rows before anything destructive and say the number.
- **One module builds outbound links** (Substack, App Store, GitHub) once it exists.

## Design

UI follows the `app-ui-design-audit` skill: the one home for Ty's design rules. Site-specific additions and exceptions:

- Pages scroll (it is a website). Everything else in the skill applies, including "show the real thing, never filler art".
- Every color, size, spacing, radius, font and duration comes from `components/ui/tokens.css`. A value with no token gets a new token. `components/ui/tokens.test.ts` fails on any hardcoded color or size in other stylesheets, or on a token that doesn't exist.
- Components style with CSS Modules next to the component. `app/globals.css` holds base element styles only.
- Reduced motion zeroes `--dur`, `--dur-fast` and `--rise` in the tokens, so CSS motion built on them needs no extra check. JavaScript motion still checks `prefers-reduced-motion` itself.
- Look: minimal editorial, monochrome with one electric-blue accent, Geist for text and Geist Mono for labels, light and dark following the system.
- Motion is expressive but always honors `prefers-reduced-motion`.

## Code quality

- One function, one purpose. Repeated once means shared. Near-duplicate components become one parameterized component.
- No TypeScript `enum` (string unions plus `Record`), no `any`.
- Comments are one line, say why not what, and describe current purpose, not the story of how it was found.
- Test names are full sentences. A bug fix starts with a failing test.

## Before you say it is done

1. `npm run typecheck`
2. `npm run lint`
3. `npm test`
4. `npm run build`
5. Read your own diff against this file, then fill in the PR template, including Risk and Rollback.
