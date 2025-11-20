import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// Cache TLD queries for 15 minutes
export const revalidate = 900;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tld = searchParams.get('tld') || 'com'; // Default to .com
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);
    const offset = (page - 1) * limit;

    // Validate TLD format (alphanumeric only)
    if (!/^[a-z0-9]+$/i.test(tld)) {
      return NextResponse.json(
        { error: 'Invalid TLD format' },
        { status: 400 }
      );
    }

    // Query domains by TLD with seller counts
    const sqlQuery = `
      SELECT
        domain,
        COUNT(DISTINCT seller_id) as seller_count,
        MIN(first_detected) as first_detected,
        ROUND(AVG(confidence_score)::numeric, 2) as avg_confidence
      FROM seller_adsense.seller_domains
      WHERE domain ~ ('\\.' || $1 || '$')
      GROUP BY domain
      ORDER BY seller_count DESC, domain ASC
      LIMIT $2 OFFSET $3
    `;

    const result = await query(sqlQuery, [tld, limit, offset]);

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(DISTINCT domain) as total
      FROM seller_adsense.seller_domains
      WHERE domain ~ ('\\.' || $1 || '$')
    `;
    const countResult = await query(countQuery, [tld]);
    const total = parseInt(countResult.rows[0]?.total || '0');

    const response = NextResponse.json({
      data: result.rows,
      tld,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });

    // Cache for 15 minutes with stale-while-revalidate
    response.headers.set('Cache-Control', 'public, s-maxage=900, stale-while-revalidate=1800');

    return response;
  } catch (error) {
    console.error('Domain by TLD API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch domains by TLD' },
      { status: 500 }
    );
  }
}
