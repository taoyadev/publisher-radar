/**
 * Credentials Management
 * Secure access to API keys and sensitive configuration
 *
 * SECURITY: Never commit default/fallback values for production credentials!
 */

/**
 * Get AdSense API key
 * @throws {Error} if key is not found in environment
 */
export function getAdSenseApiKey(): string {
  const key = process.env.ADSENSE_API_KEY;

  if (!key || key === '') {
    throw new Error(
      'ADSENSE_API_KEY is required. Please set it in your .env.local file.'
    );
  }

  return key;
}

/**
 * Get database credentials
 * @returns Database connection object
 */
export function getDatabaseCredentials() {
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '54322'),
    database: process.env.DB_NAME || 'postgres',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  };
}

/**
 * Validate all required environment variables
 * Call this on application startup in production
 */
export function validateEnvironment() {
  const requiredVars = {
    production: [
      'DB_HOST',
      'DB_PORT',
      'DB_NAME',
      'DB_USER',
      'DB_PASSWORD',
      'NEXT_PUBLIC_SITE_URL',
    ],
    development: [],
  };

  const env = process.env.NODE_ENV || 'development';
  const required = requiredVars[env === 'production' ? 'production' : 'development'];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      `Please check your .env.local file or deployment configuration.`
    );
  }
}

/**
 * Optional: Validate on module load in production
 */
if (process.env.NODE_ENV === 'production' && typeof window === 'undefined') {
  try {
    validateEnvironment();
  } catch (error) {
    console.error('[Credentials] Environment validation failed:', error);
    // Don't throw - let the app start but log the error
    // Individual functions will throw when credentials are actually needed
  }
}
