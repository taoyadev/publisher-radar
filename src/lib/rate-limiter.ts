/**
 * Rate Limiter for API calls
 * Implements token bucket algorithm with configurable rate
 */

export class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  private readonly maxTokens: number;
  private readonly refillRate: number; // tokens per second
  private readonly refillInterval: number = 100; // ms

  /**
   * @param requestsPerMinute - Maximum requests per minute
   * @param burstSize - Optional burst size (defaults to requestsPerMinute)
   */
  constructor(
    requestsPerMinute: number,
    burstSize?: number
  ) {
    this.maxTokens = burstSize || requestsPerMinute;
    this.tokens = this.maxTokens;
    this.refillRate = requestsPerMinute / 60; // convert to per second
    this.lastRefill = Date.now();
  }

  /**
   * Wait until a token is available
   * @returns Promise that resolves when ready to proceed
   */
  async acquire(): Promise<void> {
    while (true) {
      this.refillTokens();

      if (this.tokens >= 1) {
        this.tokens -= 1;
        return;
      }

      // Calculate wait time until next token
      const tokensNeeded = 1 - this.tokens;
      const waitTime = Math.ceil((tokensNeeded / this.refillRate) * 1000);

      await this.sleep(Math.min(waitTime, this.refillInterval));
    }
  }

  /**
   * Try to acquire without waiting
   * @returns true if token acquired, false otherwise
   */
  tryAcquire(): boolean {
    this.refillTokens();

    if (this.tokens >= 1) {
      this.tokens -= 1;
      return true;
    }

    return false;
  }

  /**
   * Refill tokens based on elapsed time
   */
  private refillTokens(): void {
    const now = Date.now();
    const timePassed = (now - this.lastRefill) / 1000; // seconds
    const tokensToAdd = timePassed * this.refillRate;

    this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }

  /**
   * Get current token count (for monitoring)
   */
  getAvailableTokens(): number {
    this.refillTokens();
    return Math.floor(this.tokens);
  }

  /**
   * Reset limiter to full capacity
   */
  reset(): void {
    this.tokens = this.maxTokens;
    this.lastRefill = Date.now();
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Exponential backoff utility for retries
 */
export class ExponentialBackoff {
  private attempt: number = 0;

  constructor(
    private readonly initialDelay: number = 1000,
    private readonly maxDelay: number = 60000,
    private readonly factor: number = 2
  ) {}

  /**
   * Calculate delay for current attempt
   */
  getDelay(): number {
    const delay = Math.min(
      this.initialDelay * Math.pow(this.factor, this.attempt),
      this.maxDelay
    );
    return delay + Math.random() * 1000; // Add jitter
  }

  /**
   * Increment attempt counter
   */
  incrementAttempt(): void {
    this.attempt++;
  }

  /**
   * Reset attempt counter
   */
  reset(): void {
    this.attempt = 0;
  }

  /**
   * Get current attempt number
   */
  getAttempt(): number {
    return this.attempt;
  }
}
