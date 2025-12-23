import { Metadata } from 'next';
import Link from 'next/link';
import { query } from '@/lib/db';
import { DomainAggregation } from '@/lib/types';
import {
  getCollectionPageSchema,
  stringifyJSONLD,
} from '@/lib/structured-data';
import PublisherIdLink from '@/components/PublisherIdLink';
import ExternalLink from '@/components/ExternalLink';
import { SITE_CONFIG } from '@/config/site';

// ============================================================================
// SSG/ISR CONFIGURATION
// ============================================================================

export const revalidate = 60; // Keep fresh, but avoid uncached DB hits on every request

// ============================================================================
// METADATA
// ============================================================================

export const metadata: Metadata = {
  title: 'Discover New Domains - Latest 100 AdSense Publishers | Publisher Radar',
  description: 'Discover the newest 100 domains added to AdSense Publisher Radar. Track recently verified publisher domains with traffic data and publisher counts.',
  keywords: 'discover domains, new domains, latest AdSense domains, recently added publishers, new publisher domains, domain tracking',
  openGraph: {
    title: 'Discover New Domains - Latest 100 AdSense Publishers',
    description: 'Discover the newest 100 domains added to AdSense Publisher Radar. Track recently verified publisher domains.',
    type: 'website',
    url: `${SITE_CONFIG.url}/discover`,
  },
  twitter: {
    card: 'summary',
    title: 'Discover New Domains - Latest 100 AdSense Publishers',
    description: 'Discover the newest 100 domains added to AdSense Publisher Radar.',
  },
  alternates: {
    canonical: '/discover',
  },
};

// ============================================================================
// PAGE COMPONENT
// ============================================================================

export default async function NewDomainsPage() {
  // Fetch newest domains from base tables (real-time data)
  const result = await query<DomainAggregation>(`
    WITH domain_stats AS (
      SELECT
        sd.domain,
        MIN(sd.first_detected) AS first_seen,
        MAX(sd.created_at) AS last_updated,
        COUNT(DISTINCT sd.seller_id) AS seller_count,
        MAX(sd.confidence_score) AS max_confidence,
        COALESCE(
          array_agg(DISTINCT sd.detection_source) FILTER (WHERE sd.detection_source IS NOT NULL),
          ARRAY[]::text[]
        ) AS detection_sources,
        array_agg(DISTINCT sd.seller_id ORDER BY sd.seller_id) AS seller_ids
      FROM seller_adsense.seller_domains sd
      WHERE sd.domain IS NOT NULL
      GROUP BY sd.domain
    )
    SELECT
      ds.domain,
      ds.seller_count,
      ds.seller_ids,
      dav.max_traffic,
      dav.total_traffic,
      ds.max_confidence,
      ds.detection_sources,
      ds.first_seen,
      ds.last_updated
    FROM domain_stats ds
    LEFT JOIN seller_adsense.domain_aggregation_view dav ON dav.domain = ds.domain
    ORDER BY ds.last_updated DESC, ds.domain ASC
    LIMIT 100
  `);

  const newDomains = result.rows;

  // Generate structured data
  const collectionSchema = getCollectionPageSchema(
    'New Domains - Latest 100 AdSense Domains',
    'The newest domains added to AdSense Publisher Radar with verified publisher associations',
    100
  );

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Latest 100 AdSense Domains',
    numberOfItems: newDomains.length,
    itemListElement: newDomains.map((domain, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'WebSite',
        url: `https://${domain.domain}`,
        name: domain.domain,
        description: `${domain.seller_count} AdSense publisher${domain.seller_count !== 1 ? 's' : ''} associated with this domain`,
      },
    })),
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) {
      return 'Unknown';
    }

    const date = new Date(dateString);
    const now = new Date();

    // Calculate days difference using date-only comparison (no time)
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffTime = nowOnly.getTime() - dateOnly.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: stringifyJSONLD(collectionSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: stringifyJSONLD(itemListSchema) }}
      />

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">New Domains</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🆕 New Domains
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            Discover the latest 100 domains added to our AdSense publisher database.
            Track newly verified publisher domains with traffic data and publisher associations.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-gray-500 mb-1">Total New Domains</div>
              <div className="text-3xl font-bold text-gray-900">{newDomains.length}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Total Publishers</div>
              <div className="text-3xl font-bold text-blue-600">
                {newDomains.reduce((sum, d) => sum + Number(d.seller_count || 0), 0).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Domains List */}
        <div className="space-y-4">
          {newDomains.map((domain, index) => (
            <Link
              key={domain.domain}
              href={`/domain/${encodeURIComponent(domain.domain)}`}
              className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-all p-6 border border-gray-200 hover:border-blue-300"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Left side - Domain info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-medium text-gray-500">
                      #{index + 1}
                    </span>
                    <h2 className="text-xl font-semibold text-gray-900 truncate">
                      {domain.domain}
                    </h2>
                    <ExternalLink href={`https://${domain.domain}`} domain={domain.domain} />
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span>{domain.seller_count} publisher{domain.seller_count !== 1 ? 's' : ''}</span>
                    </div>

                    {domain.max_traffic && (
                      <div className="flex items-center gap-1 text-green-600 font-medium">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        <span>{domain.max_traffic.toLocaleString()} visits/mo</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{Math.round((domain.max_confidence || 0) * 100)}% confidence</span>
                    </div>
                  </div>

                  {/* Publisher IDs */}
                  {domain.seller_ids && domain.seller_ids.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {domain.seller_ids.slice(0, 3).map((sellerId) => (
                        <PublisherIdLink key={sellerId} sellerId={sellerId} />
                      ))}
                      {domain.seller_ids.length > 3 && (
                        <span className="px-2 py-1 bg-gray-50 text-gray-500 text-xs rounded">
                          +{domain.seller_ids.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Right side - Date */}
                <div className="text-right">
                  <div className="text-sm text-gray-500 mb-1">Added</div>
                  <div className="text-sm font-medium text-gray-900">
                    {formatDate(domain.last_updated || domain.first_seen)}
                  </div>
                </div>
              </div>

              {/* Detection sources badges */}
              {domain.detection_sources && domain.detection_sources.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {domain.detection_sources.map((source) => (
                    <span
                      key={source}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded"
                    >
                      {source === 'both' ? '✓ Double Verified' : source}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="mt-12 text-center bg-blue-50 border border-blue-200 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Track More Domains
          </h2>
          <p className="text-gray-600 mb-4">
            Explore our full database of {newDomains.length}+ verified AdSense domains
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search All Domains
          </Link>
        </div>
      </div>
    </main>
  );
}
