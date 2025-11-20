import { Metadata } from 'next';
import { Suspense } from 'react';
import {
  fetchHomePageStats,
  fetchTopPublishersByTraffic,
  fetchRecentPublishers,
  fetchTopDomainDetails,
} from '@/lib/ssg-queries';
import {
  getOrganizationSchema,
  getWebsiteSchema,
  getPublisherListSchema,
  getFAQSchema,
  stringifyJSONLD,
} from '@/lib/structured-data';
import Hero from '@/components/Hero';
import PublisherGrid from '@/components/PublisherGrid';
import SearchInterface from '@/components/SearchInterface';
import UseCases from '@/components/UseCases';
import FAQ from '@/components/FAQ';
import WhyPublisherRadar from '@/components/content/WhyPublisherRadar';
import Link from 'next/link';

// ============================================================================
// SSR CONFIGURATION
// ============================================================================

export const revalidate = 300; // 5 minutes

// ============================================================================
// METADATA
// ============================================================================

export const metadata: Metadata = {
  title: 'AdSense Publisher Radar | 1M+ Verified Publishers Directory',
  description: 'Search and explore 1,000,000+ Google AdSense publishers. Free Publisher ID reverse lookup, domain verification, and traffic insights from sellers.json.',
  keywords: 'AdSense publishers, sellers.json, publisher ID lookup, domain verification, AdSense directory, pub-id search, programmatic advertising, ad tech',
  openGraph: {
    title: 'AdSense Publisher Radar | 1M+ Publishers Directory',
    description: 'Search 1M+ verified Google AdSense publishers. Publisher ID reverse lookup, domain verification, traffic data.',
    type: 'website',
    url: 'https://publisherradar.com',
    images: [
      {
        url: '/og-home.png',
        width: 1200,
        height: 630,
        alt: 'AdSense Publisher Radar',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AdSense Publisher Radar | 1M+ Publishers',
    description: 'Free Publisher ID reverse lookup and domain verification',
    images: ['/og-home.png'],
  },
};

// ============================================================================
// PAGE COMPONENT (SSR)
// ============================================================================

export default async function HomePage() {
  // Fetch all data in parallel for maximum performance
  const [stats, topPublishers, recentPublishers, topDomains] = await Promise.all([
    fetchHomePageStats(),
    fetchTopPublishersByTraffic(8),
    fetchRecentPublishers(8),
    fetchTopDomainDetails(6),
  ]);

  // Generate structured data
  const organizationSchema = getOrganizationSchema();
  const websiteSchema = getWebsiteSchema();
  const topPublishersListSchema = getPublisherListSchema(
    topPublishers,
    'Top AdSense Publishers by Traffic'
  );
  const faqSchema = getFAQSchema([
    {
      question: 'What is sellers.json?',
      answer: 'Sellers.json is a standard file published by ad exchanges and SSPs (like Google AdSense) that lists authorized sellers of their inventory. It provides transparency in programmatic advertising by identifying publishers and their domains.',
    },
    {
      question: 'How often is the data updated?',
      answer: 'Our database is automatically synchronized with Google\'s sellers.json file every day at 2:00 AM. We track new additions, removals, and updates to keep the data fresh.',
    },
    {
      question: 'What does "PUBLISHER" vs "BOTH" mean?',
      answer: '"PUBLISHER" indicates the entity owns and operates the site. "BOTH" means the entity both owns the site AND operates as an intermediary reselling inventory. This distinction is important for supply chain transparency.',
    },
    {
      question: 'Where does the traffic data come from?',
      answer: 'Traffic estimates are sourced from Keywords Everywhere API and AdSense API. Not all publishers have traffic data available, especially newer or smaller sites.',
    },
    {
      question: 'Can I use this data for commercial purposes?',
      answer: 'Yes! The sellers.json file is publicly available from Google for transparency purposes. You can use this data for compliance checking, market research, competitor analysis, and other legitimate business needs.',
    },
    {
      question: 'How do I find a specific publisher?',
      answer: 'Use the search bar on the homepage to search by Publisher ID (pub-xxx), domain name, or publisher name. You can also browse by TLD or sort by traffic volume.',
    },
    {
      question: 'What is "double verification"?',
      answer: 'Domains marked as "double verified" appear in both Google\'s sellers.json file and the AdSense API, providing the highest confidence level for domain-publisher associations.',
    },
    {
      question: 'Why do some publishers have no domains listed?',
      answer: 'Some publishers operate as confidential or haven\'t publicly disclosed their domains. We continuously enrich data through multiple sources (sellers.json + AdSense API) to improve coverage.',
    },
  ]);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: stringifyJSONLD(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: stringifyJSONLD(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: stringifyJSONLD(topPublishersListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: stringifyJSONLD(faqSchema) }}
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section with Stats */}
        <Hero stats={stats} />

        {/* Search Interface (Client Component) */}
        <div className="mb-16">
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
              Publisher ID Reverse Lookup
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Search by Publisher ID (pub-xxx), domain, or publisher name
            </p>
            <Suspense fallback={<div className="text-center py-8">Loading search...</div>}>
              <SearchInterface />
            </Suspense>
          </div>
        </div>

        {/* Why Publisher Radar - Main Content Section */}
        <WhyPublisherRadar stats={stats} />

        {/* Top Publishers by Traffic */}
        <PublisherGrid
          publishers={topPublishers}
          title="🔥 Top Publishers by Traffic"
          viewAllLink="/publishers?sort=traffic"
          viewAllText="View All Publishers"
        />

        {/* Recently Added */}
        <PublisherGrid
          publishers={recentPublishers}
          title="✨ Recently Added Publishers"
          viewAllLink="/publishers"
          viewAllText="View All Publishers"
        />

        {/* Top Domains Section */}
        {topDomains.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                🌐 High-Traffic Domains
              </h2>
              <Link
                href="/discover"
                className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1"
              >
                Discover Domains
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topDomains.map((domain) => (
                <Link
                  key={domain.domain}
                  href={`/domain/${domain.domain}`}
                  className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all p-6 border border-gray-200 hover:border-blue-300"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {domain.domain.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate mb-1">
                        {domain.domain}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {domain.seller_count} publisher{domain.seller_count !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Traffic</p>
                      <p className="text-sm font-bold text-green-600">
                        {domain.max_traffic
                          ? `${domain.max_traffic.toLocaleString()}/mo`
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Confidence</p>
                      <p className="text-sm font-bold text-gray-900">
                        {domain.max_confidence
                          ? `${Math.round(domain.max_confidence * 100)}%`
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Link
            href="/publishers"
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
          >
            <div className="text-4xl font-bold mb-2">
              {stats.total_publishers.toLocaleString()}
            </div>
            <div className="text-blue-100 mb-4">Total Publishers</div>
            <div className="flex items-center gap-2 text-sm font-medium">
              Browse Directory
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </Link>

          <Link
            href="/publishers"
            className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl"
          >
            <div className="text-4xl font-bold mb-2">
              +{stats.recent_growth.new_last_7_days}
            </div>
            <div className="text-green-100 mb-4">New This Week</div>
            <div className="flex items-center gap-2 text-sm font-medium">
              View All Publishers
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </Link>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
            <div className="text-4xl font-bold mb-2">
              {stats.total_verified_domains.toLocaleString()}
            </div>
            <div className="text-purple-100 mb-4">Verified Domains</div>
            <div className="flex items-center gap-2 text-sm font-medium">
              Double-confirmed
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        {/* Use Cases */}
        <UseCases />

        {/* FAQ */}
        <FAQ />
      </div>
    </main>
  );
}
