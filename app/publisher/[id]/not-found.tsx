/* eslint-disable react/no-unescaped-entities */
import Link from 'next/link';

export default function PublisherNotFound() {
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
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Publisher Not Found
          </h1>

          <p className="text-gray-600 mb-8">
            The AdSense publisher you're looking for doesn't exist in our database or may have been removed.
          </p>

          <div className="space-y-3">
            <Link
              href="/"
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Search Publishers
            </Link>

            <Link
              href="/publishers"
              className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Browse All Publishers
            </Link>
          </div>

          <p className="text-sm text-gray-500 mt-6">
            Need help? <Link href="/" className="text-blue-600 hover:underline">Contact us</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
