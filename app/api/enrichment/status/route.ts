import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Get overall coverage statistics
    const coverageResult = await query(`
      SELECT * FROM seller_adsense.domain_coverage_stats
    `);
    const coverage = coverageResult.rows[0];

    // 2. Get AdSense API processing progress
    const progressResult = await query(`
      SELECT * FROM seller_adsense.adsense_api_progress
      ORDER BY count DESC
    `);
    const progress = progressResult.rows;

    // 3. Get recent errors
    const errorsResult = await query(`
      SELECT
        adsense_api_error_message,
        COUNT(*) as count
      FROM seller_adsense.sellers
      WHERE adsense_api_status = 'error'
        AND adsense_api_error_message IS NOT NULL
      GROUP BY adsense_api_error_message
      ORDER BY count DESC
      LIMIT 10
    `);
    const topErrors = errorsResult.rows;

    // 4. Get processing rate (last hour)
    const rateResult = await query(`
      SELECT
        COUNT(*) as processed_last_hour
      FROM seller_adsense.sellers
      WHERE adsense_api_last_check >= NOW() - INTERVAL '1 hour'
    `);
    const processingRate = rateResult.rows[0];

    // 5. Calculate estimates
    const totalSellers = parseInt(coverage.total_sellers);
    const processedCount = progress.find(p => p.adsense_api_status === 'success')?.count || 0;
    const pendingCount = progress.find(p => p.adsense_api_status === null || p.adsense_api_status === 'pending')?.count || 0;

    const hourlyRate = parseInt(processingRate.processed_last_hour);
    const remainingHours = hourlyRate > 0 ? Math.ceil(pendingCount / hourlyRate) : null;

    // 6. Build response
    const response = {
      timestamp: new Date().toISOString(),
      coverage: {
        totalSellers: parseInt(coverage.total_sellers),
        sellersWithDomains: parseInt(coverage.sellers_with_domains),
        coveragePercentage: ((parseInt(coverage.sellers_with_domains) / parseInt(coverage.total_sellers)) * 100).toFixed(2),
        breakdown: {
          fromSellersJsonOnly: parseInt(coverage.from_sellers_json_only),
          fromAdSenseApiOnly: parseInt(coverage.from_adsense_api_only),
          fromBothSources: parseInt(coverage.from_both_sources),
        },
        totalVerifiedDomains: parseInt(coverage.total_verified_domains),
      },
      processing: {
        total: totalSellers,
        processed: processedCount,
        pending: pendingCount,
        progressPercentage: ((processedCount / totalSellers) * 100).toFixed(2),
        statusBreakdown: progress.map(p => ({
          status: p.adsense_api_status || 'not_started',
          count: parseInt(p.count),
          percentage: parseFloat(p.percentage),
        })),
      },
      performance: {
        processedLastHour: hourlyRate,
        estimatedHoursRemaining: remainingHours,
        estimatedDaysRemaining: remainingHours ? (remainingHours / 24).toFixed(1) : null,
      },
      errors: {
        topErrors: topErrors.map(e => ({
          message: e.adsense_api_error_message,
          count: parseInt(e.count),
        })),
        totalErrors: progress.find(p => p.adsense_api_status === 'error')?.count || 0,
      },
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error fetching enrichment status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch enrichment status', details: error.message },
      { status: 500 }
    );
  }
}
