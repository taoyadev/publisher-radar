/**
 * API Rate Limiting Middleware
 * In-memory rate limiter using token bucket algorithm
 */

import { NextRequest, NextResponse } from 'next/server';
import { API_LIMITS } from '@/config/api-limits';

interface RateLimitEntry {
  tokens: number;
  lastRefill: number;
}

// In-memory store (consider Redis for production with multiple instances)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  const tenMinutesAgo = now - 10 * 60 * 1000;

  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.lastRefill < tenMinutesAgo) {
      rateLimitStore.delete(key);
    }
  }
}, 10 * 60 * 1000);

/**
 * Get client identifier from request
 * Uses IP address or x-forwarded-for header
 */
function getClientId(request: NextRequest): string {
  // Try to get real IP from headers (for proxies)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback to unknown
  return 'unknown';
}

/**
 * Token bucket rate limiter
 * Refills tokens at a constant rate
 */
class TokenBucket {
  private maxTokens: number;
  private refillRate: number; // tokens per second

  constructor(maxTokens: number, refillRate: number) {
    this.maxTokens = maxTokens;
    this.refillRate = refillRate;
  }

  /**
   * Try to consume a token
   * Returns true if successful, false if rate limit exceeded
   */
  tryConsume(clientId: string): boolean {
    const now = Date.now();
    let entry = rateLimitStore.get(clientId);

    if (!entry) {
      // First request from this client
      entry = {
        tokens: this.maxTokens - 1,
        lastRefill: now,
      };
      rateLimitStore.set(clientId, entry);
      return true;
    }

    // Calculate tokens to add based on time elapsed
    const timeSinceLastRefill = (now - entry.lastRefill) / 1000; // seconds
    const tokensToAdd = Math.floor(timeSinceLastRefill * this.refillRate);

    if (tokensToAdd > 0) {
      entry.tokens = Math.min(this.maxTokens, entry.tokens + tokensToAdd);
      entry.lastRefill = now;
    }

    // Try to consume a token
    if (entry.tokens > 0) {
      entry.tokens--;
      return true;
    }

    return false;
  }

  /**
   * Get remaining tokens for a client
   */
  getRemainingTokens(clientId: string): number {
    const entry = rateLimitStore.get(clientId);
    if (!entry) {
      return this.maxTokens;
    }

    const now = Date.now();
    const timeSinceLastRefill = (now - entry.lastRefill) / 1000;
    const tokensToAdd = Math.floor(timeSinceLastRefill * this.refillRate);

    return Math.min(this.maxTokens, entry.tokens + tokensToAdd);
  }

  /**
   * Get time until next token available (in seconds)
   */
  getRetryAfter(clientId: string): number {
    const entry = rateLimitStore.get(clientId);
    if (!entry || entry.tokens > 0) {
      return 0;
    }

    return Math.ceil(1 / this.refillRate);
  }
}

// Rate limiters for different endpoint types
const defaultLimiter = new TokenBucket(
  API_LIMITS.API_ROUTES.DEFAULT,
  API_LIMITS.API_ROUTES.DEFAULT / 60 // per second
);

const searchLimiter = new TokenBucket(
  API_LIMITS.API_ROUTES.SEARCH,
  API_LIMITS.API_ROUTES.SEARCH / 60
);

const heavyLimiter = new TokenBucket(
  API_LIMITS.API_ROUTES.HEAVY,
  API_LIMITS.API_ROUTES.HEAVY / 60
);

/**
 * Rate limit types based on endpoint
 */
export type RateLimitType = 'default' | 'search' | 'heavy';

/**
 * Apply rate limiting to an API route
 * Usage in route handler:
 *
 * ```typescript
 * export async function GET(request: NextRequest) {
 *   const rateLimitResult = await rateLimit(request, 'search');
 *   if (rateLimitResult) return rateLimitResult;
 *
 *   // Your API logic here
 * }
 * ```
 */
export function rateLimit(
  request: NextRequest,
  type: RateLimitType = 'default'
): NextResponse | null {
  const clientId = getClientId(request);

  // Select appropriate limiter
  const limiter = type === 'search' ? searchLimiter :
                  type === 'heavy' ? heavyLimiter :
                  defaultLimiter;

  const allowed = limiter.tryConsume(clientId);

  if (!allowed) {
    const retryAfter = limiter.getRetryAfter(clientId);

    return NextResponse.json(
      {
        data: null,
        error: 'Rate limit exceeded. Please try again later.',
      },
      {
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': limiter['maxTokens'].toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(Date.now() + retryAfter * 1000).toISOString(),
        },
      }
    );
  }

  // Add rate limit headers to successful responses (will be added to actual response)
  // Return null to indicate rate limit passed
  return null;
}

/**
 * Get rate limit headers for a successful response
 */
export function getRateLimitHeaders(
  request: NextRequest,
  type: RateLimitType = 'default'
): Record<string, string> {
  const clientId = getClientId(request);

  const limiter = type === 'search' ? searchLimiter :
                  type === 'heavy' ? heavyLimiter :
                  defaultLimiter;

  const remaining = limiter.getRemainingTokens(clientId);

  return {
    'X-RateLimit-Limit': limiter['maxTokens'].toString(),
    'X-RateLimit-Remaining': remaining.toString(),
  };
}
