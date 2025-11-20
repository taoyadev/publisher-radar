import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { fetchTldDetail, fetchAllTlds, fetchPublishersByTld } from '@/lib/ssg-queries';
import { getTldKeywords, getTldDescription, getTldFAQs, getRelatedTlds, getTldInfo, getTldEmoji } from '@/lib/tld-content';
import TldFAQ from '@/components/TldFAQ';

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
  params: Promise<{ tld: string }>;
}): Promise<Metadata> {
  const { tld } = await params;
  const tldData = await fetchTldDetail(tld.toLowerCase());

  if (!tldData) {
    return {
      title: 'TLD Not Found | AdSense Publisher Radar',
      description: 'The requested top-level domain could not be found.',
    };
  }

  // Enhanced metadata using tld-content utilities
  const enhancedDescription = getTldDescription(tldData.tld, {
    domain_count: tldData.domain_count,
    seller_count: tldData.seller_count,
    avg_traffic: tldData.avg_traffic,
  });

  const keywords = getTldKeywords(tldData.tld);

  const title = `.${tld} Domains - ${tldData.domain_count.toLocaleString()} Domains | ${tldData.seller_count.toLocaleString()} Publishers`;

  return {
    title,
    description: enhancedDescription,
    keywords: keywords.join(', '),
    openGraph: {
      title,
      description: enhancedDescription,
      type: 'website',
      url: `https://publisherradar.com/tld/${tld}`,
      images: [
        {
          url: '/og-tld.png',
          width: 1200,
          height: 630,
          alt: `.${tld} Domain Directory`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: enhancedDescription,
      images: ['/og-tld.png'],
    },
    alternates: {
      canonical: `/tld/${tld}`,
    },
  };
}

// ============================================================================
// PAGE COMPONENT
// ============================================================================

interface PageProps {
  params: Promise<{ tld: string }>;
}

export default async function TldPage({ params }: PageProps) {
  const { tld } = await params;
  const tldLower = tld.toLowerCase();

  // Fetch TLD data
  const tldData = await fetchTldDetail(tldLower);

  if (!tldData) {
    notFound();
  }

  // Fetch first page of publishers for this TLD (20 publishers)
  const { publishers, total } = await fetchPublishersByTld(tldLower, 1, 20);

  const formatNumber = (num: number | null) => {
    if (!num) return 'N/A';
    return num.toLocaleString();
  };

  const hasMorePages = total > 20;
  const totalPages = Math.ceil(total / 100); // 100 per page for pagination

  // Get TLD info for educational content
  const tldInfo = getTldInfo(tldData.tld);

  // Generate FAQ data
  const faqData = getTldFAQs(tldData.tld, {
    domain_count: tldData.domain_count,
    seller_count: tldData.seller_count,
  });

  // Fetch all TLDs for related TLDs section
  const allTlds = await fetchAllTlds();
  const relatedTlds = getRelatedTlds(tldData.tld, allTlds).slice(0, 8);

  // ============================================================================
  // STRUCTURED DATA
  // ============================================================================

  // Breadcrumb Schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://publisherradar.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'TLD Directory',
        item: 'https://publisherradar.com/tld',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: `.${tld} Domains`,
        item: `https://publisherradar.com/tld/${tld}`,
      },
    ],
  };

  // CollectionPage Schema
  const collectionPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `.${tld} Domain Directory`,
    description: getTldDescription(tldData.tld, {
      domain_count: tldData.domain_count,
      seller_count: tldData.seller_count,
      avg_traffic: tldData.avg_traffic,
    }),
    url: `https://publisherradar.com/tld/${tld}`,
    isPartOf: {
      '@type': 'WebSite',
      name: 'Publisher Radar',
      url: 'https://publisherradar.com',
    },
    about: {
      '@type': 'Thing',
      name: `.${tld} Top-Level Domain`,
      description: `Directory of ${tldData.domain_count.toLocaleString()} domains and ${tldData.seller_count.toLocaleString()} AdSense publishers using .${tld} TLD`,
    },
  };

  // ItemList Schema for Publishers
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Top AdSense Publishers Using .${tld} Domains`,
    description: `List of verified Google AdSense publishers using .${tld} top-level domain`,
    numberOfItems: publishers.length,
    itemListElement: publishers.slice(0, 10).map((publisher, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Organization',
        name: publisher.name || publisher.seller_id,
        identifier: publisher.seller_id,
        url: `https://publisherradar.com/publisher/${publisher.seller_id}`,
        ...(publisher.primary_domain && {
          url: `https://${publisher.primary_domain}`,
        }),
      },
    })),
  };

  // FAQ Schema
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqData.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">TLDs</span>
          <span>/</span>
          <span className="text-gray-900 font-medium">.{tld}</span>
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

        {/* TLD Header */}
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg shadow-lg p-8 mb-8 text-white">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <span className="text-3xl font-bold">.{tld}</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">
                .{tld} Domain Directory
              </h1>
              <p className="text-blue-100 text-lg">
                Top-Level Domain Statistics
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <span className="text-blue-100 text-sm">Unique Domains</span>
              <p className="text-3xl font-bold mt-2">
                {formatNumber(tldData.domain_count)}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <span className="text-blue-100 text-sm">Total Publishers</span>
              <p className="text-3xl font-bold mt-2">
                {formatNumber(tldData.seller_count)}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <span className="text-blue-100 text-sm">Avg Traffic/Domain</span>
              <p className="text-3xl font-bold mt-2">
                {tldData.avg_traffic ? `${formatNumber(Math.round(tldData.avg_traffic))}/mo` : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Educational Content */}
        {tldInfo && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{getTldEmoji(tld)}</span>
              <h2 className="text-2xl font-bold text-gray-900">
                About .{tld} Domains
              </h2>
            </div>

            <div className="prose prose-blue max-w-none">
              <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                {tldInfo.description}
              </p>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 rounded-lg p-5">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                    TLD Information
                  </h3>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Full Name:</dt>
                      <dd className="font-medium text-gray-900">{tldInfo.fullName}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Category:</dt>
                      <dd className="font-medium text-gray-900 capitalize">{tldInfo.category} TLD</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Trust Level:</dt>
                      <dd className={`font-medium ${
                        tldInfo.trustLevel === 'high' ? 'text-green-600' :
                        tldInfo.trustLevel === 'medium' ? 'text-yellow-600' :
                        'text-orange-600'
                      }`}>
                        {tldInfo.trustLevel.charAt(0).toUpperCase() + tldInfo.trustLevel.slice(1)}
                      </dd>
                    </div>
                    {tldInfo.launchYear && (
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Launched:</dt>
                        <dd className="font-medium text-gray-900">{tldInfo.launchYear}</dd>
                      </div>
                    )}
                  </dl>
                </div>

                <div className="bg-gray-50 rounded-lg p-5">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                    Common Uses
                  </h3>
                  <ul className="space-y-2">
                    {tldInfo.commonUses.map((use, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-gray-700">
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full flex-shrink-0"></span>
                        <span>{use}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {tldInfo.registrationRestrictions && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <span className="text-yellow-600 flex-shrink-0">⚠️</span>
                    <div>
                      <h4 className="font-semibold text-yellow-900 mb-1">Registration Restrictions</h4>
                      <p className="text-yellow-800 text-sm">{tldInfo.registrationRestrictions}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Publishers Section */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Top Publishers Using .{tld}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Showing 20 of {formatNumber(total)} publishers
              </p>
            </div>

            {hasMorePages && (
              <Link
                href={`/tld/${tld}/page/1`}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                View All {formatNumber(total)} Publishers →
              </Link>
            )}
          </div>
        </div>

        {/* Publishers Grid */}
        {publishers.length > 0 ? (
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
                      <p className="text-xs text-gray-500">Verified</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {publisher.verified_domains_count || 0}
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
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">No publishers found for this TLD.</p>
          </div>
        )}

        {/* Pagination Info */}
        {hasMorePages && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <p className="text-blue-900 font-medium mb-4">
              Browse all {formatNumber(total)} publishers using .{tld} domains
            </p>
            <Link
              href={`/tld/${tld}/page/1`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              View Full Directory
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        )}

        {/* FAQ Section */}
        <div className="mt-12">
          <TldFAQ faqs={faqData} tld={tld} />
        </div>

        {/* Related TLDs */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {relatedTlds.length > 0 && tldInfo
                ? `Similar ${tldInfo.category === 'country' ? 'Country Code' : tldInfo.category.charAt(0).toUpperCase() + tldInfo.category.slice(1)} TLDs`
                : 'Popular TLDs'}
            </h3>
            <p className="text-sm text-gray-600">
              {relatedTlds.length > 0 && tldInfo
                ? `Explore other ${tldInfo.category} TLDs with similar characteristics and publisher demographics`
                : 'Discover AdSense publishers across different top-level domains'}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {(relatedTlds.length > 0 ? relatedTlds : ['com', 'org', 'net', 'io', 'co', 'ai', 'dev', 'app']).map(relatedTld => (
              <Link
                key={relatedTld}
                href={`/tld/${relatedTld}`}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  relatedTld === tldLower
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:border-blue-300 hover:shadow-sm'
                }`}
              >
                .{relatedTld}
              </Link>
            ))}
          </div>
        </div>

        {/* Additional Navigation */}
        <div className="mt-8 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Explore More</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <Link
              href="/publishers"
              className="flex items-center gap-3 p-4 bg-white rounded-lg hover:shadow-md transition-all border border-gray-200 hover:border-blue-300"
            >
              <span className="text-2xl">👥</span>
              <div>
                <div className="font-medium text-gray-900">All Publishers</div>
                <div className="text-xs text-gray-600">Browse complete directory</div>
              </div>
            </Link>
            <Link
              href="/discover"
              className="flex items-center gap-3 p-4 bg-white rounded-lg hover:shadow-md transition-all border border-gray-200 hover:border-blue-300"
            >
              <span className="text-2xl">✨</span>
              <div>
                <div className="font-medium text-gray-900">Discover</div>
                <div className="text-xs text-gray-600">Recently added domains</div>
              </div>
            </Link>
            <Link
              href="/"
              className="flex items-center gap-3 p-4 bg-white rounded-lg hover:shadow-md transition-all border border-gray-200 hover:border-blue-300"
            >
              <span className="text-2xl">🔍</span>
              <div>
                <div className="font-medium text-gray-900">Search Publishers</div>
                <div className="text-xs text-gray-600">Find by domain or ID</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
