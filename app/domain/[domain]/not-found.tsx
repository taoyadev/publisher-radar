'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function DomainNotFound() {
  const params = useParams();
  const domain = params?.domain as string || '';
  const decodedDomain = decodeURIComponent(domain);

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Domain Not Found
          </h1>

          {decodedDomain && (
            <p className="text-lg font-medium text-gray-700 mb-2 break-all">
              {decodedDomain}
            </p>
          )}

          <p className="text-gray-600 mb-6">
            This domain is not associated with any AdSense publishers in our database.
          </p>

          {decodedDomain && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900 mb-3">
                Want to check if this domain exists on the web?
              </p>
              <a
                href={`https://${decodedDomain}`}
                target="_blank"
                rel="nofollow noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Visit {decodedDomain}
              </a>
            </div>
          )}

          <div className="space-y-3">
            <Link
              href="/"
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Search Domains
            </Link>

            <Link
              href="/publishers"
              className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Browse Publishers
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
