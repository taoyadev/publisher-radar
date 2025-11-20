import Link from 'next/link';
import type { PublisherListItem } from '@/lib/types';

interface PublisherGridProps {
  publishers: PublisherListItem[];
  title: string;
  viewAllLink?: string;
  viewAllText?: string;
}

export default function PublisherGrid({
  publishers,
  title,
  viewAllLink,
  viewAllText = 'View All',
}: PublisherGridProps) {
  const formatNumber = (num: number | null) => {
    if (!num) return 'N/A';
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}K`;
    }
    return num.toLocaleString();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (publishers.length === 0) {
    return null;
  }

  return (
    <section className="mb-12">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        {viewAllLink && (
          <Link
            href={viewAllLink}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            {viewAllText}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        )}
      </div>

      {/* Publishers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {publishers.map((publisher) => (
          <Link
            key={publisher.seller_id}
            href={`/publisher/${publisher.seller_id}`}
            className="group bg-white rounded-lg shadow-sm hover:shadow-lg transition-all p-5 border border-gray-200 hover:border-blue-300 hover:scale-[1.02]"
          >
            {/* Publisher Header */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                  {publisher.name || publisher.seller_id}
                </h3>
                {publisher.name && (
                  <p className="text-xs text-gray-500 font-mono truncate mt-1">
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

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">Domains</p>
                <p className="text-sm font-bold text-gray-900">
                  {publisher.domain_count}
                </p>
              </div>
              {publisher.max_traffic ? (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Traffic</p>
                  <p className="text-sm font-bold text-green-600">
                    {formatNumber(publisher.max_traffic)}/mo
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-xs text-gray-500 mb-1">First Seen</p>
                  <p className="text-xs font-semibold text-gray-900">
                    {formatDate(publisher.first_seen_date)}
                  </p>
                </div>
              )}
            </div>

            {/* Primary Domain */}
            {publisher.primary_domain && (
              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-600 truncate">
                  {publisher.primary_domain}
                </p>
              </div>
            )}

            {/* Badges */}
            {publisher.verified_domains_count > 0 && (
              <div className="mt-3">
                <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                  ✓ {publisher.verified_domains_count} verified
                </span>
              </div>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
