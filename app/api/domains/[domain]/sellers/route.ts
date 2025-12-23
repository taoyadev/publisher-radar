import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { ApiResponse, Seller } from '@/lib/types';
import { rateLimit } from '@/lib/api-rate-limit';
import { domainSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ domain: string }> }
) {
  const rateLimitResult = await rateLimit(request, 'default');
  if (rateLimitResult) return rateLimitResult;

  try {
    const { domain: rawDomain } = await context.params;
    const domain = decodeURIComponent(rawDomain);

    const parsedDomain = domainSchema.safeParse(domain);
    if (!parsedDomain.success) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: parsedDomain.error.issues[0]?.message || 'Invalid domain' },
        { status: 400 }
      );
    }

    // Join all_domains with sellers to get all seller details for a domain
    const sqlQuery = `
      SELECT DISTINCT s.*
      FROM seller_adsense.sellers s
      INNER JOIN seller_adsense.all_domains sd ON s.seller_id = sd.seller_id
      WHERE sd.domain = $1
      ORDER BY s.updated_at DESC
    `;

    const result = await query(sqlQuery, [parsedDomain.data]);

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
