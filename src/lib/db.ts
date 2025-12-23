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
      max: isBuild ? 50 : 10, // Reduce max connections to prevent accumulation
      min: 2, // Keep minimum connections alive
      idleTimeoutMillis: 60000, // Close idle connections after 1 minute
      connectionTimeoutMillis: 30000, // 30s to establish connection (network latency)
      statement_timeout: 15000, // 15s for query execution
      query_timeout: 20000, // 20s total query timeout
      idle_in_transaction_session_timeout: 15000,
      // No SSL for direct VPS connection
      ssl: false,
      keepAlive: true,
      keepAliveInitialDelayMillis: 5000, // Start keepalive sooner
    }
  : {
      // Development configuration (Direct connection to VPS)
      host: '93.127.133.204',
      port: 54322, // Direct PostgreSQL port
      database: 'postgres',
      user: 'postgres',
      password: 'postgres',
      max: isBuild ? 50 : 5, // Fewer connections in dev
      min: 1, // Keep at least 1 connection alive
      idleTimeoutMillis: 30000, // 30s idle timeout
      connectionTimeoutMillis: 30000, // 30s to establish connection
      statement_timeout: 15000, // 15s for query execution
      query_timeout: 20000, // 20s total query timeout
      idle_in_transaction_session_timeout: 15000,
      keepAlive: true,
      keepAliveInitialDelayMillis: 5000,
    };

const pool = new Pool(poolConfig);

// ============================================================================
// CONNECTION POOL MONITORING
// ============================================================================

let queryCount = 0;
let totalQueryTime = 0;
const slowQueryThreshold = 1000; // 1 second

// Log pool status periodically in development (less frequently to reduce noise)
let lastLogTime = 0;
if (process.env.NODE_ENV === 'development') {
  setInterval(() => {
    const now = Date.now();
    // Only log if queries happened and at least 5 minutes since last log
    if (queryCount > 0 && (now - lastLogTime > 300000)) {
      console.log(`[DB Pool] Total: ${pool.totalCount}, Idle: ${pool.idleCount}, Waiting: ${pool.waitingCount} | Queries: ${queryCount}, Avg: ${(totalQueryTime / queryCount).toFixed(0)}ms`);
      lastLogTime = now;
    }
  }, 300000); // Every 5 minutes
}

// Handle pool errors
pool.on('error', (err) => {
  console.error('[DB Pool] Unexpected error on idle client', err);
});

// Connection events - only log in verbose debug mode
const VERBOSE_DB_LOGS = process.env.VERBOSE_DB_LOGS === 'true';

pool.on('connect', () => {
  if (VERBOSE_DB_LOGS) {
    console.log('[DB Pool] New client connected');
  }
});

pool.on('remove', () => {
  if (VERBOSE_DB_LOGS) {
    console.log('[DB Pool] Client removed');
  }
});

// ============================================================================
// QUERY FUNCTION WITH MONITORING
// ============================================================================

/**
 * Execute a database query with automatic monitoring, error handling, and retry logic
 * @param text - SQL query string
 * @param params - Query parameters
 * @param retries - Number of retries on connection errors (default: 2)
 * @returns Query result
 */
export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: readonly unknown[],
  retries: number = 2
): Promise<QueryResult<T>> {
  const start = Date.now();

  try {
    const res = await pool.query<T>(text, params as unknown[] | undefined);
    const duration = Date.now() - start;

    // Update stats
    queryCount++;
    totalQueryTime += duration;

    // Only log slow queries to reduce noise
    if (duration > slowQueryThreshold) {
      const queryPreview = text.substring(0, 80).replace(/\s+/g, ' ');
      console.warn(`[DB Slow] ${duration}ms | ${res.rowCount} rows | ${queryPreview}...`);
    }

    return res;
  } catch (error: unknown) {
    const duration = Date.now() - start;
    const normalizedError = error instanceof Error ? error : new Error(String(error));
    const isConnectionError = normalizedError.message.includes('Connection terminated') ||
                              normalizedError.message.includes('connection timeout') ||
                              normalizedError.message.includes('ECONNREFUSED') ||
                              normalizedError.message.includes('ETIMEDOUT');

    // Retry on connection errors
    if (isConnectionError && retries > 0) {
      console.warn(`[DB Retry] ${normalizedError.message} - retrying (${retries} left)...`);
      // Wait a bit before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * (3 - retries)));
      return query<T>(text, params, retries - 1);
    }

    console.error(`[DB Error] ${duration}ms | ${normalizedError.message}`);
    if (process.env.NODE_ENV === 'development') {
      const queryPreview = text.substring(0, 200).replace(/\s+/g, ' ');
      console.error('Query:', queryPreview);
    }
    throw normalizedError;
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
