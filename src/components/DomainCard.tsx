'use client';

import { memo } from 'react';
import { SellerDomain } from '@/lib/types';

interface Props {
  domain: SellerDomain;
}

function DomainCard({ domain }: Props) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTraffic = (traffic: number | undefined | null): string | null => {
    if (!traffic || traffic === 0) return null;

    if (traffic >= 1_000_000) {
      return `${(traffic / 1_000_000).toFixed(1)}M`;
    } else if (traffic >= 1_000) {
      return `${(traffic / 1_000).toFixed(1)}K`;
    }
    return traffic.toString();
  };

  const getTrafficColor = (traffic: number | undefined | null): string => {
    if (!traffic || traffic === 0) return 'bg-gray-100 text-gray-600';
    if (traffic >= 1_000_000) return 'bg-green-100 text-green-800';
    if (traffic >= 10_000) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-700';
  };

  const traffic = domain.search_traffic_monthly || domain.total_traffic_monthly;
  const formattedTraffic = formatTraffic(traffic);
  const trafficColor = getTrafficColor(traffic);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 min-w-0">
          <a
            href={`https://${domain.domain}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg font-semibold text-blue-600 hover:underline break-all"
          >
            {domain.domain}
          </a>
        </div>
        {formattedTraffic && (
          <div className="ml-3 flex-shrink-0">
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${trafficColor}`}
              title={`${traffic?.toLocaleString()} monthly ${domain.search_traffic_monthly ? 'search visits' : 'visits'}`}
            >
              {formattedTraffic}
              <span className="text-xs opacity-75">🔍</span>
            </span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center">
          <span className="text-sm text-gray-500 min-w-[120px]">Confidence:</span>
          <div className="flex items-center gap-2 flex-1">
            <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[150px]">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${domain.confidence_score * 100}%` }}
              />
            </div>
            <span className="text-sm text-gray-900 font-medium">
              {Math.round(domain.confidence_score * 100)}%
            </span>
          </div>
        </div>

        <div className="flex items-center">
          <span className="text-sm text-gray-500 min-w-[120px]">First Detected:</span>
          <span className="text-sm text-gray-900">{formatDate(domain.first_detected)}</span>
        </div>

        <div className="flex items-center">
          <span className="text-sm text-gray-500 min-w-[120px]">Source:</span>
          <span
            className={`text-xs px-2 py-1 rounded ${
              domain.detection_source === 'sellers_json'
                ? 'bg-purple-100 text-purple-700'
                : domain.detection_source === 'google_cse'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {domain.detection_source}
          </span>
        </div>

        {domain.traffic_data_source && (
          <div className="flex items-center">
            <span className="text-sm text-gray-500 min-w-[120px]">Traffic Source:</span>
            <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700">
              {domain.traffic_data_source === 'keywords-everywhere'
                ? 'Keywords Everywhere'
                : domain.traffic_data_source}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(DomainCard);
