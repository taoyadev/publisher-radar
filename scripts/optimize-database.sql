-- ==============================================================================
-- Google AdSense Publisher Radar - Database Optimization for pSEO
-- ==============================================================================
-- Purpose: Optimize database for SSG/ISR with 1M+ publishers
-- Author: Claude Code
-- Date: 2025-11-18
-- ==============================================================================

-- ==============================================================================
-- PART 1: CREATE INDEXES
-- ==============================================================================

-- Index for seller_domains JOIN queries (most frequently used)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_seller_domains_seller_id_confidence
ON seller_adsense.seller_domains(seller_id, confidence_score DESC)
WHERE seller_id IS NOT NULL;

-- Index for analytics JOIN queries (traffic sorting)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analytics_domain_traffic
ON seller_adsense.similarweb_analytics(seller_domain_id, search_traffic_monthly DESC NULLS LAST)
WHERE seller_domain_id IS NOT NULL;

-- Index for seller sorting by first_seen_date (for "recently added" queries)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sellers_first_seen
ON seller_adsense.sellers(first_seen_date DESC NULLS LAST);

-- Index for seller_type filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sellers_type
ON seller_adsense.sellers(seller_type)
WHERE seller_type IS NOT NULL;

-- Index for domain lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_seller_domains_domain
ON seller_adsense.seller_domains(domain)
WHERE domain IS NOT NULL;

-- Composite index for domain + detection source
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_seller_domains_domain_source
ON seller_adsense.seller_domains(domain, detection_source, confidence_score DESC);

-- Index for sellers with domain (from sellers.json)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sellers_domain
ON seller_adsense.sellers(domain)
WHERE domain IS NOT NULL AND domain != '';

-- ==============================================================================
-- PART 2: CREATE MATERIALIZED VIEWS
-- ==============================================================================

-- Materialized view for publisher list pages (most expensive query)
DROP MATERIALIZED VIEW IF EXISTS seller_adsense.publisher_list_view CASCADE;

CREATE MATERIALIZED VIEW seller_adsense.publisher_list_view AS
SELECT
  s.seller_id,
  s.name,
  s.seller_type,
  s.domain as primary_domain,
  s.first_seen_date,
  s.created_at,
  s.updated_at,

  -- Domain statistics
  COUNT(DISTINCT sd.id) as domain_count,
  COUNT(DISTINCT sd.domain) as unique_domain_count,

  -- Traffic statistics
  MAX(sa.search_traffic_monthly) as max_traffic,
  SUM(sa.search_traffic_monthly) as total_traffic,
  AVG(sa.search_traffic_monthly) as avg_traffic,

  -- Data quality indicators
  MAX(sd.confidence_score) as max_confidence,
  COUNT(DISTINCT CASE WHEN sd.detection_source = 'both' THEN sd.id END) as verified_domains_count,

  -- AdSense API status
  s.adsense_api_checked,
  s.adsense_api_status,
  s.adsense_api_domain_count

FROM seller_adsense.sellers s
LEFT JOIN seller_adsense.seller_domains sd ON s.seller_id = sd.seller_id
LEFT JOIN seller_adsense.similarweb_analytics sa ON sd.id = sa.seller_domain_id

GROUP BY
  s.seller_id,
  s.name,
  s.seller_type,
  s.domain,
  s.first_seen_date,
  s.created_at,
  s.updated_at,
  s.adsense_api_checked,
  s.adsense_api_status,
  s.adsense_api_domain_count;

-- Create indexes on materialized view
CREATE UNIQUE INDEX idx_publisher_list_view_seller_id
ON seller_adsense.publisher_list_view(seller_id);

CREATE INDEX idx_publisher_list_view_traffic
ON seller_adsense.publisher_list_view(max_traffic DESC NULLS LAST);

CREATE INDEX idx_publisher_list_view_domain_count
ON seller_adsense.publisher_list_view(domain_count DESC);

CREATE INDEX idx_publisher_list_view_first_seen
ON seller_adsense.publisher_list_view(first_seen_date DESC NULLS LAST);

CREATE INDEX idx_publisher_list_view_type
ON seller_adsense.publisher_list_view(seller_type);

-- ==============================================================================
-- PART 3: DOMAIN AGGREGATION VIEW
-- ==============================================================================

DROP MATERIALIZED VIEW IF EXISTS seller_adsense.domain_aggregation_view CASCADE;

CREATE MATERIALIZED VIEW seller_adsense.domain_aggregation_view AS
SELECT
  sd.domain,

  -- Seller statistics
  COUNT(DISTINCT sd.seller_id) as seller_count,
  array_agg(DISTINCT sd.seller_id ORDER BY sd.seller_id) as seller_ids,

  -- Traffic statistics
  MAX(sa.search_traffic_monthly) as max_traffic,
  SUM(sa.search_traffic_monthly) as total_traffic,

  -- Detection info
  MAX(sd.confidence_score) as max_confidence,
  array_agg(DISTINCT sd.detection_source) as detection_sources,

  -- Timestamps
  MIN(sd.first_detected) as first_seen,
  MAX(sd.created_at) as last_updated

FROM seller_adsense.seller_domains sd
LEFT JOIN seller_adsense.similarweb_analytics sa ON sd.id = sa.seller_domain_id

WHERE sd.domain IS NOT NULL AND sd.domain != ''

GROUP BY sd.domain;

-- Create indexes on domain view
CREATE UNIQUE INDEX idx_domain_aggregation_domain
ON seller_adsense.domain_aggregation_view(domain);

CREATE INDEX idx_domain_aggregation_seller_count
ON seller_adsense.domain_aggregation_view(seller_count DESC);

