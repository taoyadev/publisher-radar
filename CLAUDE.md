# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Google AdSense Sellers.json Explorer - A Next.js application for searching and analyzing 1M+ publishers from Google's sellers.json. Uses PostgreSQL on VPS Supabase with SSH tunnel for database access.

## Development Commands

```bash
# Development
npm run dev                    # Start dev server (requires SSH tunnel)
npm run build                  # Production build
npm run start                  # Production server
npm run lint                   # Run ESLint

# Data Management
npm run import:initial         # Initial import from sellers.json (one-time)
npm run daily:update           # Run daily update script manually

# AdSense API Integration (NEW)
npm run adsense:migrate        # Run database migration for AdSense schema
npm run adsense:enrich         # Enrich sellers with AdSense API data
# Examples:
#   npm run adsense:enrich -- --mode fill-missing --limit 1000
#   npm run adsense:enrich -- --mode verify-existing --resume
#   npm run adsense:enrich -- --dry-run

# Database Access (REQUIRED)
ssh -f -N -L 54321:localhost:54321 -L 54322:localhost:54322 vps-supabase
ps aux | grep "ssh.*54322" | grep -v grep  # Verify tunnel is running
```

## Architecture

### Database Connection Pattern

**Critical**: This application uses **direct PostgreSQL connection** (via `pg` library), NOT Supabase REST API. This bypasses RLS limitations with custom schemas.

- **Database client**: `src/lib/db.ts` - Connection pool with localhost:54322 (SSH tunnel)
- **Schema**: All tables live in `seller_adsense` schema, not `public`
- **SSH tunnel**: Must be active for all database operations (dev, scripts, API routes)

```typescript
// All queries must specify schema
await query('SELECT * FROM seller_adsense.sellers WHERE seller_id = $1', [id]);
```

### Data Model

**Core tables** (all in `seller_adsense` schema):

1. **sellers** - Main table with 1,026,101+ records
   - PK: `seller_id` (e.g., 'pub-1234567890')
   - Key fields: `seller_type`, `domain`, `name`, `first_seen_date`
   - No physical deletes - track via `updated_at`

2. **seller_domains** - Many-to-many seller↔domain relationships
   - FK to sellers via `seller_id`
   - Tracks `detection_source` and `confidence_score`
   - 146,779+ associations, 142,431+ unique domains

3. **all_domains (VIEW)** - 聚合视图，合并多数据源（推荐使用）
   - 合并 `seller_domains` (sellers.json) + `dnslytics.domains` (Host.io)
   - sellers.json 数据优先（source_priority=1）
   - Host.io 数据作为补充（source_priority=2, confidence=0.7）
   - 按 (seller_id, domain) 自动去重
   ```sql
   -- 推荐查询方式
   SELECT * FROM seller_adsense.all_domains WHERE seller_id = 'pub-xxx';
   ```

4. **daily_snapshots** - Historical tracking
   - Daily statistics: `total_count`, `new_count`, `removed_count`
   - Unique constraint on `snapshot_date`

### API Architecture

All API routes follow consistent pattern:

1. **Input validation**: Query params with defaults
2. **Error handling**: Try-catch with JSON error responses
3. **Pagination**: `page`, `limit` (max 100)
4. **Caching headers**: Configured in `next.config.ts`

**7 API endpoints**:
- `/api/stats` - Database statistics
- `/api/sellers/search` - Search with filters, pagination
- `/api/sellers/[id]` - Get single seller
- `/api/sellers/[id]/domains` - Seller's domains
- `/api/domains/search` - Search domains
- `/api/domains/[domain]/sellers` - Domain's sellers
- `/api/snapshots` - Daily snapshots with historical summary
- `/api/enrichment/status` - **NEW** AdSense API enrichment progress

### Component Structure

- **SearchInterface.tsx** - Main search UI with debounced queries (uses `useDebounce` hook)
- **StatsDisplay.tsx** - Live statistics from database
- **SellerCard.tsx** - Individual seller display with domain lists
- **DomainsByTLD.tsx** - TLD analysis component

## Daily Monitoring System

**Location**: `scripts/daily-update.ts`

**Cron setup** (runs at 2 AM daily):
```bash
0 2 * * * /Users/butterfly/.claude/newdev/seller-json/scripts/run-daily-update.sh
```

**How it works**:
1. Fetches sellers.json from Google CDN (~110MB)
2. Compares with database to detect: new, removed, updated sellers
3. Updates database (inserts/updates, no deletes)
4. Records snapshot in `daily_snapshots` table
5. Logs to `logs/daily-update-YYYYMMDD.log`

**Run manually**:
```bash
./scripts/run-daily-update.sh
# Or directly: npx tsx scripts/daily-update.ts
```

## AdSense API Integration

**Purpose**: Automatically enrich sellers with domain information from AdSense API to fill data gaps.

