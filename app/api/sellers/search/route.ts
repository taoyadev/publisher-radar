import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { ApiResponse, Seller } from '@/lib/types';
import { validateSearchParams } from '@/lib/validation';
import { rateLimit, getRateLimitHeaders } from '@/lib/api-rate-limit';
import { ZodError } from 'zod';

export async function GET(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = await rateLimit(request, 'search');
  if (rateLimitResult) return rateLimitResult;

  try {
    // Validate input parameters
    const validation = validateSearchParams(request.nextUrl.searchParams);

    if (!validation.success) {
      return NextResponse.json<ApiResponse<null>>(
        {
          data: null,
          error: `Invalid parameters: ${validation.error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`,
        },
        { status: 400 }
      );
    }

    const params = validation.data;

    // Build WHERE clause
    const conditions: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    // Enhanced query logic: search both sellers.domain and all_domains view
    if (params.query) {
      // Search in seller_id OR sellers.domain OR all_domains
      conditions.push(`(
        s.seller_id ILIKE $${paramCount}
        OR s.domain ILIKE $${paramCount}
        OR s.seller_id IN (
          SELECT seller_id FROM seller_adsense.all_domains WHERE domain ILIKE $${paramCount}
        )
      )`);
      values.push(`%${params.query}%`);
      paramCount++;
    }

    if (params.seller_type) {
      conditions.push(`s.seller_type = $${paramCount}`);
      values.push(params.seller_type);
      paramCount++;
    }

    if (params.has_domain !== undefined) {
      if (params.has_domain === 'true') {
        // Has domain in either sellers.domain OR all_domains
        conditions.push(`(
          s.domain IS NOT NULL
          OR s.seller_id IN (SELECT seller_id FROM seller_adsense.all_domains)
        )`);
      } else {
        // No domain in both tables
        conditions.push(`(
          s.domain IS NULL
          AND s.seller_id NOT IN (SELECT seller_id FROM seller_adsense.all_domains)
        )`);
      }
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Optimized: Get both count and data in a single query using window function
    const offset = (params.page! - 1) * params.limit!;
    const combinedQuery = `
      SELECT
        s.*,
        COUNT(*) OVER() as total_count
      FROM seller_adsense.sellers s
      ${whereClause}
      ORDER BY s.${params.sort_by} ${params.sort_order === 'asc' ? 'ASC' : 'DESC'}
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;

    const result = await query(combinedQuery, [...values, params.limit, offset]);

    const total = result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0;
    const data = result.rows.map(row => {
      const { total_count, ...seller } = row;
      return seller;
    }) as Seller[];

    const rateLimitHeaders = getRateLimitHeaders(request, 'search');

    return NextResponse.json<ApiResponse<Seller[]>>(
      {
        data,
        error: null,
        total,
        page: params.page,
        limit: params.limit,
      },
      { headers: rateLimitHeaders }
    );
  } catch (error) {
    // Log detailed error for debugging (server-side only)
    console.error('[API Error] /api/sellers/search:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    // Return generic error message to client (don't expose internal details)
    return NextResponse.json<ApiResponse<null>>(
      {
        data: null,
        error: 'An error occurred while processing your search. Please try again later.',
      },
      { status: 500 }
    );
  }
}
