'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ApiResponse, Seller } from '@/lib/types';
import { useDebounce } from '@/hooks/useDebounce';
import SellerCard from './SellerCard';

export default function SearchInterface() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize state from URL params
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [sellerType, setSellerType] = useState<'all' | 'PUBLISHER' | 'BOTH'>(
    (searchParams.get('type') as 'all' | 'PUBLISHER' | 'BOTH') || 'all'
  );
  const [hasDomain, setHasDomain] = useState<'all' | 'true' | 'false'>(
    (searchParams.get('domain') as 'all' | 'true' | 'false') || 'all'
  );
  const [results, setResults] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));

  // Debounce the search query
  const debouncedQuery = useDebounce(query, 300);

  // Update URL with search params
  const updateURL = useCallback((newPage: number) => {
    const params = new URLSearchParams();
    if (debouncedQuery) params.set('q', debouncedQuery);
    if (sellerType !== 'all') params.set('type', sellerType);
    if (hasDomain !== 'all') params.set('domain', hasDomain);
    if (newPage > 1) params.set('page', newPage.toString());

    const queryString = params.toString();
    router.push(queryString ? `?${queryString}` : '/');
  }, [debouncedQuery, sellerType, hasDomain, router]);

  const searchSellers = useCallback(async (pageNum: number = 1) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '20',
      });

      if (debouncedQuery) params.set('query', debouncedQuery);
      if (sellerType !== 'all') params.set('seller_type', sellerType);
      if (hasDomain !== 'all') params.set('has_domain', hasDomain);

      const res = await fetch(`/api/sellers/search?${params}`);
      const data: ApiResponse<Seller[]> = await res.json();

      if (data.error) {
        setError(data.error);
        setResults([]);
      } else {
        setResults(data.data || []);
        setTotal(data.total || 0);
        setPage(pageNum);
        updateURL(pageNum);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, sellerType, hasDomain, updateURL]);

  // Auto-search when debounced query or filters change
  useEffect(() => {
    if (debouncedQuery || sellerType !== 'all' || hasDomain !== 'all') {
      searchSellers(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // searchSellers is intentionally excluded to prevent unnecessary re-renders
    // We only want to trigger search when the actual search criteria change
  }, [debouncedQuery, sellerType, hasDomain]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchSellers(1);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search by Seller ID or Domain
            </label>
            <input
              id="search"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter seller ID (e.g., pub-1234567890) or domain (e.g., example.com)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="seller-type" className="block text-sm font-medium text-gray-700 mb-2">
                Seller Type
              </label>
              <select
                id="seller-type"
                value={sellerType}
                onChange={(e) => {
                  const value = e.target.value as 'all' | 'PUBLISHER' | 'BOTH';
                  setSellerType(value);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="PUBLISHER">Publisher Only</option>
                <option value="BOTH">Both</option>
              </select>
            </div>

            <div>
              <label htmlFor="has-domain" className="block text-sm font-medium text-gray-700 mb-2">
                Domain Status
              </label>
              <select
                id="has-domain"
                value={hasDomain}
                onChange={(e) => {
                  const value = e.target.value as 'all' | 'true' | 'false';
                  setHasDomain(value);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All</option>
                <option value="true">With Domain</option>
                <option value="false">Without Domain</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {results.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-600">
              Found {total.toLocaleString()} results (showing page {page})
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => searchSellers(page - 1)}
                disabled={page === 1 || loading}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => searchSellers(page + 1)}
                disabled={results.length < 20 || loading}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((seller) => (
              <SellerCard key={seller.seller_id} seller={seller} />
            ))}
          </div>
        </div>
      )}

      {!loading && results.length === 0 && query && (
        <div className="text-center py-12 text-gray-500">
          No sellers found matching your search criteria.
        </div>
      )}
    </div>
  );
}
