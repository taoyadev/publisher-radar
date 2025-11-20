import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  fetchPublisherDetail,
  fetchTopPublisherIds,
  fetchRelatedPublishers,
} from '@/lib/ssg-queries';
import { getRevalidateTime, getPublisherTier } from '@/lib/cache-helpers';
import {
  getPublisherSchema,
  getBreadcrumbSchema,
  stringifyJSONLD,
} from '@/lib/structured-data';
import DomainCard from '@/components/DomainCard';

// ============================================================================
// SSG/ISR CONFIGURATION
// ============================================================================

// Enable ISR with dynamic revalidation
export const revalidate = 3600; // 1 hour default
export const dynamicParams = true; // Allow dynamic routes beyond static params

// ============================================================================
// STATIC PARAMS GENERATION
// ============================================================================

/**
 * Pure SSR - No static generation
 * All pages generated on-demand for better build performance
 */
export async function generateStaticParams() {
  // Return empty array - all pages will be generated on-demand (SSR)
  return [];
}

// ============================================================================
// METADATA GENERATION
// ============================================================================

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const publisher = await fetchPublisherDetail(id);

  if (!publisher) {
    return {
      title: 'Publisher Not Found | AdSense Publisher Radar',
      description: 'The requested AdSense publisher could not be found.',
    };
  }

  const domainCount = publisher.domain_count || 0;
  const traffic = publisher.max_traffic
    ? `${publisher.max_traffic.toLocaleString()} monthly visitors`
    : 'traffic data pending';

  const title = publisher.name
    ? `${publisher.name} - AdSense Publisher | ${domainCount} Domain${domainCount !== 1 ? 's' : ''}${
        publisher.max_traffic ? ` | ${publisher.max_traffic.toLocaleString()} Visits/mo` : ''
      }`
    : `AdSense Publisher ${id} | ${domainCount} Verified Domain${domainCount !== 1 ? 's' : ''}${
        publisher.max_traffic ? ` | ${publisher.max_traffic.toLocaleString()} Visits/mo` : ''
      }`;

  const description = publisher.name
    ? `${publisher.name} (${id}) - AdSense ${publisher.seller_type} with ${domainCount} verified domain${domainCount !== 1 ? 's' : ''}. ${traffic}. Full publisher profile and domain details.`
    : `AdSense Publisher ${id} - ${domainCount} verified domain${domainCount !== 1 ? 's' : ''}. ${traffic}. View complete publisher information and associated domains.`;

  const keywords = [
    'Google AdSense Publisher',
    id,
    publisher.name || '',
    'AdSense Seller',
    'Publisher Profile',
    'Domain Verification',
    ...publisher.domains.slice(0, 5).map(d => d.domain),
  ].filter(Boolean);

  return {
    title,
    description,
    keywords: keywords.join(', '),
    ...(domainCount === 0 && {
      robots: {
        index: false,
        follow: true,
        nocache: true,
      },
    }),
    openGraph: {
      title,
      description,
      type: 'profile',
      url: `https://publisherradar.com/publisher/${id}`,
      images: [
        {
          url: '/og-publisher.png',
          width: 1200,
          height: 630,
          alt: `${publisher.name || id} - AdSense Publisher Profile`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-publisher.png'],
    },
    alternates: {
      canonical: `/publisher/${id}`,
    },
  };
}

// ============================================================================
// PAGE COMPONENT
// ============================================================================

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PublisherPage({ params }: PageProps) {
  const { id } = await params;

  // Fetch publisher data (single optimized query)
  const publisher = await fetchPublisherDetail(id);

  if (!publisher) {
    notFound();
  }

  // Fetch related publishers in parallel
  const relatedPublishers = await fetchRelatedPublishers(id, 5);

  // Calculate display values
  const domainsWithTraffic = publisher.domains.filter(
    d => d.search_traffic_monthly || d.total_traffic_monthly
  );

  const totalTraffic = domainsWithTraffic.reduce(
    (sum, d) => sum + (d.search_traffic_monthly || d.total_traffic_monthly || 0),
    0
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Sort domains by traffic
  const sortedDomains = [...publisher.domains].sort((a, b) => {
    const aTraffic = a.search_traffic_monthly || a.total_traffic_monthly || 0;
    const bTraffic = b.search_traffic_monthly || b.total_traffic_monthly || 0;
    return bTraffic - aTraffic;
  });

  // Generate structured data
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Publishers', url: '/publishers' },
    { name: publisher.name || id, url: `/publisher/${id}` },
  ]);

  const publisherSchema = getPublisherSchema(publisher);

  const domainListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Domains for ${publisher.name || id}`,
    numberOfItems: publisher.domain_count,
    itemListElement: publisher.domains.slice(0, 20).map((domain, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'WebSite',
        url: `https://${domain.domain}`,
        name: domain.domain,
      },
    })),
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: stringifyJSONLD(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: stringifyJSONLD(publisherSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: stringifyJSONLD(domainListSchema) }}
      />

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/publishers" className="hover:text-blue-600 transition-colors">
            Publishers
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{id}</span>
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

        {/* Publisher Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {publisher.name || id}
              </h1>
              <p className="text-lg text-gray-600 mb-4 font-mono break-all">
                Publisher ID: {id}
              </p>
            </div>
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                publisher.seller_type === 'PUBLISHER'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-purple-100 text-purple-800'
              }`}
            >
              {publisher.seller_type}
            </span>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div>
              <span className="text-sm text-gray-500">First Seen</span>
              <p className="text-lg font-semibold text-gray-900 mt-1">
                {formatDate(publisher.first_seen_date)}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Total Domains</span>
              <p className="text-lg font-semibold text-gray-900 mt-1">
                {publisher.domain_count}
              </p>
            </div>
            {domainsWithTraffic.length > 0 && (
              <div>
                <span className="text-sm text-gray-500">Total Search Traffic</span>
                <p className="text-lg font-semibold text-green-600 mt-1">
                  {totalTraffic.toLocaleString()} /month
                </p>
              </div>
            )}
          </div>

          {/* Additional Info */}
          <div className="mt-6 pt-6 border-t border-gray-200 flex flex-wrap gap-4">
            {publisher.is_confidential && (
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
                Confidential Seller
              </span>
            )}
            {publisher.adsense_api_checked && publisher.adsense_api_status && (
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                ✓ AdSense API Verified
              </span>
            )}
            {publisher.primary_domain && (
              <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">
                Primary: {publisher.primary_domain}
              </span>
            )}
          </div>
        </div>

        {/* Domains Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Associated Domains ({publisher.domain_count})
          </h2>
          {domainsWithTraffic.length > 0 && (
            <p className="text-sm text-gray-600 mb-4">
              {domainsWithTraffic.length} domains with traffic data • Sorted by traffic
            </p>
          )}
        </div>

        {sortedDomains.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {sortedDomains.map((domain, index) => (
              <DomainCard
                key={`${domain.domain}-${index}`}
                domain={{
                  id: index,
                  seller_id: id,
                  domain: domain.domain,
                  first_detected: domain.first_detected,
                  detection_source: domain.detection_source as any,
                  confidence_score: domain.confidence_score,
                  created_at: new Date().toISOString(),
                  search_traffic_monthly: domain.search_traffic_monthly ?? undefined,
                  total_traffic_monthly: domain.total_traffic_monthly ?? undefined,
                }}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center mb-12">
            <p className="text-gray-600">No domains found for this publisher.</p>
          </div>
        )}

        {/* Related Publishers */}
        {relatedPublishers.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Related Publishers
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Publishers with shared domains
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedPublishers.map(related => (
                <Link
                  key={related.seller_id}
                  href={`/publisher/${related.seller_id}`}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 border border-gray-200"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900 truncate flex-1">
                      {related.name || related.seller_id}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ml-2 ${
                        related.seller_type === 'PUBLISHER'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {related.seller_type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{related.seller_id}</p>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{related.domain_count} domains</span>
                    {related.max_traffic && (
                      <span className="text-green-600 font-medium">
                        {related.max_traffic.toLocaleString()} /mo
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
