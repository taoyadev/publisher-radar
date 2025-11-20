import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { fetchPublishersByTld, fetchTldDetail } from '@/lib/ssg-queries';
import { getTotalPages, validatePageNumber } from '@/lib/cache-helpers';

// ============================================================================
// SSG/ISR CONFIGURATION
// ============================================================================

export const revalidate = 86400; // 24 hours
export const dynamicParams = true;

// ============================================================================
// STATIC PARAMS GENERATION
// ============================================================================

/**
 * Pure SSR - No static generation
 */
export async function generateStaticParams() {
  // Return empty array - all pages will be generated on-demand (SSR)
  return [];
}

// ============================================================================
// METADATA GENERATION
// ============================================================================

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tld: string; page: string }>;
}): Promise<Metadata> {
  const { tld, page: pageStr } = await params;
  const pageNum = parseInt(pageStr);

  if (isNaN(pageNum) || pageNum < 1) {
    return {
      title: 'Invalid Page | TLD Directory',
    };
  }

  const title = `.${tld} Publishers - Page ${pageNum} | Domain Directory`;
  const description = `Browse .${tld} domain publishers - Page ${pageNum}. Explore Google AdSense publishers using .${tld} top-level domain.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://publisherradar.com/tld/${tld}/page/${pageNum}`,
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    alternates: {
      canonical: `/tld/${tld}/page/${pageNum}`,
    },
  };
}

// ============================================================================
// PAGE COMPONENT
// ============================================================================

interface PageProps {
  params: Promise<{ tld: string; page: string }>;
}

export default async function TldPaginatedPage({ params }: PageProps) {
  const { tld, page: pageStr } = await params;
  const pageNum = parseInt(pageStr);
  const tldLower = tld.toLowerCase();

  if (isNaN(pageNum) || pageNum < 1) {
    notFound();
  }

  const limit = 100;

  // Fetch publishers for this TLD and page
  const { publishers, total } = await fetchPublishersByTld(tldLower, pageNum, limit);

  if (publishers.length === 0 && pageNum !== 1) {
    notFound();
  }

  const totalPages = getTotalPages(total, limit);
  const validatedPage = validatePageNumber(pageNum, totalPages);

  if (validatedPage !== pageNum) {
    notFound();
  }

  // Fetch TLD data for context
  const tldData = await fetchTldDetail(tldLower);

  const formatNumber = (num: number | null) => {
    if (!num) return 'N/A';
    return num.toLocaleString();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Pagination helpers
  const hasPrevPage = pageNum > 1;
  const hasNextPage = pageNum < totalPages;
  const startItem = (pageNum - 1) * limit + 1;
  const endItem = Math.min(pageNum * limit, total);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, pageNum - delta);
      i <= Math.min(totalPages - 1, pageNum + delta);
      i++
    ) {
      range.push(i);
    }

    if (pageNum - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (pageNum + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href={`/tld/${tld}`} className="hover:text-blue-600 transition-colors">
            .{tld}
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Page {pageNum}</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            .{tld} Publishers Directory
          </h1>

          <div className="flex flex-wrap items-center gap-4 justify-between">
            <p className="text-gray-600">
              Showing {startItem.toLocaleString()} - {endItem.toLocaleString()} of{' '}
              {total.toLocaleString()} publishers
            </p>

            <Link
              href={`/tld/${tld}`}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium rounded-lg transition-colors"
            >
              ← Back to .{tld} Overview
            </Link>
          </div>

          {tldData && (
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                {formatNumber(tldData.domain_count)} domains
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full">
                {formatNumber(tldData.seller_count)} publishers
              </span>
              {tldData.avg_traffic && (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full">
                  Avg: {formatNumber(Math.round(tldData.avg_traffic))}/mo
                </span>
              )}
            </div>
          )}
        </div>

        {/* Publishers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {publishers.map(publisher => (
            <Link
              key={publisher.seller_id}
              href={`/publisher/${publisher.seller_id}`}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all p-6 border border-gray-200 hover:border-blue-300"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate mb-1">
                    {publisher.name || publisher.seller_id}
                  </h3>
                  {publisher.name && (
                    <p className="text-sm text-gray-500 font-mono truncate">
                      {publisher.seller_id}
                    </p>
                  )}
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ml-2 whitespace-nowrap ${
                    publisher.seller_type === 'PUBLISHER'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-purple-100 text-purple-800'
                  }`}
                >
                  {publisher.seller_type}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <p className="text-xs text-gray-500">Domains</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {publisher.domain_count}
                  </p>
                </div>
                {publisher.max_traffic ? (
                  <div>
                    <p className="text-xs text-gray-500">Max Traffic</p>
                    <p className="text-sm font-semibold text-green-600">
                      {formatNumber(publisher.max_traffic)}/mo
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs text-gray-500">First Seen</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatDate(publisher.first_seen_date)}
                    </p>
                  </div>
                )}
              </div>

              {publisher.primary_domain && (
                <p className="text-xs text-gray-600 truncate">
                  {publisher.primary_domain}
                </p>
              )}
            </Link>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {hasPrevPage && (
              <Link
                href={`/tld/${tld}/page/${pageNum - 1}`}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700"
              >
                ← Previous
              </Link>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-center">
            {getPageNumbers().map((pageItem, index) =>
              pageItem === '...' ? (
                <span key={`ellipsis-${index}`} className="px-2 text-gray-500">
                  ...
                </span>
              ) : (
                <Link
                  key={pageItem}
                  href={`/tld/${tld}/page/${pageItem}`}
                  className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                    pageItem === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {pageItem}
                </Link>
              )
            )}
          </div>

          <div className="flex items-center gap-2">
            {hasNextPage && (
              <Link
                href={`/tld/${tld}/page/${pageNum + 1}`}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700"
              >
                Next →
              </Link>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
