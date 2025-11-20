'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ApiResponse, Seller } from '@/lib/types';
import SellerCard from './SellerCard';

export default function ReverseLookupInterface() {
  const router = useRouter();
  const [publisherId, setPublisherId] = useState('');
  const [result, setResult] = useState<Seller | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validatePublisherId = (id: string): boolean => {
    // Remove whitespace
    const cleanId = id.trim();

    // Check if it starts with pub- and has 16 digits after
    const pubIdPattern = /^pub-\d{16}$/;
    return pubIdPattern.test(cleanId);
  };

  const searchPublisher = useCallback(async () => {
    const cleanId = publisherId.trim();

    // Validate format
    if (!validatePublisherId(cleanId)) {
      setError('Invalid Publisher ID format. Must be "pub-" followed by 16 digits (e.g., pub-1234567890123456)');
      setResult(null);
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`/api/sellers/${encodeURIComponent(cleanId)}`);
      const data: ApiResponse<Seller> = await res.json();

      if (data.error || !data.data) {
        setError(data.error || 'Publisher not found. This ID may not exist in our database.');
        setResult(null);
      } else {
        setResult(data.data);
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed. Please try again.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, [publisherId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchPublisher();
  };

  const handleExampleClick = (exampleId: string) => {
    setPublisherId(exampleId);
    setError(null);
  };

  return (
    <div className="space-y-6" id="search">
      {/* Search Form */}
      <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 border border-gray-200">
        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label htmlFor="publisher-id" className="block text-sm font-medium text-gray-700 mb-2">
              Enter Publisher ID
            </label>
            <div className="flex gap-3">
              <input
                id="publisher-id"
                type="text"
                value={publisherId}
                onChange={(e) => setPublisherId(e.target.value)}
                placeholder="pub-1234567890123456"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-mono"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !publisherId.trim()}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium whitespace-nowrap"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Searching...
                  </span>
                ) : (
                  'Look Up'
                )}
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Format: "pub-" followed by 16 digits
            </p>
          </div>
        </form>

        {/* Example Publisher IDs */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-3">
            Try these examples:
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              'pub-2930805104418204',
              'pub-7640562161899788',
              'pub-1556223355139109',
            ].map((exampleId) => (
              <button
                key={exampleId}
                onClick={() => handleExampleClick(exampleId)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-mono transition-colors"
                type="button"
              >
                {exampleId}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div>
            <h4 className="font-medium text-red-900 mb-1">Search Error</h4>
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Success Result */}
      {result && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-green-600">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Publisher Found!</span>
          </div>

          <SellerCard seller={result} />

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => router.push(`/publisher/${result.seller_id}`)}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              View Full Profile
            </button>
            <button
              onClick={() => {
                setPublisherId('');
                setResult(null);
                setError(null);
              }}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Search Another
            </button>
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
          <div>
            <h4 className="font-bold text-blue-900 mb-2">How to Find a Publisher ID</h4>
            <ul className="text-blue-800 space-y-1 text-sm">
              <li>• Check the website's <code className="bg-blue-100 px-1 rounded">ads.txt</code> file at domain.com/ads.txt</li>
              <li>• View page source and search for "pub-" in ad code</li>
              <li>• Look in Google's sellers.json file</li>
              <li>• Check ad server logs for publisher identifiers</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