**API Details**:
- Endpoint: `https://adsense-api.lively-sound-ed65.workers.dev/api/domains?pubId={pub-id}`
- Rate Limit: 100 RPM (requests per minute)
- Coverage: Can enrich 882,725 sellers (85.74%) that lack domain information

**Database Enhancement**:
- New fields in `sellers` table: `adsense_api_checked`, `adsense_api_status`, `adsense_api_domain_count`, etc.
- Smart merging: Upgrades `seller_domains.detection_source` to `'both'` when same domain appears in both sellers.json and AdSense API
- Confidence scoring: `1.0` for double-confirmed domains, `0.95` for AdSense-only

**Usage**:
```bash
# Run migration first (one-time)
npm run adsense:migrate

# Enrich missing data (priority)
npm run adsense:enrich -- --mode fill-missing --limit 1000

# Verify existing data
npm run adsense:enrich -- --mode verify-existing

# Monitor progress
curl localhost:3000/api/enrichment/status
```

**Estimated Time**:
- Fill missing (882,725 sellers): ~6.13 days continuous @ 100 RPM
- Verify existing (146,779 sellers): ~1.02 days continuous
- Total: ~7.15 days for complete enrichment

See ADSENSE_INTEGRATION.md for detailed documentation.

## Common Development Scenarios

### Adding a new API endpoint

1. Create route file in `app/api/[endpoint]/route.ts`
2. Import `{ query }` from `@/lib/db`
3. Use schema-qualified queries: `seller_adsense.tablename`
4. Return consistent JSON: `{ data, error, total?, page?, limit? }`
5. Add caching headers in `next.config.ts` if needed

### Modifying database queries

- **Always specify schema**: `seller_adsense.sellers` not just `sellers`
- Use parameterized queries: `query(sql, [param1, param2])`
- Handle errors with try-catch
- Log query performance (already in `db.ts`)

### Working with seller domains

Sellers can have multiple domains via `seller_domains` table. Use JOIN queries:

```typescript
const result = await query(`
  SELECT s.*, sd.domain, sd.confidence_score
  FROM seller_adsense.sellers s
  LEFT JOIN seller_adsense.seller_domains sd ON s.seller_id = sd.seller_id
  WHERE s.seller_id = $1
`, [sellerId]);
```

### Testing with real data

No mock data - always use real database. For development:

1. Ensure SSH tunnel is running
2. Query limited records: `LIMIT 10` for testing
3. Use specific seller IDs from logs for edge cases
4. Check `daily_snapshots` for historical data testing

## Environment Setup

Required in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url  # Optional (not actively used)
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key      # Optional (not actively used)
ADSENSE_API_KEY=xxx                         # Required for AdSense API enrichment
```

**Note**: Supabase env vars exist but app uses direct PostgreSQL connection via SSH tunnel.

## Performance Considerations

- **Connection pooling**: Max 10 connections (see `db.ts`)
- **API caching**: 300s cache, 600s stale-while-revalidate
- **Query optimization**: Use indexed columns (`seller_id`, `domain`, `snapshot_date`)
- **Pagination**: Max 100 records per request enforced
- **Search debouncing**: 300ms debounce on frontend (see `useDebounce` hook)

## Deployment Notes

- **Output mode**: `standalone` (see `next.config.ts`)
- **Build optimization**: Package imports optimized for `@/components`, `@/lib`
- **Image optimization**: AVIF/WebP formats enabled
- **Target**: Vercel or Cloudflare Workers

**Pre-deployment checklist**:
1. Update environment variables on platform
2. Configure database connection (may need different approach than SSH tunnel)
3. Ensure cron job for daily updates is set up
4. Test API endpoints with production data

## Data Integrity Rules

- **No mock data**: Always use real sellers.json data
- **No physical deletes**: Track removals via snapshots and timestamps
- **Schema isolation**: All tables in `seller_adsense` schema
- **Data source**: https://storage.googleapis.com/adx-rtb-dictionaries/sellers.json
- **Cleanup policy**: Delete sellers.json files after import (see CLEANUP_POLICY.md)

## Troubleshooting

### Database connection errors

```bash
# Check SSH tunnel status
ps aux | grep "ssh.*54322" | grep -v grep

# Restart tunnel if needed
ssh -f -N -L 54321:localhost:54321 -L 54322:localhost:54322 vps-supabase
```

### TypeScript compilation errors in scripts

```bash
# Use tsx instead of ts-node for better compatibility
npx tsx scripts/daily-update.ts

# Or ensure ts-node is installed
npm install --save-dev ts-node @types/node @types/pg
```

### API returning empty results

- Verify SSH tunnel is active
- Check schema qualification in queries: `seller_adsense.sellers`
- Test query directly in database client
- Check API logs for query errors
