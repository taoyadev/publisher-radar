/**
 * Cache Configuration
 * TTL values, cache strategies, and revalidation settings
 */

// Cache TTL values (in seconds)
export const CACHE_TTL = {
  // Page revalidation
  STATIC_PAGES: 86400,      // 24 hours
  DYNAMIC_PAGES: 300,        // 5 minutes
  ISR_1H: 3600,              // 1 hour
  ISR_6H: 21600,             // 6 hours
  ISR_24H: 86400,            // 24 hours

  // API routes
  API_SHORT: 300,            // 5 minutes
  API_MEDIUM: 3600,          // 1 hour
  API_LONG: 86400,           // 24 hours

  // Static assets
  STATIC_ASSETS: 31536000,   // 1 year
  IMAGES: 604800,            // 7 days
} as const;

// Cache strategies by content type
export const CACHE_STRATEGIES = {
  API_ROUTES: {
    maxAge: 300,                    // 5 minutes
    staleWhileRevalidate: 600,      // 10 minutes
  },

  STATIC_ASSETS: {
    maxAge: 31536000,               // 1 year
    immutable: true,
  },

  PUBLISHER_PAGES: {
    maxAge: 3600,                   // 1 hour
    staleWhileRevalidate: 7200,     // 2 hours
  },

  LIST_PAGES: {
    maxAge: 86400,                  // 24 hours
    staleWhileRevalidate: 172800,   // 48 hours
  },

  DOMAIN_PAGES: {
    maxAge: 21600,                  // 6 hours
    staleWhileRevalidate: 43200,    // 12 hours
  },
} as const;

// Content-based revalidation thresholds
export const REVALIDATE_STRATEGY = {
  TRAFFIC_THRESHOLDS: {
    HOT: 100000,    // 100K+ monthly visitors -> revalidate every 1 hour
    WARM: 10000,    // 10K+ monthly visitors -> revalidate every 6 hours
    COLD: 0,        // < 10K monthly visitors -> revalidate every 24 hours
  },

  DOMAIN_THRESHOLDS: {
    MANY_DOMAINS: 10,  // Publishers with 10+ domains are "important"
  },

  REVALIDATE_TIMES: {
    HOT_CONTENT: 3600,     // 1 hour
    WARM_CONTENT: 21600,   // 6 hours
    COLD_CONTENT: 86400,   // 24 hours
  },
} as const;

// Cache header builder helper
export function buildCacheHeader(strategy: keyof typeof CACHE_STRATEGIES): string {
  const config = CACHE_STRATEGIES[strategy];

  if ('immutable' in config && config.immutable) {
    return `public, max-age=${config.maxAge}, immutable`;
  }

  if ('staleWhileRevalidate' in config) {
    return `public, s-maxage=${config.maxAge}, stale-while-revalidate=${config.staleWhileRevalidate}`;
  }

  return `public, max-age=${config.maxAge}`;
}

// CDN cache tags for granular invalidation
export function getCacheTags(type: string, id?: string): string[] {
  const tags: string[] = [type];

  if (id) {
    tags.push(`${type}:${id}`);
  }

  return tags;
}
