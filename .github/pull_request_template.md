## What

<!-- One or two sentences: what a visitor or Ty would see. -->

## Why

<!-- The request or plan step this answers. -->

## Review checklist

**Content and data**
- [ ] Content still reads and writes only the `Entry` contract in `types/entry.ts`
- [ ] New tables have RLS; migrations are new files, never edits

**Security**
- [ ] Admin writes check the session and allowlist on the server
- [ ] No secret or service-role key reaches the browser
- [ ] Untrusted HTML is sanitized before rendering

**UI** (rules in the `app-ui-design-audit` skill)
- [ ] Colors, sizes and durations come from design tokens
- [ ] Real content or a labeled empty slot, never filler art
- [ ] Motion honors reduced motion

**Code**
- [ ] Pure logic in `lib/` has tests; nothing duplicated
- [ ] typecheck, lint, tests and build pass

## Risk

<!-- What could break and who would notice. -->

## Rollback

<!-- How to undo it: usually revert this PR. Note any migration that needs a down step. -->
