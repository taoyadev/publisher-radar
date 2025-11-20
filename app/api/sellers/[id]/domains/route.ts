import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { ApiResponse, SellerDomain } from '@/lib/types';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const result = await query(
      `SELECT
        sd.*,
        NULL::bigint as search_traffic_monthly,
        NULL::bigint as total_traffic_monthly,
        NULL as traffic_data_source
       FROM seller_adsense.seller_domains sd
       WHERE sd.seller_id = $1
       ORDER BY
         sd.confidence_score DESC,
         sd.first_detected DESC`,
      [id]
    );

    const data = result.rows as SellerDomain[];

    return NextResponse.json<ApiResponse<SellerDomain[]>>({
      data,
      error: null,
    });
  } catch (error) {
    console.error('Get seller domains API error:', error);
    return NextResponse.json<ApiResponse<null>>({
      data: null,
      error: error instanceof Error ? error.message : 'Internal server error',
    }, { status: 500 });
  }
}
