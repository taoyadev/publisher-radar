import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { ApiResponse } from '@/lib/types';
import { rateLimit } from '@/lib/api-rate-limit';

export const dynamic = 'force-dynamic';

interface DailySnapshot {
  id: number;
  snapshot_date: string;
  total_count: number;
  new_count: number;
  removed_count: number;
  created_at: string;
}

export async function GET(request: NextRequest) {
  const rateLimitResult = await rateLimit(request, 'default');
  if (rateLimitResult) return rateLimitResult;

  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') || '30'), 100);
    const days = Math.min(Math.max(parseInt(searchParams.get('days') || '30'), 1), 365);

    // Get recent snapshots - Use parameterized query to prevent SQL injection
    const result = await query(`
      SELECT *
      FROM seller_adsense.daily_snapshots
      WHERE snapshot_date >= CURRENT_DATE - CAST($1 || ' days' AS INTERVAL)
      ORDER BY snapshot_date DESC
      LIMIT $2
    `, [days, limit]);

    const snapshots = result.rows as DailySnapshot[];

    // Calculate summary statistics
    const totalNew = snapshots.reduce((sum, s) => sum + s.new_count, 0);
    const totalRemoved = snapshots.reduce((sum, s) => sum + s.removed_count, 0);
    const avgNew = snapshots.length > 0 ? Math.round(totalNew / snapshots.length) : 0;
    const avgRemoved = snapshots.length > 0 ? Math.round(totalRemoved / snapshots.length) : 0;

    return NextResponse.json({
      data: snapshots,
      error: null,
      total: snapshots.length,
      summary: {
        total_new: totalNew,
        total_removed: totalRemoved,
        avg_new_per_day: avgNew,
        avg_removed_per_day: avgRemoved,
      },
    } as ApiResponse<DailySnapshot[]>);
  } catch (error) {
    console.error('Snapshots API error:', error);
    return NextResponse.json<ApiResponse<null>>({
      data: null,
      error: error instanceof Error ? error.message : 'Internal server error',
    }, { status: 500 });
  }
}
