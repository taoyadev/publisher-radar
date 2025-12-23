/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from 'next';
import Link from 'next/link';
import { query } from '@/lib/db';
import type { PublisherListItem } from '@/lib/types';
import { SITE_CONFIG } from '@/config/site';

export const revalidate = 300; // 5 minutes

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const rawName = resolvedSearchParams.name;
  const nameQuery = typeof rawName === 'string' ? rawName.trim() : '';

  if (!nameQuery) {
    return {
      title: 'Search Publishers | Publisher Radar',
      description: 'Search AdSense publishers by name or seller ID.',
      robots: { index: false, follow: true },
      alternates: { canonical: '/publishers' },
    };
  }

  return {
    title: `Search Publishers: ${nameQuery}`,
    description: `Search results for AdSense publishers matching "${nameQuery}". Browse profiles, domains, and seller types.`,
    robots: { index: false, follow: true },
    openGraph: {
      title: `Search Publishers: ${nameQuery}`,
      description: `Search results for AdSense publishers matching "${nameQuery}".`,
      type: 'website',
      url: `${SITE_CONFIG.url}/publishers`,
    },
    twitter: {
      card: 'summary',
      title: `Search Publishers: ${nameQuery}`,
      description: `Search results for "${nameQuery}"`,
    },
    alternates: { canonical: '/publishers' },
  };
}

export default async function PublisherSearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const rawName = resolvedSearchParams.name;
  const nameQuery = typeof rawName === 'string' ? rawName.trim() : '';

  const publishers = nameQuery
    ? (
        await query<PublisherListItem>(
          `
          SELECT *
          FROM seller_adsense.publisher_list_view
          WHERE domain_count > 0
            AND (name ILIKE $1 OR seller_id ILIKE $1)
          ORDER BY domain_count DESC, max_traffic DESC NULLS LAST, seller_id ASC
          LIMIT 100
          `,
          [`%${nameQuery}%`]
        )
      ).rows
    : [];

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/publishers" className="hover:text-blue-600 transition-colors">
            Publishers
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Search</span>
        </nav>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Search Publishers</h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            {nameQuery ? (
              <>
                Showing up to 100 publishers matching{' '}
                <span className="font-semibold text-gray-900">"{nameQuery}"</span>.{' '}
                <Link href="/publishers" className="text-blue-600 hover:text-blue-800 font-medium">
                  Back to Top 100
                </Link>
              </>
            ) : (
              <>
                Enter a query like "Google", "WordPress", or "pub-123..." in the URL as{' '}
                <code className="px-1 py-0.5 bg-gray-100 border border-gray-200 rounded">?name=...</code>.
              </>
            )}
          </p>
        </div>

        {nameQuery && publishers.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No matches found</h2>
            <p className="text-gray-600 mb-4">
              Try a broader term, or go back to the directory.
            </p>
            <Link
              href="/publishers"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Browse Top Publishers
            </Link>
          </div>
        )}

        {publishers.length > 0 && (
          <div className="space-y-4">
            {publishers.map((publisher) => (
              <Link
                key={publisher.seller_id}
                href={`/publisher/${publisher.seller_id}`}
                className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-all p-6 border border-gray-200 hover:border-blue-300"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-semibold text-gray-900 truncate">
                      {publisher.name || publisher.seller_id}
                    </h2>
                    {publisher.name && (
                      <p className="text-sm text-gray-500 font-mono truncate">{publisher.seller_id}</p>
                    )}

                    <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Domains</p>
                        <p className="text-lg font-bold text-blue-600">{publisher.domain_count.toLocaleString()}</p>
                      </div>
                      {publisher.max_traffic && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Max Traffic</p>
                          <p className="text-lg font-bold text-green-600">
                            {publisher.max_traffic.toLocaleString()}/mo
                          </p>
                        </div>
                      )}
                      {publisher.primary_domain && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Primary Domain</p>
                          <p className="text-sm font-medium text-gray-900 truncate">{publisher.primary_domain}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                      publisher.seller_type === 'PUBLISHER'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {publisher.seller_type}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

