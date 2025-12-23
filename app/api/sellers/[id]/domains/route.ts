import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { ApiResponse, SellerDomain } from '@/lib/types';
import { rateLimit } from '@/lib/api-rate-limit';
import { sellerIdSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const rateLimitResult = await rateLimit(request, 'default');
  if (rateLimitResult) return rateLimitResult;

  try {
    const { id } = await context.params;
    const parsedId = sellerIdSchema.safeParse(id);
    if (!parsedId.success) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: parsedId.error.issues[0]?.message || 'Invalid seller id' },
        { status: 400 }
      );
    }
    const result = await query(
      `SELECT
        sd.*,
        NULL::bigint as search_traffic_monthly,
        NULL::bigint as total_traffic_monthly,
        NULL as traffic_data_source
       FROM seller_adsense.all_domains sd
       WHERE sd.seller_id = $1
       ORDER BY
         sd.confidence_score DESC,
         sd.first_detected DESC`,
      [parsedId.data]
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
