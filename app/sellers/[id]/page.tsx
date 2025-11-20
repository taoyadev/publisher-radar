'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Seller, SellerDomain, ApiResponse } from '@/lib/types';
import DomainCard from '@/components/DomainCard';

export default function SellerDetailPage() {
  const params = useParams();
  const sellerId = params?.id as string;

  const [seller, setSeller] = useState<Seller | null>(null);
  const [domains, setDomains] = useState<SellerDomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!sellerId) return;

      setLoading(true);
      setError(null);

      try {
        // Fetch seller details
        const sellerRes = await fetch(`/api/sellers/${sellerId}`);
        const sellerData: ApiResponse<Seller> = await sellerRes.json();

        if (sellerData.error) {
          setError(sellerData.error);
          return;
        }

        setSeller(sellerData.data);

        // Fetch domains
        const domainsRes = await fetch(`/api/sellers/${sellerId}/domains`);
        const domainsData: ApiResponse<SellerDomain[]> = await domainsRes.json();

        if (domainsData.error) {
          setError(domainsData.error);
          return;
        }

        setDomains(domainsData.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load seller data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sellerId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Loading seller data...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !seller) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Search
          </Link>

          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Seller</h1>
            <p className="text-gray-600">{error || 'Seller not found'}</p>
          </div>
        </div>
      </main>
    );
  }

  const domainsWithTraffic = domains.filter(d => d.search_traffic_monthly || d.total_traffic_monthly);
  const totalTraffic = domainsWithTraffic.reduce(
    (sum, d) => sum + (d.search_traffic_monthly || d.total_traffic_monthly || 0),
    0
  );

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Search
        </Link>

        {/* Seller Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2 break-all">
                {seller.seller_id}
              </h1>
              {seller.name && (
                <p className="text-xl text-gray-600 mb-4">{seller.name}</p>
              )}
            </div>
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                seller.seller_type === 'PUBLISHER'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-purple-100 text-purple-800'
              }`}
            >
              {seller.seller_type}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div>
              <span className="text-sm text-gray-500">First Seen</span>
              <p className="text-lg font-semibold text-gray-900 mt-1">
                {formatDate(seller.first_seen_date)}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Total Domains</span>
              <p className="text-lg font-semibold text-gray-900 mt-1">
                {domains.length}
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

          {seller.is_confidential && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
                Confidential Seller
              </span>
            </div>
          )}
        </div>

        {/* Domains Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Associated Domains ({domains.length})
          </h2>
          {domainsWithTraffic.length > 0 && (
            <p className="text-sm text-gray-600 mb-4">
              {domainsWithTraffic.length} domains with traffic data • Sorted by traffic
            </p>
          )}
        </div>

        {domains.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {domains.map((domain) => (
              <DomainCard key={domain.id} domain={domain} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">No domains found for this seller.</p>
          </div>
        )}
      </div>
    </main>
  );
}
