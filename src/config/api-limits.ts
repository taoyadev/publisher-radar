/**
 * API Limits Configuration
 * Pagination limits, rate limits, and API constraints
 */

// API pagination limits
export const API_LIMITS = {
  SELLERS: {
    DEFAULT: 50,
    MAX: 100,
  },
  TOP_PUBLISHERS: {
    DEFAULT: 100,
    MAX: 1000,
  },
  DOMAINS: {
    DEFAULT: 50,
    MAX: 100,
  },
  SNAPSHOTS: {
    DEFAULT: 30,
    MAX: 100,
  },
  SEARCH: {
    DEFAULT: 50,
    MAX: 100,
  },
} as const;

// Rate limiting configuration
export const RATE_LIMITS = {
  // API routes rate limits (requests per minute)
  API_ROUTES: {
    DEFAULT: 60,          // 60 requests per minute
    SEARCH: 30,           // 30 requests per minute for search
    HEAVY: 10,            // 10 requests per minute for heavy operations
  },

  // External API rate limits
  ADSENSE_API: {
    requestsPerMinute: parseInt(process.env.ADSENSE_RPM || '100'),
    maxRetries: parseInt(process.env.ADSENSE_MAX_RETRIES || '3'),
    timeoutMs: parseInt(process.env.ADSENSE_TIMEOUT || '30000'),
    batchSize: parseInt(process.env.ADSENSE_BATCH_SIZE || '100'),
  },
} as const;

// Query parameter validation ranges
export const PARAM_RANGES = {
  PAGE: {
    MIN: 1,
    MAX: 100000,
    DEFAULT: 1,
  },
  LIMIT: {
    MIN: 1,
    MAX: 100,
    DEFAULT: 50,
  },
  DAYS: {
    MIN: 1,
    MAX: 365,
    DEFAULT: 30,
  },
} as const;

// Script batch sizes
export const BATCH_SIZES = {
  DAILY_UPDATE: parseInt(process.env.DAILY_UPDATE_BATCH_SIZE || '5000'),
  LOG_INTERVAL: parseInt(process.env.DAILY_UPDATE_LOG_INTERVAL || '100000'),
} as const;

// SSG/ISR limits
export const BUILD_CONFIG = {
  SSG_LIMITS: {
    TOP_PUBLISHERS: parseInt(process.env.SSG_TOP_PUBLISHERS || '10000'),
    TOP_DOMAINS: parseInt(process.env.SSG_TOP_DOMAINS || '5000'),
    FIRST_PAGES: parseInt(process.env.SSG_FIRST_PAGES || '100'),
  },
} as const;
