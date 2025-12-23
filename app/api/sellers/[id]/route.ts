import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { ApiResponse, Seller } from '@/lib/types';
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
      'SELECT * FROM seller_adsense.sellers WHERE seller_id = $1',
      [parsedId.data]
    );

    if (result.rows.length === 0) {
      return NextResponse.json<ApiResponse<null>>({
        data: null,
        error: 'Seller not found',
      }, { status: 404 });
    }

    const data = result.rows[0] as Seller;

    return NextResponse.json<ApiResponse<Seller>>({
      data,
      error: null,
    });
  } catch (error) {
    console.error('Get seller API error:', error);
    return NextResponse.json<ApiResponse<null>>({
      data: null,
      error: error instanceof Error ? error.message : 'Internal server error',
    }, { status: 500 });
  }
}
