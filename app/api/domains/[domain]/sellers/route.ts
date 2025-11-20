import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { ApiResponse, Seller } from '@/lib/types';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ domain: string }> }
) {
  try {
    const { domain: rawDomain } = await context.params;
    const domain = decodeURIComponent(rawDomain);

    // Join seller_domains with sellers to get all seller details for a domain
    const sqlQuery = `
      SELECT DISTINCT s.*
      FROM seller_adsense.sellers s
      INNER JOIN seller_adsense.seller_domains sd ON s.seller_id = sd.seller_id
      WHERE sd.domain = $1
      ORDER BY s.updated_at DESC
    `;

    const result = await query(sqlQuery, [domain]);

    const sellers = result.rows as Seller[];

    return NextResponse.json<ApiResponse<Seller[]>>({
      data: sellers,
      error: null,
      total: sellers.length,
    });
  } catch (error) {
    console.error('Get sellers by domain API error:', error);
    return NextResponse.json<ApiResponse<null>>({
      data: null,
      error: error instanceof Error ? error.message : 'Internal server error',
    }, { status: 500 });
  }
}
