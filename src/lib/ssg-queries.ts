/**
 * SSG Data Extraction Layer
 * Optimized queries for Static Site Generation with 1M+ publishers
 *
 * All queries are designed to:
 * - Use materialized views where possible
 * - Minimize JOIN operations
 * - Return typed results
 * - Support pagination
 * - Be cache-friendly with in-memory caching
 */

import { query } from './db';

// ============================================================================
// SIMPLE IN-MEMORY CACHE
// ============================================================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<unknown>>();
const DEFAULT_CACHE_TTL = 60000; // 1 minute default

function getCached<T>(key: string, ttl: number = DEFAULT_CACHE_TTL): T | null {
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  if (entry && Date.now() - entry.timestamp < ttl) {
    return entry.data;
  }
  return null;
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

// Clean up old cache entries periodically
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    const maxAge = 300000; // 5 minutes max age
    for (const [key, entry] of cache.entries()) {
      if (now - entry.timestamp > maxAge) {
        cache.delete(key);
      }
    }
  }, 60000); // Run cleanup every minute
}
import type {
  PublisherListItem,
  PublisherDetail,
  PublisherDomainDetail,
  DomainAggregation,
  TldAggregation,
  HomePageStats,
} from './types';

// ============================================================================
// PUBLISHER QUERIES
// ============================================================================

/**
 * Fetch single publisher with all details (for /publisher/[id] page)
 * Uses single optimized query with JOINs
 */
