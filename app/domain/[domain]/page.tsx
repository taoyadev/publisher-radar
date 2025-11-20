import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  fetchDomainDetail,
  fetchTopDomains,
  fetchPublishersByIds,
  fetchSimilarDomains,
  fetchDomainsByTld,
} from '@/lib/ssg-queries';
import ExternalLink from '@/components/ExternalLink';

// ============================================================================
// SSG/ISR CONFIGURATION
// ============================================================================

export const revalidate = 86400; // 24 hours
export const dynamicParams = true;

// ============================================================================
// STATIC PARAMS GENERATION
// ============================================================================

/**
 * Pre-generate top 5K domains
 */
export async function generateStaticParams() {
  try {
    const topDomains = await fetchTopDomains(5000);

    return topDomains.map(domain => ({
      domain,
    }));
  } catch (error) {
    console.error('[SSG] Error generating domain static params:', error);
    return [];
  }
}

// ============================================================================
// METADATA GENERATION
// ============================================================================

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string }>;
}): Promise<Metadata> {
  const { domain } = await params;
  const decodedDomain = decodeURIComponent(domain);
  const domainData = await fetchDomainDetail(decodedDomain);

  if (!domainData) {
    return {
      title: 'Domain Not Found | AdSense Publisher Radar',
      description: 'The requested domain could not be found in our database.',
    };
  }

  const sellerCount = domainData.seller_count || 0;
  const traffic = domainData.max_traffic
    ? `${domainData.max_traffic.toLocaleString()} monthly visitors`
    : 'traffic data pending';

  const title = `${decodedDomain} - ${sellerCount} AdSense Publisher${sellerCount !== 1 ? 's' : ''} | Domain Directory`;
  const description = `${decodedDomain} is associated with ${sellerCount} Google AdSense publisher${sellerCount !== 1 ? 's' : ''}. ${traffic}. View all publishers using this domain.`;

  return {
    title,
    description,
    keywords: `${decodedDomain}, AdSense Domain, Google Publisher, Domain Verification, ${domainData.seller_ids.slice(0, 3).join(', ')}`,
    robots: {
      index: false,
      follow: true,
      nocache: true,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://publisherradar.com/domain/${decodedDomain}`,
      images: [
        {
          url: '/og-domain.png',
          width: 1200,
          height: 630,
          alt: `${decodedDomain} - AdSense Publishers`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-domain.png'],
    },
    alternates: {
      canonical: `/domain/${decodedDomain}`,
    },
  };
}

// ============================================================================
// PAGE COMPONENT
// ============================================================================

interface PageProps {
  params: Promise<{ domain: string }>;
}

export default async function DomainPage({ params }: PageProps) {
  const { domain } = await params;
  const decodedDomain = decodeURIComponent(domain);

  // Fetch domain data
  const domainData = await fetchDomainDetail(decodedDomain);

  if (!domainData) {
    notFound();
  }

  // Batch fetch publisher details (optimized - single query instead of N+1)
  const sellerIds = domainData.seller_ids.slice(0, 50);
  const publishers = await fetchPublishersByIds(sellerIds);

  // Fetch similar domains and related TLD domains in parallel
  const [similarDomains, tldDomains] = await Promise.all([
    fetchSimilarDomains(decodedDomain, 6),
    fetchDomainsByTld(decodedDomain.split('.').pop() || '', decodedDomain, 6),
  ]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatNumber = (num: number | null) => {
    if (!num) return 'N/A';
    return num.toLocaleString();
  };

  // Extract TLD
  const tld = decodedDomain.split('.').pop() || '';

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
          <span className="text-gray-900 font-medium">{decodedDomain}</span>
        </nav>

        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Search
        </Link>

        {/* Domain Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              {decodedDomain.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900 break-all">
                  {decodedDomain}
                </h1>
                <ExternalLink href={`https://${decodedDomain}`} domain={decodedDomain} />
              </div>
              <p className="text-gray-600 mt-1">Domain Profile</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div>
              <span className="text-sm text-gray-500">Associated Publishers</span>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {domainData.seller_count}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-500">First Seen</span>
              <p className="text-lg font-semibold text-gray-900 mt-1">
                {formatDate(domainData.first_seen)}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Last Updated</span>
              <p className="text-lg font-semibold text-gray-900 mt-1">
                {formatDate(domainData.last_updated)}
              </p>
            </div>
          </div>

          {/* Detection Sources */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <span className="text-sm text-gray-500 block mb-2">Detection Sources:</span>
            <div className="flex flex-wrap gap-2">
              {domainData.detection_sources.map((source, index) => (
                <span
                  key={index}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    source === 'both'
                      ? 'bg-green-100 text-green-800'
                      : source === 'adsense_api'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {source === 'both' ? '✓ Double Verified' : source?.replace('_', ' ') || 'Unknown'}
                </span>
              ))}
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                Confidence: {Math.round((domainData.max_confidence || 0) * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* Publishers List */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Associated Publishers ({domainData.seller_count})
          </h2>
          {domainData.seller_count > 50 && (
            <p className="text-sm text-gray-600 mb-4">
              Showing first 50 publishers • Total: {domainData.seller_count}
            </p>
          )}
        </div>

        {publishers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publishers.map(publisher => {
              if (!publisher) return null;

              return (
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
                      <p className="text-xs text-gray-500">Total Domains</p>
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
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">No publishers found for this domain.</p>
          </div>
        )}

        {/* Additional Info */}
        {domainData.seller_count > 50 && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <p className="text-blue-900 font-medium">
              This domain is associated with {domainData.seller_count} publishers.
            </p>
            <p className="text-blue-700 text-sm mt-2">
              Showing top 50 by traffic. Use the search to find specific publishers.
            </p>
          </div>
        )}

        {/* Similar Domains (Internal Linking for SEO) */}
        {similarDomains.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              🔗 Similar Domains
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Domains with shared publishers (internal linking for better SEO)
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {similarDomains.map((domain) => (
                <Link
                  key={domain.domain}
                  href={`/domain/${domain.domain}`}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all p-4 border border-gray-200 hover:border-blue-300"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {domain.domain.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate mb-1">
                        {domain.domain}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        <span>{domain.seller_count} publisher{domain.seller_count !== 1 ? 's' : ''}</span>
                        {domain.max_traffic && (
                          <span className="text-green-600 font-medium">
                            {formatNumber(domain.max_traffic)}/mo
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Related TLD Domains */}
        {tldDomains.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              More .{tld} Domains
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Other high-traffic .{tld} domains with AdSense publishers
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tldDomains.map((domain) => (
                <Link
                  key={domain.domain}
                  href={`/domain/${domain.domain}`}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all p-4 border border-gray-200 hover:border-purple-300"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {domain.domain.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate mb-1">
                        {domain.domain}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        <span>{domain.seller_count} publisher{domain.seller_count !== 1 ? 's' : ''}</span>
                        {domain.max_traffic && (
                          <span className="text-green-600 font-medium">
                            {formatNumber(domain.max_traffic)}/mo
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Related Links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Explore More</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href={`/tld/${tld}`}
              className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-bold">.{tld}</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Browse .{tld} Domains</p>
                <p className="text-sm text-gray-600">View all publishers</p>
              </div>
            </Link>

            <Link
              href="/publishers"
              className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">All Publishers</p>
                <p className="text-sm text-gray-600">Browse directory</p>
              </div>
            </Link>

            <Link
              href="/"
              className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Search</p>
                <p className="text-sm text-gray-600">Find publishers</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
