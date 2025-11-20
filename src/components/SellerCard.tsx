'use client';

import { memo } from 'react';
import { Seller } from '@/lib/types';

interface Props {
  seller: Seller;
}

function SellerCard({ seller }: Props) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <a
            href={`/sellers/${seller.seller_id}`}
            className="text-lg font-semibold text-blue-600 hover:underline break-all"
          >
            {seller.seller_id}
          </a>
          {seller.name && (
            <p className="text-sm text-gray-600 mt-1">{seller.name}</p>
          )}
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            seller.seller_type === 'PUBLISHER'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-purple-100 text-purple-800'
          }`}
        >
          {seller.seller_type}
        </span>
      </div>

      <div className="space-y-2">
        {seller.domain && (
          <div className="flex items-start">
            <span className="text-sm text-gray-500 min-w-[100px]">Domain:</span>
            <a
              href={`https://${seller.domain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline break-all"
            >
              {seller.domain}
            </a>
          </div>
        )}

        <div className="flex items-center">
          <span className="text-sm text-gray-500 min-w-[100px]">First Seen:</span>
          <span className="text-sm text-gray-900">{formatDate(seller.first_seen_date)}</span>
        </div>

        {seller.is_confidential && (
          <div className="flex items-center">
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
              Confidential
            </span>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-400">
          Last updated: {formatDate(seller.updated_at)}
        </p>
      </div>
    </div>
  );
}

// Memoize component to prevent unnecessary re-renders
export default memo(SellerCard);
