/* eslint-disable react/no-unescaped-entities */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PublisherSearchBox() {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Navigate to search results filtered by name
      router.push(`/publishers/search?name=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
      <h3 className="text-lg font-semibold text-blue-900 mb-3">
        🔍 Search Publishers by Name
      </h3>
      <p className="text-sm text-blue-700 mb-4">
        Looking for a specific publisher? Search by company name (e.g., "Google", "WordPress", "Medium").
        To search by Publisher ID, use the <Link href="/" className="underline hover:text-blue-900">homepage search</Link>.
      </p>
      <form onSubmit={handleSearch} className="flex gap-3">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Enter publisher name..."
          className="flex-1 px-4 py-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          aria-label="Search publishers by name"
        />
        <button
          type="submit"
          disabled={!searchTerm.trim()}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Search
        </button>
      </form>
    </div>
  );
}
