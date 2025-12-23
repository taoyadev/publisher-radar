import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { ApiResponse, TopPublisher } from '@/lib/types';
import { rateLimit } from '@/lib/api-rate-limit';
import { validateTopPublishersParams } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const rateLimitResult = await rateLimit(request, 'heavy');
  if (rateLimitResult) return rateLimitResult;

  try {
    const validation = validateTopPublishersParams(request.nextUrl.searchParams);
    if (!validation.success) {
      return NextResponse.json<ApiResponse<null>>(
        {
          data: null,
          error: `Invalid parameters: ${validation.error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`,
        },
        { status: 400 }
      );
    }

    const { sortBy, limit, minTraffic } = validation.data;
    const offset = Math.max(parseInt(request.nextUrl.searchParams.get('offset') || '0'), 0);

    // Build ORDER BY clause based on sortBy parameter
    let orderByClause = '';
    switch (sortBy) {
      case 'domains':
        orderByClause = 'plv.domain_count DESC, plv.max_traffic DESC NULLS LAST, plv.seller_id ASC';
        break;
      case 'newest':
        orderByClause = 'plv.first_seen_date DESC';
        break;
      case 'seller_id':
        orderByClause = 'plv.seller_id ASC';
        break;
      case 'traffic':
      default:
        orderByClause = 'plv.max_traffic DESC NULLS LAST, plv.first_seen_date DESC';
        break;
    }

    // Use publisher_list_view instead of similarweb_analytics
    const result = await query(
      `SELECT
        plv.primary_domain as domain,
        plv.seller_id,
        plv.name,
        plv.first_seen_date,
        plv.seller_type,
        plv.max_traffic as search_traffic_monthly,
        'N/A' as traffic_data_source
       FROM seller_adsense.publisher_list_view plv
       WHERE COALESCE(plv.max_traffic, 0) > $1
       ORDER BY ${orderByClause}
       LIMIT $2 OFFSET $3`,
      [minTraffic, limit, offset]
    );

    // Add rank to each row
    const publishers: TopPublisher[] = result.rows.map((row, index) => ({
      rank: offset + index + 1,
      domain: row.domain,
      seller_id: row.seller_id,
      name: row.name,
      search_traffic_monthly: row.search_traffic_monthly ? parseInt(row.search_traffic_monthly) : 0,
      first_seen_date: row.first_seen_date,
      seller_type: row.seller_type,
      traffic_data_source: row.traffic_data_source,
    }));

    // Get total count from publisher_list_view
    const countResult = await query(
      'SELECT COUNT(*) as total FROM seller_adsense.publisher_list_view WHERE COALESCE(max_traffic, 0) > $1',
      [minTraffic]
    );
    const total = parseInt(countResult.rows[0].total);

    const response = NextResponse.json<ApiResponse<TopPublisher[]>>({
      data: publishers,
      error: null,
      total,
      page: Math.floor(offset / limit) + 1,
      limit,
    });

    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    return response;
  } catch (error) {
    console.error('Top publishers API error:', error);
    return NextResponse.json<ApiResponse<null>>({
      data: null,
      error: error instanceof Error ? error.message : 'Internal server error',
    }, { status: 500 });
  }
}
