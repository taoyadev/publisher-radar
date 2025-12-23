# Production Checklist (Publisher Radar)

## Build & Runtime
- `npm run lint` passes
- `npm run build` passes (requires DB connection for sitemap generation)
- `npm run start` serves pages without runtime errors

## Required Environment Variables
- `NEXT_PUBLIC_SITE_URL` (canonical site URL, e.g. `https://publisherradar.com`)
- `NEXT_PUBLIC_APP_URL` (deployment base URL; used for `metadataBase`)
- Database connection variables used by `src/lib/db.ts` (`PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`, etc.)
- `REVALIDATE_SECRET` (required for `POST /api/revalidate`)

## SEO / Indexing
- `GET /robots.txt` returns a valid sitemap URL and does not block the main site
- `GET /sitemap.xml` returns URLs (static + top publishers/domains/TLDs)
- Page canonicals are correct:
  - `/` → canonical `/`
  - `/publishers` → canonical `/publishers`
  - `/publisher/[id]` → canonical `/publisher/[id]`
  - `/domain/[domain]` → canonical `/domain/[domain]`
  - `/tld` → canonical `/tld`
  - `/tld/[tld]` → canonical `/tld/[tld]`
  - `/publishers/search` is `noindex` by design
- Social previews render:
  - `GET /opengraph-image` and per-segment images (publisher/domain/tld)

## Data Ops
- SSH tunnel configured (dev): `ssh -f -N -L 54321:localhost:54321 -L 54322:localhost:54322 vps-supabase`
- Daily jobs scheduled (see `crontab.example`) and logs written to `logs/`
- Revalidation hook works (from automation job):
  - `POST /api/revalidate` with correct `REVALIDATE_SECRET`

