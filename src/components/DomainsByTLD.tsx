'use client';

import { useCallback, useEffect, useState } from 'react';

interface DomainData {
  domain: string;
  seller_count: number;
  first_detected: string;
  avg_confidence: number;
}

interface TLDResponse {
  data: DomainData[];
  tld: string;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function DomainsByTLD() {
  const [selectedTLD, setSelectedTLD] = useState('com');
  const [domains, setDomains] = useState<DomainData[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 20;

  const tlds = [
    { value: 'com', label: '.com', color: 'bg-blue-100 text-blue-800' },
    { value: 'net', label: '.net', color: 'bg-green-100 text-green-800' },
    { value: 'org', label: '.org', color: 'bg-purple-100 text-purple-800' },
    { value: 'in', label: '.in', color: 'bg-orange-100 text-orange-800' },
    { value: 'br', label: '.br', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'kr', label: '.kr', color: 'bg-pink-100 text-pink-800' },
    { value: 'jp', label: '.jp', color: 'bg-red-100 text-red-800' },
    { value: 'it', label: '.it', color: 'bg-indigo-100 text-indigo-800' }
  ];

  const fetchDomains = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/domains/by-tld?tld=${selectedTLD}&limit=${limit}&page=${page}`
      );
      const data: TLDResponse = await response.json();
      setDomains(data.data);
      setTotal(data.total);
    } catch (error) {
      console.error('Error fetching domains:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedTLD, page]);

  useEffect(() => {
    fetchDomains();
  }, [fetchDomains]);

  const handleTLDChange = (tld: string) => {
    setSelectedTLD(tld);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Top Domains by TLD</h2>

        {/* TLD Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tlds.map((tld) => (
            <button
              key={tld.value}
              onClick={() => handleTLDChange(tld.value)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                selectedTLD === tld.value
                  ? `${tld.color} ring-2 ring-offset-2 ring-gray-400`
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tld.label}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <p className="text-sm text-gray-600">
            Total <span className="font-bold">.{selectedTLD}</span> domains:
            <span className="font-bold text-gray-900 ml-2">{total.toLocaleString()}</span>
          </p>
        </div>
      </div>

      {/* Domain List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-gray-600">Loading domains...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {domains.map((domain, index) => (
            <div
              key={domain.domain}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-semibold text-gray-400">
                      #{(page - 1) * limit + index + 1}
                    </span>
                    <a
                      href={`https://${domain.domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {domain.domain}
                    </a>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="font-semibold">{domain.seller_count}</span> sellers
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {(domain.avg_confidence * 100).toFixed(0)}% confidence
                    </span>
                    <span className="text-gray-400">
                      First seen: {new Date(domain.first_detected).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && domains.length > 0 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-gray-600">
            Page {page} of {Math.ceil(total / limit)}
          </span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page >= Math.ceil(total / limit)}
            className="px-4 py-2 bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
