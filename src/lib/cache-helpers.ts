/**
 * Cache Helpers for SSG/ISR
 *
 * Utilities for managing cache behavior in Next.js 15
 */

/**
 * Cache tag generator for on-demand revalidation
 */
export function getCacheTags(type: string, id?: string): string[] {
  const tags: string[] = [type];

  if (id) {
    tags.push(`${type}:${id}`);
  }

  return tags;
}

/**
 * Revalidate time calculator based on traffic/popularity
 */
export function getRevalidateTime(tier: 'hot' | 'warm' | 'cold'): number {
  switch (tier) {
    case 'hot': // Top 10K publishers
      return 3600; // 1 hour
    case 'warm': // Top 100K publishers
      return 21600; // 6 hours
    case 'cold': // All other publishers
      return 86400; // 24 hours
    default:
      return 86400;
  }
}

/**
 * Determine publisher tier based on metrics
 */
export function getPublisherTier(
  domainCount: number,
  maxTraffic: number | null
): 'hot' | 'warm' | 'cold' {
  if (maxTraffic && maxTraffic > 100000) return 'hot';
  if (domainCount > 10 || (maxTraffic && maxTraffic > 10000)) return 'warm';
  return 'cold';
}

/**
 * Cache control headers for different page types
 */
export const CACHE_HEADERS = {
  // Static pages (rarely change)
  static: {
    'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
  },

  // Dynamic pages (frequently change)
  dynamic: {
    'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
  },

  // ISR pages (regenerate periodically)
  isr_1h: {
    'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
  },

  isr_6h: {
    'Cache-Control': 'public, s-maxage=21600, stale-while-revalidate=43200',
  },

  isr_24h: {
    'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=172800',
  },

  // API routes
  api: {
    'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
  },
} as const;

/**
 * Get appropriate cache header based on content type
 */
export function getCacheHeader(
  type: 'static' | 'dynamic' | 'isr' | 'api',
  revalidateSeconds?: number
): { 'Cache-Control': string } {
  if (type === 'isr' && revalidateSeconds) {
    const staleWhileRevalidate = revalidateSeconds * 2;
    return {
      'Cache-Control': `public, s-maxage=${revalidateSeconds}, stale-while-revalidate=${staleWhileRevalidate}`,
    };
  }

  switch (type) {
    case 'static':
      return CACHE_HEADERS.static;
    case 'dynamic':
      return CACHE_HEADERS.dynamic;
    case 'api':
      return CACHE_HEADERS.api;
    default:
      return CACHE_HEADERS.isr_1h;
  }
}

/**
 * Format cache tag for logging
 */
export function formatCacheTag(tag: string): string {
  return `[Cache:${tag}]`;
}

/**
 * Generate sitemap cache key
 */
export function getSitemapCacheKey(index?: number): string {
  return index !== undefined ? `sitemap-${index}` : 'sitemap';
}

/**
 * Check if should skip cache (for development)
 */
export function shouldSkipCache(): boolean {
  return process.env.NODE_ENV === 'development' && process.env.SKIP_CACHE === 'true';
}

/**
 * Cache key generator for complex queries
 */
export function generateCacheKey(
  prefix: string,
  params: Record<string, string | number | boolean>
): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');

  return `${prefix}:${sortedParams}`;
}

/**
 * Calculate optimal page size for pagination
 */
export function getOptimalPageSize(totalItems: number): number {
  if (totalItems < 1000) return 50;
  if (totalItems < 10000) return 100;
  return 100; // Max 100 per page
}

/**
 * Calculate total pages
 */
export function getTotalPages(totalItems: number, pageSize: number): number {
  return Math.ceil(totalItems / pageSize);
}

/**
 * Validate page number
 */
export function validatePageNumber(page: number, totalPages: number): number {
  if (page < 1) return 1;
  if (page > totalPages) return totalPages;
  return page;
}
