# Contributing

1. Branch from `master`: `feature/<name>`, `fix/<name>` or `chore/<name>`.
2. Run `npm install` once; it points git at `.githooks/`, which blocks direct pushes to `master`.
3. Make one change per pull request.
4. Before pushing, run `npm run typecheck`, `npm run lint`, `npm test` and `npm run build`.
5. Open a pull request into `master` using the template. CI runs the same checks. Ty reviews and merges; Vercel deploys `master` to production.
