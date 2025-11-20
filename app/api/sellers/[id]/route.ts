import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { ApiResponse, Seller } from '@/lib/types';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const result = await query(
      'SELECT * FROM seller_adsense.sellers WHERE seller_id = $1',
      [id]
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
