-- Performance Indexes for seller_adsense.sellers table
-- Run this script to optimize query performance

-- Index for seller_id searches (most common query)
CREATE INDEX IF NOT EXISTS idx_sellers_seller_id
ON seller_adsense.sellers(seller_id);

-- Index for domain searches
CREATE INDEX IF NOT EXISTS idx_sellers_domain
ON seller_adsense.sellers(domain)
WHERE domain IS NOT NULL;

-- Composite index for filtered searches (seller_type + domain presence)
CREATE INDEX IF NOT EXISTS idx_sellers_type_domain
ON seller_adsense.sellers(seller_type, domain);

-- Index for sorting by updated_at (default sort)
CREATE INDEX IF NOT EXISTS idx_sellers_updated_at
ON seller_adsense.sellers(updated_at DESC);

-- Index for first_seen_date (for date range filters)
CREATE INDEX IF NOT EXISTS idx_sellers_first_seen
ON seller_adsense.sellers(first_seen_date DESC);

-- Partial index for confidential sellers
CREATE INDEX IF NOT EXISTS idx_sellers_confidential
ON seller_adsense.sellers(seller_id)
WHERE is_confidential = true;

-- GIN index for faster ILIKE searches on seller_id and domain
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_sellers_seller_id_trgm
ON seller_adsense.sellers USING gin(seller_id gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_sellers_domain_trgm
ON seller_adsense.sellers USING gin(domain gin_trgm_ops)
WHERE domain IS NOT NULL;

-- GIN index for fuzzy domain search on seller_domains (ILIKE queries)
CREATE INDEX IF NOT EXISTS idx_seller_domains_domain_trgm
ON seller_adsense.seller_domains USING gin(domain gin_trgm_ops)
WHERE domain IS NOT NULL;

-- Analyze table to update statistics
ANALYZE seller_adsense.sellers;

-- Display index information
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'seller_adsense'
  AND tablename = 'sellers'
ORDER BY indexname;
