import type { Metadata } from 'next';
import Link from 'next/link';
import { query } from '@/lib/db';
import type { TldAggregation } from '@/lib/types';
import { SITE_CONFIG } from '@/config/site';
import { getTldEmoji, getTldInfo } from '@/lib/tld-content';
import { getCollectionPageSchema, stringifyJSONLD } from '@/lib/structured-data';

export const revalidate = 86400; // 24 hours

export const metadata: Metadata = {
  title: 'TLD Directory | Browse AdSense Publishers by Top-Level Domain',
  description: 'Browse Google AdSense publishers and verified domains by top-level domain (TLD). Explore .com, .org, .net and hundreds more.',
  keywords: 'tld directory, adsense tld, domain directory, publishers by tld, sellers.json domains',
  openGraph: {
    title: 'TLD Directory | Browse AdSense Publishers by Top-Level Domain',
    description: 'Browse AdSense publishers and verified domains by top-level domain (TLD).',
    type: 'website',
    url: `${SITE_CONFIG.url}/tld`,
  },
  twitter: {
    card: 'summary',
    title: 'TLD Directory | Publisher Radar',
    description: 'Browse AdSense publishers and domains by TLD.',
  },
  alternates: {
    canonical: '/tld',
  },
};

export default async function TldIndexPage() {
  const result = await query<TldAggregation>(`
    SELECT *
    FROM seller_adsense.tld_aggregation_view
    ORDER BY domain_count DESC, tld ASC
  `);

  const tlds = result.rows;

  const collectionSchema = getCollectionPageSchema(
    'TLD Directory',
    'Browse AdSense publishers and verified domains by top-level domain (TLD)',
    tlds.length
  );

  return (
    <main className="min-h-screen bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: stringifyJSONLD(collectionSchema) }}
      />

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">TLD Directory</span>
        </nav>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🌐 TLD Directory
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            Browse AdSense publishers and verified domains by top-level domain (TLD). This is useful for market research,
            compliance checks, and discovering publisher clusters by region or category.
          </p>
        </div>

        {/* Quick links */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-10">
          <div className="flex flex-wrap gap-3 items-center">
            <span className="text-sm font-medium text-gray-700">Popular:</span>
            {['com', 'org', 'net', 'io', 'ai', 'app'].map((tld) => (
              <Link
                key={tld}
                href={`/tld/${tld}`}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-full text-sm transition-colors"
              >
                .{tld}
              </Link>
            ))}
          </div>
        </div>

        {/* TLD Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tlds.map((row) => {
            const tldInfo = getTldInfo(row.tld);
            const emoji = getTldEmoji(row.tld);

            return (
              <Link
                key={row.tld}
                href={`/tld/${row.tld}`}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6 border border-gray-200 hover:border-blue-300"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="min-w-0">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {emoji} .{row.tld}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {tldInfo?.description || `Browse publishers and domains using .${row.tld}`}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className="text-xs text-gray-500">Domains</div>
                    <div className="text-lg font-bold text-blue-600">
                      {row.domain_count.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500">Publishers</div>
                    <div className="text-sm font-semibold text-gray-900">
                      {row.seller_count.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Avg Traffic</div>
                    <div className="text-sm font-semibold text-green-700">
                      {row.avg_traffic ? `${Math.round(row.avg_traffic).toLocaleString()}/mo` : 'N/A'}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center bg-gray-100 border border-gray-300 rounded-xl p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Want to search by publisher ID instead?
          </h3>
          <p className="text-gray-600 mb-4">
            Use the homepage search to look up publishers by pub-id, domain, or publisher name.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Go to Search
          </Link>
        </div>
      </div>
    </main>
  );
}

