import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { ApiResponse } from '@/lib/types';

interface DomainWithCount {
  domain: string;
  seller_count: number;
  first_detected: string;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const searchQuery = searchParams.get('query') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = (page - 1) * limit;

    // Use SQL to group by domain and count sellers efficiently
    const sqlQuery = `
      SELECT
        domain,
        COUNT(*) as seller_count,
        MIN(first_detected) as first_detected
      FROM seller_adsense.all_domains
      ${searchQuery ? 'WHERE domain ILIKE $1' : ''}
      GROUP BY domain
      ORDER BY seller_count DESC, domain ASC
      LIMIT $${searchQuery ? '2' : '1'} OFFSET $${searchQuery ? '3' : '2'}
    `;

    const params = searchQuery
      ? [`%${searchQuery}%`, limit, offset]
      : [limit, offset];

    const result = await query(sqlQuery, params);

    const data: DomainWithCount[] = result.rows.map(row => ({
      domain: row.domain,
      seller_count: parseInt(row.seller_count),
      first_detected: row.first_detected,
    }));

    return NextResponse.json<ApiResponse<DomainWithCount[]>>({
      data,
      error: null,
      page,
      limit,
    });
  } catch (error) {
    console.error('Domain search API error:', error);
    return NextResponse.json<ApiResponse<null>>({
      data: null,
      error: error instanceof Error ? error.message : 'Internal server error',
    }, { status: 500 });
  }
}
