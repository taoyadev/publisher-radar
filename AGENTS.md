# Repository Guidelines

## Project Structure & Module Organization
- `app/` hosts the Next.js App Router pages, layouts, and API routes; route handlers live in nested `route.ts` files. Static assets sit in `public/`.
- `src/components/` holds UI building blocks (PascalCase files), `src/lib/` contains data/util clients (PostgreSQL, Supabase, types), `src/hooks/` for reusable React hooks, `src/config/` and `src/styles/` for shared config and Tailwind tokens.
- `scripts/` contains operational jobs (imports, enrichers, migrations, view maintenance). Run them with npm scripts rather than calling `tsx` directly when possible. Logs land in `logs/`.
- Import root alias `@/` maps to `src/` (see `tsconfig.json`), so prefer absolute imports over `../..`.

## Build, Test, and Development Commands
- `npm run dev` — start the Next.js dev server on :3000 (requires SSH tunnel to the Supabase VPS: `ssh -f -N -L 54321:localhost:54321 -L 54322:localhost:54322 vps-supabase`).
- `npm run lint` — ESLint with `next/core-web-vitals` + TypeScript rules; run before every PR.
- `npm run build` / `npm run start` — production build and serve.
- Data ops: `npm run import:initial`, `npm run daily:update`, `npm run automation:daily`, `npm run adsense:migrate`, `npm run adsense:enrich`, `npm run db:*` (indexes, refresh views, optimize). These require database env vars and the SSH tunnel.

## Coding Style & Naming Conventions
- TypeScript strict; favor typed server/client components. Use `'use client'` only when needed.
- Components and hooks use PascalCase files; utility modules use camelCase. Route folders stay kebab-case and co-locate UI + data loaders per route.
- Prefer single quotes, Tailwind utility-first styling, and React function components. Keep imports absolute via `@/`.
- Use ESLint autofix for formatting; no standalone Prettier config in this repo.

## Testing Guidelines
- There is no dedicated unit/integration test suite yet; linting plus manual verification drive quality.
- When adding tests, keep filenames `*.test.ts`/`*.test.tsx` alongside code or under `__tests__`. Use `npm run lint` as the minimal gate.
- For data jobs, dry-run against a staging DB first and capture sample output in `logs/` or the PR description.

## Commit & Pull Request Guidelines
- Follow the existing style: short, imperative subject lines with scope-aware phrasing (e.g., “Fix domain search to query all_domains view”). Keep bodies minimal and wrap at ~72 chars.
- PRs should include: concise summary, screenshots/GIFs for UI changes, steps to reproduce/verify, and links to issues or tickets.
- Call out DB schema changes, required env vars (`.env.local`), cron/PM2 updates (`crontab.example`, `ecosystem.config.js`), and any data backfills or manual runs needed after deploy.

## Security & Configuration Tips
- Copy `.env.example` to `.env.local`; never commit secrets. Dev and scripts require the SSH tunnel to reach Supabase ports 54321/54322.
- Use `next.config.ts` and `tailwind.config.ts` for shared settings; avoid hardcoding URLs or secrets in components.
- Before deploying or scheduling jobs, confirm the relevant script is idempotent and logs to `logs/` for traceability.
