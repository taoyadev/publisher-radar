import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { ApiResponse } from '@/lib/types';
import { rateLimit } from '@/lib/api-rate-limit';
import { validateDomainSearchParams } from '@/lib/validation';

interface DomainWithCount {
  domain: string;
  seller_count: number;
  first_detected: string;
}

export async function GET(request: NextRequest) {
  const rateLimitResult = await rateLimit(request, 'search');
  if (rateLimitResult) return rateLimitResult;

  try {
    const validation = validateDomainSearchParams(request.nextUrl.searchParams);
    if (!validation.success) {
      return NextResponse.json<ApiResponse<null>>(
        {
          data: null,
          error: `Invalid parameters: ${validation.error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`,
        },
        { status: 400 }
      );
    }

    const { query: searchQuery, page, limit } = validation.data;
    const offset = (page - 1) * limit;

    const result = await query<{ total_count: string } & DomainWithCount>(
      `
      WITH domains AS (
        SELECT
          domain,
          COUNT(DISTINCT seller_id) as seller_count,
          MIN(first_detected) as first_detected
        FROM seller_adsense.all_domains
        WHERE domain ILIKE $1
        GROUP BY domain
      )
      SELECT
        domain,
        seller_count,
        first_detected,
        COUNT(*) OVER() as total_count
      FROM domains
      ORDER BY seller_count DESC, domain ASC
      LIMIT $2 OFFSET $3
      `,
      [`%${searchQuery}%`, limit, offset]
    );

    const total = result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0;
    const data: DomainWithCount[] = result.rows.map((row) => ({
      domain: row.domain,
      seller_count: Number(row.seller_count),
      first_detected: row.first_detected,
    }));

    const response = NextResponse.json<ApiResponse<DomainWithCount[]>>({
      data,
      error: null,
      total,
      page,
      limit,
    });

    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    return response;
  } catch (error: unknown) {
    const normalizedError = error instanceof Error ? error : new Error(String(error));
    console.error('[API Error] /api/domains/search:', {
      error: normalizedError.message,
      stack: normalizedError.stack,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: 'An error occurred while searching domains. Please try again later.' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
