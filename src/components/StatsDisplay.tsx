'use client';

import { useEffect, useState, memo } from 'react';
import { ApiResponse } from '@/lib/types';

interface Stats {
  total_sellers: number;
  publishers: number;
  both_type: number;
  with_domains: number;
  unique_domains: number;
  last_updated: string;
}

function StatsDisplay() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/stats');
        const data: ApiResponse<Stats> = await res.json();

        if (data.error) {
          setError(data.error);
        } else {
          setStats(data.data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load stats');
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
        <p className="text-red-800">Error loading stats: {error}</p>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Sellers', value: stats.total_sellers.toLocaleString(), color: 'blue' },
    { label: 'Publishers', value: stats.publishers.toLocaleString(), color: 'green' },
    { label: 'With Domains', value: stats.with_domains.toLocaleString(), color: 'purple' },
    { label: 'Unique Domains', value: stats.unique_domains.toLocaleString(), color: 'orange' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat) => (
        <div key={stat.label} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <p className="text-sm text-gray-600 mb-2">{stat.label}</p>
          <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}

// Memoize stats display (rarely changes)
export default memo(StatsDisplay);
