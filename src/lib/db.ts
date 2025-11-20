import { Pool, PoolConfig, QueryResult, QueryResultRow } from 'pg';

// ============================================================================
// DATABASE CONNECTION CONFIGURATION
// ============================================================================

/**
 * Determine database configuration based on environment
 * - Development: SSH tunnel (localhost:54322)
 * - Production: Direct connection with SSL
 */
const isProduction = process.env.NODE_ENV === 'production';
const isBuild = process.env.NEXT_PHASE === 'phase-production-build';

const poolConfig: PoolConfig = isProduction
  ? {
      // Production configuration (Direct connection to VPS)
      host: process.env.DB_HOST || '93.127.133.204',
      port: parseInt(process.env.DB_PORT || '54322'),
      database: process.env.DB_NAME || 'postgres',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      max: isBuild ? 50 : 20, // More connections during build
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      // No SSL for direct VPS connection
      ssl: false,
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000,
    }
  : {
      // Development configuration (Direct connection to VPS)
      host: '93.127.133.204',
      port: 54322, // Direct PostgreSQL port
      database: 'postgres',
      user: 'postgres',
      password: 'postgres',
      max: isBuild ? 50 : 10, // More connections during SSG build
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 5000,
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000,
    };

const pool = new Pool(poolConfig);

// ============================================================================
// CONNECTION POOL MONITORING
// ============================================================================

let queryCount = 0;
let totalQueryTime = 0;
let slowQueryThreshold = 1000; // 1 second

// Log pool status periodically in development
if (process.env.NODE_ENV === 'development') {
  setInterval(() => {
    if (queryCount > 0) {
      console.log(`[DB Pool] Total clients: ${pool.totalCount}, Idle: ${pool.idleCount}, Waiting: ${pool.waitingCount}`);
      console.log(`[DB Stats] Queries: ${queryCount}, Avg time: ${(totalQueryTime / queryCount).toFixed(2)}ms`);
    }
  }, 60000); // Every minute
}

// Handle pool errors
pool.on('error', (err) => {
  console.error('[DB Pool] Unexpected error on idle client', err);
});

pool.on('connect', () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('[DB Pool] New client connected');
  }
});

pool.on('remove', () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('[DB Pool] Client removed');
  }
});

// ============================================================================
// QUERY FUNCTION WITH MONITORING
// ============================================================================

/**
 * Execute a database query with automatic monitoring and error handling
 * @param text - SQL query string
 * @param params - Query parameters
 * @returns Query result
 */
export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const start = Date.now();

  try {
    const res = await pool.query<T>(text, params);
    const duration = Date.now() - start;

    // Update stats
    queryCount++;
    totalQueryTime += duration;

    // Log query performance
    const shouldLog = process.env.NODE_ENV === 'development' || duration > slowQueryThreshold;

    if (shouldLog) {
      const queryPreview = text.substring(0, 100).replace(/\s+/g, ' ');
      console.log(`[DB Query] ${duration}ms | ${res.rowCount} rows | ${queryPreview}...`);
    }

    // Warn on slow queries
    if (duration > slowQueryThreshold) {
      console.warn(`[DB Slow Query] ${duration}ms - consider optimization`);
    }

    return res;
  } catch (error: any) {
    const duration = Date.now() - start;
    console.error(`[DB Error] ${duration}ms | ${error.message}`);
    console.error('Query:', text);
    console.error('Params:', params);
    throw error;
  }
}

// ============================================================================
// POOL UTILITIES
// ============================================================================

/**
 * Get pool statistics
 */
export function getPoolStats() {
  return {
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount,
    queryCount,
    avgQueryTime: queryCount > 0 ? totalQueryTime / queryCount : 0,
  };
}

/**
 * Close all connections (for graceful shutdown)
 */
export async function closePool() {
  console.log('[DB Pool] Closing all connections...');
  await pool.end();
  console.log('[DB Pool] All connections closed');
}

/**
 * Health check query
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const result = await query('SELECT 1 as health');
    return result.rows.length > 0;
  } catch (error) {
    console.error('[DB Health Check] Failed:', error);
    return false;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export { pool };
export default pool;