export async function fetchPublisherDetail(
  sellerId: string
): Promise<PublisherDetail | null> {
  const result = await query<{
    seller_id: string;
    name: string | null;
    seller_type: 'PUBLISHER' | 'BOTH';
    is_confidential: boolean;
    primary_domain: string | null;
    first_seen_date: string;
    created_at: string;
    updated_at: string;
    domain_count: string;
    unique_domain_count: string;
    max_traffic: string | null;
    total_traffic: string | null;
    adsense_api_checked: boolean | null;
    adsense_api_status: string | null;
    adsense_api_domain_count: number | null;
    domains: PublisherDomainDetail[];
  }>(
    `
    WITH publisher_data AS (
      SELECT
        s.seller_id,
        s.name,
        s.seller_type,
        s.is_confidential,
        s.domain as primary_domain,
        s.first_seen_date,
        s.created_at,
        s.updated_at,
        s.adsense_api_checked,
        s.adsense_api_status,
        s.adsense_api_domain_count
      FROM seller_adsense.sellers s
      WHERE s.seller_id = $1
    ),
    domain_data AS (
      SELECT
        COALESCE(
          json_agg(
            json_build_object(
              'domain', sd.domain,
              'confidence_score', sd.confidence_score,
              'detection_source', sd.detection_source,
              'first_detected', sd.first_detected,
              'search_traffic_monthly', NULL,
              'total_traffic_monthly', NULL
            )
            ORDER BY
              sd.confidence_score DESC
          ) FILTER (WHERE sd.domain IS NOT NULL),
          '[]'
        ) as domains,
        COUNT(sd.domain) as domain_count,
        COUNT(DISTINCT sd.domain) as unique_domain_count,
        NULL as max_traffic,
        NULL as total_traffic
      FROM publisher_data p
      LEFT JOIN seller_adsense.all_domains sd ON p.seller_id = sd.seller_id
    )
    SELECT
      p.*,
      d.domains,
      d.domain_count,
      d.unique_domain_count,
      d.max_traffic,
      d.total_traffic
    FROM publisher_data p
    CROSS JOIN domain_data d;
    `,
    [sellerId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];

  return {
    seller_id: row.seller_id,
    name: row.name,
    seller_type: row.seller_type,
    is_confidential: row.is_confidential,
    primary_domain: row.primary_domain,
    first_seen_date: row.first_seen_date,
    created_at: row.created_at,
    updated_at: row.updated_at,
    domain_count: parseInt(row.domain_count),
    unique_domain_count: parseInt(row.unique_domain_count),
    max_traffic: row.max_traffic ? parseFloat(row.max_traffic) : null,
    total_traffic: row.total_traffic ? parseFloat(row.total_traffic) : null,
    adsense_api_checked: row.adsense_api_checked,
    adsense_api_status: row.adsense_api_status,
    adsense_api_domain_count: row.adsense_api_domain_count,
    domains: row.domains,
  };
}

/**
 * Batch fetch publishers by IDs (optimized to avoid N+1 queries)
 * Fetches multiple publishers in a single query
 */
export async function fetchPublishersByIds(
  sellerIds: string[]
): Promise<PublisherListItem[]> {
  if (sellerIds.length === 0) {
    return [];
  }

  const result = await query<PublisherListItem>(
    `
    SELECT
      s.seller_id,
      s.name,
      s.seller_type,
      s.is_confidential,
      s.domain as primary_domain,
      s.first_seen_date,
      COALESCE(
        (SELECT COUNT(*) FROM seller_adsense.all_domains sd WHERE sd.seller_id = s.seller_id),
        0
      ) as domain_count,
      NULL::bigint as max_traffic
    FROM seller_adsense.sellers s
    WHERE s.seller_id = ANY($1)
    ORDER BY s.seller_id
    `,
    [sellerIds]
  );

  return result.rows;
}

/**
 * Fetch top publishers for static generation
 * Returns seller_ids for generateStaticParams
 */
export async function fetchTopPublisherIds(limit: number = 10000): Promise<string[]> {
  const result = await query<{ seller_id: string }>(
    `
    SELECT seller_id
    FROM seller_adsense.publisher_list_view
    WHERE domain_count > 0
    ORDER BY
      max_traffic DESC NULLS LAST,
      domain_count DESC,
      seller_id ASC
    LIMIT $1;
    `,
    [limit]
  );

  return result.rows.map(row => row.seller_id);
}

/**
 * Fetch publisher list (for /publishers)
 * Uses materialized view for fast performance
 */
export async function fetchPublisherList(
  page: number = 1,
  limit: number = 100,
  sortBy: 'traffic' | 'domains' | 'recent' = 'traffic'
): Promise<{ publishers: PublisherListItem[]; total: number }> {
  // Determine sort column
  const sortColumn =
    sortBy === 'traffic'
      ? 'max_traffic DESC NULLS LAST'
      : sortBy === 'domains'
      ? 'domain_count DESC'
      : 'first_seen_date DESC NULLS LAST';

  const offset = (page - 1) * limit;

  const [listResult, countResult] = await Promise.all([
    query<PublisherListItem>(
      `
      SELECT *
      FROM seller_adsense.publisher_list_view
      WHERE domain_count > 0
      ORDER BY ${sortColumn}, seller_id ASC
      LIMIT $1 OFFSET $2;
      `,
      [limit, offset]
    ),
    query<{ count: string }>(
      'SELECT COUNT(*) as count FROM seller_adsense.publisher_list_view WHERE domain_count > 0'
    ),
  ]);

  return {
    publishers: listResult.rows,
    total: parseInt(countResult.rows[0].count),
  };
}

/**
 * Fetch recently added publishers (for homepage, cached for 2 minutes)
 */
export async function fetchRecentPublishers(limit: number = 20): Promise<PublisherListItem[]> {
  const cacheKey = `recent_publishers_${limit}`;
  const cached = getCached<PublisherListItem[]>(cacheKey, 120000); // 2 min cache
  if (cached) return cached;

  const result = await query<PublisherListItem>(
    `
    SELECT *
    FROM seller_adsense.publisher_list_view
    WHERE domain_count > 0
    ORDER BY first_seen_date DESC NULLS LAST
    LIMIT $1;
    `,
    [limit]
  );

  setCache(cacheKey, result.rows);
  return result.rows;
}

/**
 * Fetch top publishers by traffic (for homepage, cached for 2 minutes)
 */
export async function fetchTopPublishersByTraffic(
  limit: number = 10
): Promise<PublisherListItem[]> {
  const cacheKey = `top_publishers_traffic_${limit}`;
  const cached = getCached<PublisherListItem[]>(cacheKey, 120000); // 2 min cache
  if (cached) return cached;

  const result = await query<PublisherListItem>(
    `
    SELECT *
    FROM seller_adsense.publisher_list_view
    WHERE max_traffic IS NOT NULL
    ORDER BY max_traffic DESC
    LIMIT $1;
    `,
    [limit]
  );

  setCache(cacheKey, result.rows);
  return result.rows;
}

/**
 * Find related publishers (by shared domains)
 * Optimized with caching and efficient query structure
 */
export async function fetchRelatedPublishers(
  sellerId: string,
  limit: number = 5
): Promise<PublisherListItem[]> {
  // Add caching to reduce database load
  const cacheKey = `related_publishers_${sellerId}_${limit}`;
  const cached = getCached<PublisherListItem[]>(cacheKey, 120000); // 2 min cache
  if (cached) return cached;

  // Optimized query: use INNER JOIN instead of WHERE IN subquery
  // and limit domain scan to prevent excessive data processing
  const result = await query<PublisherListItem>(
    `
    WITH publisher_domains AS (
      SELECT domain
      FROM seller_adsense.all_domains
      WHERE seller_id = $1
      LIMIT 100  -- Prevent excessive domain scans for publishers with many domains
    ),
    related_seller_ids AS (
      SELECT sd.seller_id, COUNT(*) as shared_domain_count
      FROM seller_adsense.all_domains sd
      WHERE sd.seller_id != $1
        AND EXISTS (
          SELECT 1 FROM publisher_domains pd WHERE pd.domain = sd.domain
        )
      GROUP BY sd.seller_id
      ORDER BY shared_domain_count DESC
      LIMIT 20
    )
    SELECT plv.*
    FROM seller_adsense.publisher_list_view plv
    INNER JOIN related_seller_ids rsi ON plv.seller_id = rsi.seller_id
    ORDER BY plv.max_traffic DESC NULLS LAST
    LIMIT $2;
    `,
    [sellerId, limit]
  );

  setCache(cacheKey, result.rows);
  return result.rows;
}

// ============================================================================
// DOMAIN QUERIES
// ============================================================================

/**
 * Fetch domain details (for /domain/[domain] page)
 */
export async function fetchDomainDetail(domain: string): Promise<DomainAggregation | null> {
  const viewResult = await query<DomainAggregation>(
    `
    SELECT *
    FROM seller_adsense.domain_aggregation_view
    WHERE domain = $1;
    `,
    [domain]
  );

  if (viewResult.rows.length > 0) {
    return viewResult.rows[0];
  }

  // Fall back to an on-demand aggregation when the materialized view is stale
  const fallbackResult = await query<DomainAggregation>(
    `
    SELECT
      ad.domain,
      COUNT(DISTINCT ad.seller_id) as seller_count,
      array_agg(DISTINCT ad.seller_id ORDER BY ad.seller_id) as seller_ids,
      NULL::bigint as max_traffic,
      NULL::bigint as total_traffic,
      MAX(ad.confidence_score) as max_confidence,
      array_agg(DISTINCT ad.detection_source) as detection_sources,
      MIN(ad.first_detected) as first_seen,
      MAX(ad.created_at) as last_updated
    FROM seller_adsense.all_domains ad
    WHERE ad.domain = $1
    GROUP BY ad.domain;
    `,
    [domain]
  );

  if (fallbackResult.rows.length === 0) {
    return null;
  }

  console.warn(
    `[Domain Detail] Materialized view miss for domain "${domain}" – using live aggregation`
  );

  return fallbackResult.rows[0];
}

/**
 * Fetch top domains for static generation
 */
export async function fetchTopDomains(limit: number = 5000): Promise<string[]> {
  const result = await query<{ domain: string }>(
    `
    SELECT domain
    FROM seller_adsense.domain_aggregation_view
    ORDER BY
      max_traffic DESC NULLS LAST,
      seller_count DESC
    LIMIT $1;
    `,
    [limit]
  );

  return result.rows.map(row => row.domain);
}

/**
 * Fetch top domains with full details (for homepage, cached for 2 minutes)
 */
export async function fetchTopDomainDetails(limit: number = 10): Promise<DomainAggregation[]> {
  const cacheKey = `top_domains_${limit}`;
  const cached = getCached<DomainAggregation[]>(cacheKey, 120000); // 2 min cache
  if (cached) return cached;

  const result = await query<DomainAggregation>(
    `
    SELECT *
    FROM seller_adsense.domain_aggregation_view
    WHERE max_traffic IS NOT NULL
    ORDER BY max_traffic DESC
    LIMIT $1;
    `,
    [limit]
  );

  setCache(cacheKey, result.rows);
  return result.rows;
}

// ============================================================================
// TLD QUERIES
// ============================================================================

/**
 * Fetch TLD details (for /tld/[tld] page)
 */
export async function fetchTldDetail(tld: string): Promise<TldAggregation | null> {
  const result = await query<TldAggregation>(
    `
    SELECT *
    FROM seller_adsense.tld_aggregation_view
    WHERE tld = $1;
    `,
    [tld]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
}

/**
 * Fetch all TLDs (for static generation)
 */
export async function fetchAllTlds(): Promise<string[]> {
  const result = await query<{ tld: string }>(
    `
    SELECT tld
    FROM seller_adsense.tld_aggregation_view
    ORDER BY domain_count DESC;
    `
  );

  return result.rows.map(row => row.tld);
}

/**
 * Fetch publishers by TLD (for /tld/[tld]/page/[page])
 */
export async function fetchPublishersByTld(
  tld: string,
  page: number = 1,
  limit: number = 100
): Promise<{ publishers: PublisherListItem[]; total: number }> {
  const offset = (page - 1) * limit;

  const [listResult, countResult] = await Promise.all([
    query<PublisherListItem>(
      `
      SELECT DISTINCT plv.*
      FROM seller_adsense.publisher_list_view plv
      INNER JOIN seller_adsense.all_domains sd ON plv.seller_id = sd.seller_id
      WHERE LOWER(SUBSTRING(sd.domain FROM '\.([^.]+)$')) = $1
      ORDER BY plv.max_traffic DESC NULLS LAST
      LIMIT $2 OFFSET $3;
      `,
      [tld.toLowerCase(), limit, offset]
    ),
    query<{ count: string }>(
      `
      SELECT COUNT(DISTINCT plv.seller_id) as count
      FROM seller_adsense.publisher_list_view plv
      INNER JOIN seller_adsense.all_domains sd ON plv.seller_id = sd.seller_id
      WHERE LOWER(SUBSTRING(sd.domain FROM '\.([^.]+)$')) = $1;
      `,
      [tld.toLowerCase()]
    ),
  ]);

  return {
    publishers: listResult.rows,
    total: parseInt(countResult.rows[0].count),
  };
}

// ============================================================================
// STATS QUERIES
// ============================================================================

/**
 * Fetch homepage statistics (cached for 5 minutes)
 */
export async function fetchHomePageStats(): Promise<HomePageStats> {
  const cacheKey = 'homepage_stats';
  const cached = getCached<HomePageStats>(cacheKey, 300000); // 5 min cache
  if (cached) return cached;

  const result = await query<{
    total_publishers: string;
    total_domains: string;
    total_verified_domains: string;
    publishers_with_traffic: string;
    total_traffic: string;
    avg_domains_per_publisher: string;
    new_last_7_days: string;
    new_last_30_days: string;
  }>(
    `
    SELECT
      (SELECT COUNT(*) FROM seller_adsense.sellers) as total_publishers,
      (SELECT COUNT(*) FROM seller_adsense.domain_aggregation_view) as total_domains,
      (SELECT COUNT(*) FROM seller_adsense.all_domains WHERE confidence_score = 1.0) as total_verified_domains,
      (SELECT COUNT(*) FROM seller_adsense.publisher_list_view WHERE max_traffic IS NOT NULL) as publishers_with_traffic,
      (SELECT COALESCE(SUM(max_traffic), 0) FROM seller_adsense.publisher_list_view) as total_traffic,
      (SELECT ROUND(AVG(domain_count), 2) FROM seller_adsense.publisher_list_view) as avg_domains_per_publisher,
      (SELECT COUNT(*) FROM seller_adsense.sellers WHERE first_seen_date >= CURRENT_DATE - INTERVAL '7 days') as new_last_7_days,
      (SELECT COUNT(*) FROM seller_adsense.sellers WHERE first_seen_date >= CURRENT_DATE - INTERVAL '30 days') as new_last_30_days;
    `
  );

  const row = result.rows[0];

  const stats: HomePageStats = {
    total_publishers: parseInt(row.total_publishers),
    total_domains: parseInt(row.total_domains),
    total_verified_domains: parseInt(row.total_verified_domains),
    publishers_with_traffic: parseInt(row.publishers_with_traffic),
    total_traffic: parseFloat(row.total_traffic),
    avg_domains_per_publisher: parseFloat(row.avg_domains_per_publisher),
    recent_growth: {
      new_last_7_days: parseInt(row.new_last_7_days),
      new_last_30_days: parseInt(row.new_last_30_days),
    },
  };

  setCache(cacheKey, stats);
  return stats;
}

/**
 * Check if a publisher exists (for notFound() in SSG)
 */
export async function publisherExists(sellerId: string): Promise<boolean> {
  const result = await query<{ exists: boolean }>(
    `
    SELECT EXISTS(
      SELECT 1 FROM seller_adsense.sellers WHERE seller_id = $1
    ) as exists;
    `,
    [sellerId]
  );

  return result.rows[0].exists;
}

/**
 * Check if a domain exists
 */
export async function domainExists(domain: string): Promise<boolean> {
  const result = await query<{ exists: boolean }>(
    `
    SELECT (
      EXISTS(
        SELECT 1 FROM seller_adsense.domain_aggregation_view WHERE domain = $1
      ) OR EXISTS(
        SELECT 1 FROM seller_adsense.seller_domains WHERE domain = $1
      )
    ) as exists;
    `,
    [domain]
  );

  return result.rows[0].exists;
}

// ============================================================================
// INTERNAL LINKING QUERIES (for SEO optimization)
// ============================================================================

/**
 * Find similar domains (by shared publishers)
 */
export async function fetchSimilarDomains(
  domain: string,
  limit: number = 10
): Promise<DomainAggregation[]> {
  const result = await query<DomainAggregation>(
    `
    WITH current_domain_publishers AS (
      SELECT seller_id
      FROM seller_adsense.all_domains
      WHERE domain = $1
    ),
    similar_domains AS (
      SELECT
        sd.domain,
        COUNT(DISTINCT sd.seller_id) as shared_publishers,
        COUNT(DISTINCT CASE WHEN cdp.seller_id IS NOT NULL THEN sd.seller_id END) as overlap_count
      FROM seller_adsense.all_domains sd
      LEFT JOIN current_domain_publishers cdp ON sd.seller_id = cdp.seller_id
      WHERE sd.domain != $1
        AND sd.domain IS NOT NULL
      GROUP BY sd.domain
      HAVING COUNT(DISTINCT CASE WHEN cdp.seller_id IS NOT NULL THEN sd.seller_id END) > 0
      ORDER BY overlap_count DESC, shared_publishers DESC
      LIMIT 20
    )
    SELECT dav.*
    FROM seller_adsense.domain_aggregation_view dav
    INNER JOIN similar_domains sd ON dav.domain = sd.domain
    ORDER BY sd.overlap_count DESC
    LIMIT $2;
    `,
    [domain, limit]
  );

  return result.rows;
}

/**
 * Find domains by TLD (for cross-linking)
 */
export async function fetchDomainsByTld(
  tld: string,
  excludeDomain?: string,
  limit: number = 10
): Promise<DomainAggregation[]> {
  const result = await query<DomainAggregation>(
    `
    SELECT *
    FROM seller_adsense.domain_aggregation_view
    WHERE LOWER(SUBSTRING(domain FROM '\.([^.]+)$')) = $1
      AND ($2::text IS NULL OR domain != $2)
    ORDER BY max_traffic DESC NULLS LAST, seller_count DESC
    LIMIT $3;
    `,
    [tld.toLowerCase(), excludeDomain || null, limit]
  );

  return result.rows;
}