CREATE INDEX idx_domain_aggregation_traffic
ON seller_adsense.domain_aggregation_view(max_traffic DESC NULLS LAST);

-- ==============================================================================
-- PART 4: TLD AGGREGATION VIEW
-- ==============================================================================

DROP MATERIALIZED VIEW IF EXISTS seller_adsense.tld_aggregation_view CASCADE;

CREATE MATERIALIZED VIEW seller_adsense.tld_aggregation_view AS
SELECT
  -- Extract TLD from domain
  LOWER(SUBSTRING(sd.domain FROM '\.([^.]+)$')) as tld,

  -- Statistics
  COUNT(DISTINCT sd.domain) as domain_count,
  COUNT(DISTINCT sd.seller_id) as seller_count,

  -- Traffic
  SUM(sa.search_traffic_monthly) as total_traffic,
  AVG(sa.search_traffic_monthly) as avg_traffic

FROM seller_adsense.seller_domains sd
LEFT JOIN seller_adsense.similarweb_analytics sa ON sd.id = sa.seller_domain_id

WHERE sd.domain IS NOT NULL
  AND sd.domain != ''
  AND sd.domain ~ '\.' -- Must contain a dot

GROUP BY LOWER(SUBSTRING(sd.domain FROM '\.([^.]+)$'));

-- Create indexes on TLD view
CREATE UNIQUE INDEX idx_tld_aggregation_tld
ON seller_adsense.tld_aggregation_view(tld);

CREATE INDEX idx_tld_aggregation_domain_count
ON seller_adsense.tld_aggregation_view(domain_count DESC);

CREATE INDEX idx_tld_aggregation_seller_count
ON seller_adsense.tld_aggregation_view(seller_count DESC);

-- ==============================================================================
-- PART 5: STATISTICS & ANALYSIS
-- ==============================================================================

-- Analyze tables for query planner optimization
ANALYZE seller_adsense.sellers;
ANALYZE seller_adsense.seller_domains;
ANALYZE seller_adsense.similarweb_analytics;
ANALYZE seller_adsense.daily_snapshots;

-- Analyze materialized views
ANALYZE seller_adsense.publisher_list_view;
ANALYZE seller_adsense.domain_aggregation_view;
ANALYZE seller_adsense.tld_aggregation_view;

-- ==============================================================================
-- PART 6: HELPER FUNCTION FOR CONCURRENT REFRESH
-- ==============================================================================

-- Function to refresh all materialized views concurrently
CREATE OR REPLACE FUNCTION seller_adsense.refresh_all_materialized_views()
RETURNS TABLE(view_name TEXT, status TEXT, duration_ms BIGINT) AS $$
DECLARE
  start_time TIMESTAMP;
  end_time TIMESTAMP;
BEGIN
  -- Refresh publisher_list_view
  start_time := clock_timestamp();
  REFRESH MATERIALIZED VIEW CONCURRENTLY seller_adsense.publisher_list_view;
  end_time := clock_timestamp();
  view_name := 'publisher_list_view';
  status := 'SUCCESS';
  duration_ms := EXTRACT(EPOCH FROM (end_time - start_time)) * 1000;
  RETURN NEXT;

  -- Refresh domain_aggregation_view
  start_time := clock_timestamp();
  REFRESH MATERIALIZED VIEW CONCURRENTLY seller_adsense.domain_aggregation_view;
  end_time := clock_timestamp();
  view_name := 'domain_aggregation_view';
  status := 'SUCCESS';
  duration_ms := EXTRACT(EPOCH FROM (end_time - start_time)) * 1000;
  RETURN NEXT;

  -- Refresh tld_aggregation_view
  start_time := clock_timestamp();
  REFRESH MATERIALIZED VIEW CONCURRENTLY seller_adsense.tld_aggregation_view;
  end_time := clock_timestamp();
  view_name := 'tld_aggregation_view';
  status := 'SUCCESS';
  duration_ms := EXTRACT(EPOCH FROM (end_time - start_time)) * 1000;
  RETURN NEXT;

EXCEPTION WHEN OTHERS THEN
  view_name := 'ERROR';
  status := SQLERRM;
  duration_ms := 0;
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- VERIFICATION QUERIES
-- ==============================================================================

-- Check index sizes
SELECT
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_indexes
JOIN pg_class ON pg_class.relname = indexname
WHERE schemaname = 'seller_adsense'
ORDER BY pg_relation_size(indexrelid) DESC;

-- Check materialized view sizes
SELECT
  schemaname,
  matviewname,
  pg_size_pretty(pg_relation_size(schemaname||'.'||matviewname)) as view_size
FROM pg_matviews
WHERE schemaname = 'seller_adsense';

-- Test query performance on publisher_list_view
EXPLAIN ANALYZE
SELECT * FROM seller_adsense.publisher_list_view
ORDER BY max_traffic DESC NULLS LAST
LIMIT 100;

-- ==============================================================================
-- USAGE INSTRUCTIONS
-- ==============================================================================

/*
To run this script:

1. Via psql (through SSH tunnel):
   psql -h localhost -p 54322 -U postgres -d postgres -f scripts/optimize-database.sql

2. Via npm script (to be created):
   npm run db:optimize

3. To refresh materialized views:
   SELECT * FROM seller_adsense.refresh_all_materialized_views();

4. To check if indexes are being used:
   EXPLAIN ANALYZE <your query>;

5. Schedule automatic refresh (add to daily-update.ts):
   await query('SELECT * FROM seller_adsense.refresh_all_materialized_views()');
*/
