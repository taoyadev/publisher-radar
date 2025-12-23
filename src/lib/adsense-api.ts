import { RateLimiter, ExponentialBackoff } from './rate-limiter';
import { getAdSenseApiKey } from './credentials';

const ADSENSE_API_URL = 'https://adsense-api.lively-sound-ed65.workers.dev';
const REQUESTS_PER_MINUTE = 100;
const MAX_RETRIES = 3;

// Get API key securely (throws if not set)
const getApiKey = (): string => {
  try {
    return getAdSenseApiKey();
  } catch (error) {
    console.error('ADSENSE_API_KEY not configured. Please set it in your .env.local file.');
    throw error;
  }
};

export interface AdSenseApiResponse {
  success: boolean;
  pubId?: string;
  domains?: string[];  // Array of domain strings
  error?: string;
  statusCode?: number;
}

export interface AdSenseRawResponse {
  data?: {
    publisherId: string;
    domains: string[];
  };
  metadata?: {
    requestId: string;
    timestamp: string;
    cached: boolean;
    cacheAge?: number;
    resultCount: number;
    processingTime: number;
  };
}

export class AdSenseApiClient {
  private rateLimiter: RateLimiter;

  constructor(requestsPerMinute: number = REQUESTS_PER_MINUTE) {
    // Use 95% of rate limit for safety margin
    this.rateLimiter = new RateLimiter(Math.floor(requestsPerMinute * 0.95));
  }

  /**
   * Fetch domains for a given pub ID
   * @param pubId - Publisher ID (e.g., 'pub-1234567890')
   * @returns AdSense API response with domains
   */
  async getDomains(pubId: string): Promise<AdSenseApiResponse> {
    // Wait for rate limiter
    await this.rateLimiter.acquire();

    const backoff = new ExponentialBackoff(1000, 30000);

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const apiKey = getApiKey();
        const response = await fetch(
          `${ADSENSE_API_URL}/api/domains?pubId=${encodeURIComponent(pubId)}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            signal: AbortSignal.timeout(30000), // 30s timeout
          }
        );

        // Handle rate limiting (429)
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          const delay = retryAfter
            ? parseInt(retryAfter) * 1000
            : backoff.getDelay();

          console.warn(`Rate limited for ${pubId}, waiting ${delay}ms...`);
          await this.sleep(delay);
          backoff.incrementAttempt();
          continue;
        }

        // Handle not found (404)
        if (response.status === 404) {
          return {
            success: false,
            pubId,
            domains: [],
            error: 'Publisher not found',
            statusCode: 404,
          };
        }

        // Handle server errors (5xx)
        if (response.status >= 500) {
          if (attempt < MAX_RETRIES) {
            const delay = backoff.getDelay();
            console.warn(`Server error (${response.status}) for ${pubId}, retrying in ${delay}ms...`);
            await this.sleep(delay);
            backoff.incrementAttempt();
            continue;
          }

          return {
            success: false,
            pubId,
            domains: [],
            error: `Server error: ${response.status}`,
            statusCode: response.status,
          };
        }

        // Handle other errors
        if (!response.ok) {
          return {
            success: false,
            pubId,
            domains: [],
            error: `HTTP ${response.status}: ${response.statusText}`,
            statusCode: response.status,
          };
        }

        // Parse successful response
        const data: AdSenseRawResponse = await response.json();

        // Validate response structure
        if (!data.data || !data.data.domains) {
          return {
            success: false,
            pubId,
            domains: [],
            error: 'Invalid API response structure',
            statusCode: 200,
          };
        }

        return {
          success: true,
          pubId,
          domains: data.data.domains || [],
          statusCode: 200,
        };

      } catch (error: unknown) {
        const normalizedError = error instanceof Error ? error : new Error(String(error));
        // Handle network errors with retry
        if (attempt < MAX_RETRIES && (
          normalizedError.name === 'AbortError' ||
          normalizedError.name === 'TimeoutError' ||
          normalizedError.message?.includes('fetch')
        )) {
          const delay = backoff.getDelay();
          console.warn(`Network error for ${pubId}, retrying in ${delay}ms...`);
          await this.sleep(delay);
          backoff.incrementAttempt();
          continue;
        }

        // Final failure
        return {
          success: false,
          pubId,
          domains: [],
          error: normalizedError.message || 'Unknown error',
          statusCode: 0,
        };
      }
    }

    // Should never reach here, but TypeScript needs it
    return {
      success: false,
      pubId,
      domains: [],
      error: 'Max retries exceeded',
      statusCode: 0,
    };
  }

  /**
   * Batch fetch domains for multiple pub IDs
   * @param pubIds - Array of publisher IDs
   * @param onProgress - Optional callback for progress updates
   * @returns Array of responses
   */
  async batchGetDomains(
    pubIds: string[],
    onProgress?: (completed: number, total: number, currentPubId: string) => void
  ): Promise<AdSenseApiResponse[]> {
    const results: AdSenseApiResponse[] = [];

    for (let i = 0; i < pubIds.length; i++) {
      const pubId = pubIds[i];
      const result = await this.getDomains(pubId);
      results.push(result);

      if (onProgress) {
        onProgress(i + 1, pubIds.length, pubId);
      }
    }

    return results;
  }

  /**
   * Get current rate limiter status
   */
  getRateLimiterStatus() {
    return {
      availableTokens: this.rateLimiter.getAvailableTokens(),
      maxTokens: REQUESTS_PER_MINUTE,
    };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const adsenseApiClient = new AdSenseApiClient();
