/**
 * Database Configuration
 * Schema names, table names, and database constants
 */

// Schema names
export const DB_SCHEMA = {
  SELLERS: 'seller_adsense',
  PUBLIC: 'public',
} as const;

// Table names with schema prefix
export const TABLE_NAMES = {
  // Core tables
  SELLERS: `${DB_SCHEMA.SELLERS}.sellers`,
  SELLER_DOMAINS: `${DB_SCHEMA.SELLERS}.seller_domains`,
  DAILY_SNAPSHOTS: `${DB_SCHEMA.SELLERS}.daily_snapshots`,

  // Materialized views
  PUBLISHER_LIST_VIEW: `${DB_SCHEMA.SELLERS}.publisher_list_view`,
  DOMAIN_AGGREGATION_VIEW: `${DB_SCHEMA.SELLERS}.domain_aggregation_view`,
  TLD_AGGREGATION_VIEW: `${DB_SCHEMA.SELLERS}.tld_aggregation_view`,
} as const;

// Column names (for type-safe references)
export const COLUMNS = {
  SELLERS: {
    SELLER_ID: 'seller_id',
    NAME: 'name',
    SELLER_TYPE: 'seller_type',
    DOMAIN: 'domain',
    FIRST_SEEN_DATE: 'first_seen_date',
    IS_CONFIDENTIAL: 'is_confidential',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at',
  },
  SELLER_DOMAINS: {
    ID: 'id',
    SELLER_ID: 'seller_id',
    DOMAIN: 'domain',
    CONFIDENCE_SCORE: 'confidence_score',
    DETECTION_SOURCE: 'detection_source',
    FIRST_DETECTED: 'first_detected',
  },
} as const;

// Database connection configuration
export const DB_CONFIG = {
  // Connection pool settings
  pool: {
    min: parseInt(process.env.DB_POOL_MIN || '2'),
    max: parseInt(process.env.DB_POOL_MAX || '20'),
    maxBuild: parseInt(process.env.DB_POOL_MAX_BUILD || '50'),
    idleTimeout: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
    connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '10000'),
    keepAliveInitialDelay: parseInt(process.env.DB_KEEP_ALIVE_DELAY || '10000'),
  },

  // Query settings
  query: {
    slowThreshold: parseInt(process.env.DB_SLOW_QUERY_THRESHOLD || '1000'), // 1 second
    statementTimeout: parseInt(process.env.DB_STATEMENT_TIMEOUT || '30000'), // 30 seconds
  },

  // Monitoring
  monitoring: {
    logSlowQueries: process.env.DB_LOG_SLOW_QUERIES !== 'false',
    logPoolStats: process.env.DB_LOG_POOL_STATS === 'true',
    poolStatsInterval: parseInt(process.env.DB_POOL_STATS_INTERVAL || '60000'), // 1 minute
  },
} as const;

// Allowed sort columns for queries (prevents SQL injection)
export const ALLOWED_SORT_COLUMNS = {
  SELLERS: ['seller_id', 'first_seen_date', 'updated_at', 'created_at'] as const,
  DOMAINS: ['domain', 'confidence_score', 'first_detected'] as const,
  SNAPSHOTS: ['snapshot_date', 'total_count', 'new_count'] as const,
} as const;

// Sort orders (prevents SQL injection)
export const ALLOWED_SORT_ORDERS = ['asc', 'desc'] as const;
