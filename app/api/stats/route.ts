import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { ApiResponse } from '@/lib/types';

interface Stats {
  total_sellers: number;
  publishers: number;
  both_type: number;
  with_domains: number;
  unique_domains: number;
  last_updated: string;
}

// Cache for 5 minutes (300 seconds)
export const revalidate = 300;

export async function GET() {
  try {
    // Get all stats using direct SQL queries
    const statsQuery = `
      SELECT
        COUNT(*) as total_sellers,
        COUNT(*) FILTER (WHERE seller_type = 'PUBLISHER') as publishers,
        COUNT(*) FILTER (WHERE seller_type = 'BOTH') as both_type,
        COUNT(*) FILTER (WHERE domain IS NOT NULL) as with_domains
      FROM seller_adsense.sellers;
    `;

    const domainsQuery = `
      SELECT COUNT(DISTINCT domain) as unique_domains
      FROM seller_adsense.all_domains;
    `;

    const [statsResult, domainsResult] = await Promise.all([
      query(statsQuery),
      query(domainsQuery),
    ]);

    const stats: Stats = {
      total_sellers: parseInt(statsResult.rows[0].total_sellers),
      publishers: parseInt(statsResult.rows[0].publishers),
      both_type: parseInt(statsResult.rows[0].both_type),
      with_domains: parseInt(statsResult.rows[0].with_domains),
      unique_domains: parseInt(domainsResult.rows[0].unique_domains),
      last_updated: new Date().toISOString(),
    };

    const response = NextResponse.json<ApiResponse<Stats>>({
      data: stats,
      error: null,
    });

    // Add cache headers for CDN/browser caching
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');

    return response;
  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json<ApiResponse<null>>({
      data: null,
      error: error instanceof Error ? error.message : 'Internal server error',
    }, { status: 500 });
  }
}
