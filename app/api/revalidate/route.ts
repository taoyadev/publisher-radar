import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/api-rate-limit';

export const dynamic = 'force-dynamic';

/**
 * On-Demand Revalidation API
 * Triggered by daily-update.ts to refresh ISR pages
 *
 * Usage:
 * POST /api/revalidate
 * Body: {
 *   secret: string,
 *   type: 'publisher' | 'domain' | 'all',
 *   ids?: string[]
 * }
 */

export async function POST(request: NextRequest) {
  const rateLimitResult = await rateLimit(request, 'heavy');
  if (rateLimitResult) return rateLimitResult;

  try {
    const body = await request.json();
    const { secret, type, ids } = body;

    // Verify secret to prevent unauthorized revalidation
    if (secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json(
        { error: 'Invalid secret' },
        { status: 401 }
      );
    }

    const revalidated: string[] = [];
    let count = 0;

    switch (type) {
      case 'publisher':
        if (ids && Array.isArray(ids)) {
          // Revalidate specific publishers
          for (const id of ids) {
            revalidatePath(`/publisher/${id}`);
            revalidated.push(`/publisher/${id}`);
            count++;
          }
        } else {
          // Revalidate publishers list page
          revalidatePath('/publishers');
          revalidated.push('/publishers');
          count++;
        }
        break;

      case 'domain':
        if (ids && Array.isArray(ids)) {
          // Revalidate specific domains
          for (const domain of ids) {
            revalidatePath(`/domain/${domain}`);
            revalidated.push(`/domain/${domain}`);
            count++;
          }
        }
        break;

      case 'tld':
        if (ids && Array.isArray(ids)) {
          // Revalidate specific TLDs
          for (const tld of ids) {
            revalidatePath(`/tld/${tld}`);
            revalidatePath(`/tld/${tld}/page/[page]`, 'page');
            revalidated.push(`/tld/${tld}`);
            count++;
          }
        }
        break;

      case 'home':
        // Revalidate homepage
        revalidatePath('/');
        revalidated.push('/');
        count++;
        break;

      case 'all':
        // Revalidate everything (use sparingly!)
        revalidatePath('/', 'layout');
        revalidated.push('/*');
        count++;
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid type. Use: publisher, domain, tld, home, or all' },
          { status: 400 }
        );
    }

    console.log(`[Revalidate] Revalidated ${count} path(s): ${type}`);

    return NextResponse.json({
      revalidated: true,
      count,
      paths: revalidated,
      timestamp: new Date().toISOString(),
    });

  } catch (error: unknown) {
    const normalizedError = error instanceof Error ? error : new Error(String(error));
    console.error('[Revalidate] Error:', normalizedError);
    return NextResponse.json(
      { error: normalizedError.message || 'Revalidation failed' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for health check
 */
export async function GET() {
  return NextResponse.json({
    status: 'ready',
    endpoint: '/api/revalidate',
    methods: ['POST'],
    docs: 'https://nextjs.org/docs/app/building-your-application/data-fetching/incremental-static-regeneration#on-demand-revalidation',
  });
}
