import { z } from 'zod';

// ============================================================================
// SEARCH PARAMS VALIDATION
// ============================================================================

export const searchParamsSchema = z.object({
  query: z.string().max(200).optional(),
  seller_type: z.enum(['PUBLISHER', 'BOTH']).optional(),
  has_domain: z.enum(['true', 'false']).optional(),
  page: z.coerce.number().int().positive().max(10000).default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
  sort_by: z.enum(['seller_id', 'first_seen_date', 'updated_at']).default('updated_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
});

export type SearchParamsInput = z.input<typeof searchParamsSchema>;
export type SearchParamsOutput = z.output<typeof searchParamsSchema>;

// ============================================================================
// DOMAINS SEARCH VALIDATION
// ============================================================================

export const domainSearchParamsSchema = z.object({
  query: z.string().min(1).max(200),
  page: z.coerce.number().int().positive().max(10000).default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
});

export type DomainSearchParamsInput = z.input<typeof domainSearchParamsSchema>;
export type DomainSearchParamsOutput = z.output<typeof domainSearchParamsSchema>;

// ============================================================================
// SELLER ID VALIDATION
// ============================================================================

export const sellerIdSchema = z.string()
  .regex(/^pub-\d{16}$/, 'Invalid seller ID format. Must be pub- followed by 16 digits');

// ============================================================================
// DOMAIN VALIDATION
// ============================================================================

export const domainSchema = z.string()
  .min(1)
  .max(253)
  .regex(
    /^[a-zA-Z0-9][a-zA-Z0-9-_.]*\.[a-zA-Z]{2,}$/,
    'Invalid domain format'
  );

// ============================================================================
// TOP PUBLISHERS PARAMS VALIDATION
// ============================================================================

export const topPublishersParamsSchema = z.object({
  sortBy: z.enum(['traffic', 'domains']).default('traffic'),
  limit: z.coerce.number().int().positive().max(1000).default(100),
  minTraffic: z.coerce.number().int().nonnegative().default(0),
});

export type TopPublishersParamsInput = z.input<typeof topPublishersParamsSchema>;
export type TopPublishersParamsOutput = z.output<typeof topPublishersParamsSchema>;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Validate and parse search params from URLSearchParams
 */
export function validateSearchParams(params: URLSearchParams) {
  const input = {
    query: params.get('query') || undefined,
    seller_type: params.get('seller_type') || undefined,
    has_domain: params.get('has_domain') || undefined,
    page: params.get('page') || undefined,
    limit: params.get('limit') || undefined,
    sort_by: params.get('sort_by') || undefined,
    sort_order: params.get('sort_order') || undefined,
  };

  return searchParamsSchema.safeParse(input);
}

/**
 * Validate domain search params
 */
export function validateDomainSearchParams(params: URLSearchParams) {
  const input = {
    query: params.get('query') || undefined,
    page: params.get('page') || undefined,
    limit: params.get('limit') || undefined,
  };

  return domainSearchParamsSchema.safeParse(input);
}

/**
 * Validate top publishers params
 */
export function validateTopPublishersParams(params: URLSearchParams) {
  const input = {
    sortBy: params.get('sortBy') || undefined,
    limit: params.get('limit') || undefined,
    minTraffic: params.get('minTraffic') || undefined,
  };

  return topPublishersParamsSchema.safeParse(input);
}
