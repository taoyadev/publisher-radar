'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface FooterStats {
  total_sellers: number;
  unique_domains: number;
  last_updated: string;
}

export default function Footer() {
  const [stats, setStats] = useState<FooterStats | null>(null);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        if (data.data) {
          setStats(data.data);
        }
      })
      .catch(() => {
        // Silently fail - footer will work without stats
      });
  }, []);

  const footerLinks = {
    product: [
      { name: 'Browse Publishers', href: '/publishers' },
      { name: 'Browse by TLD', href: '/tld' },
      { name: 'Discover', href: '/discover' },
      { name: 'Search', href: '/' },
    ],
    about: [
      { name: 'Google sellers.json', href: 'https://storage.googleapis.com/adx-rtb-dictionaries/sellers.json', external: true },
      { name: 'About AdSense', href: 'https://adsense.google.com', external: true },
      { name: 'Ads.txt Checker', href: 'https://www.publisherlens.com/domain/ads-txt-checker', external: true },
      { name: 'Data Updated Daily', href: '/' },
    ],
  };

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      {/* Stats Banner */}
      {stats && (
        <div className="border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                    {stats.total_sellers?.toLocaleString() || 'N/A'}
                  </div>
                  <div className="text-xs md:text-sm text-gray-400">Total Publishers</div>
                </div>
                <div>
                  <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                    {stats.unique_domains?.toLocaleString() || 'N/A'}
                  </div>
                  <div className="text-xs md:text-sm text-gray-400">Verified Domains</div>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <div className="text-lg md:text-xl font-bold text-green-400 mb-1">
                    Daily Updates
                  </div>
                  <div className="text-xs md:text-sm text-gray-400">
                    {stats.last_updated
                      ? `Last: ${new Date(stats.last_updated).toLocaleDateString()}`
                      : 'Updated Daily'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 gap-8 md:gap-16 mb-12 max-w-2xl">
          {/* Navigation */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Navigation</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors inline-flex items-center gap-1"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">About</h3>
            <ul className="space-y-3">
              {footerLinks.about.map((link) => (
                <li key={link.name}>
                  {link.external ? (
                    <a
                      href={link.href}
                      className="text-sm hover:text-white transition-colors inline-flex items-center gap-1"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {link.name}
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                        <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                      </svg>
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-sm hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Logo & Description */}
        <div className="border-t border-gray-800 pt-8 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-700 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <svg
                  className="w-8 h-8"
                  viewBox="0 0 64 64"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#2563EB', stopOpacity: 1 }} />
                      <stop offset="100%" style={{ stopColor: '#1E40AF', stopOpacity: 1 }} />
                    </linearGradient>
                  </defs>

                  {/* Main blue gradient circle background */}
                  <circle cx="32" cy="32" r="30" fill="url(#blueGradient)" />

                  {/* Radar circles - more visible */}
                  <circle cx="32" cy="32" r="25" stroke="white" strokeWidth="1.5" opacity="0.25" fill="none" />
                  <circle cx="32" cy="32" r="20" stroke="white" strokeWidth="1.5" opacity="0.3" fill="none" />
                  <circle cx="32" cy="32" r="15" stroke="white" strokeWidth="1.5" opacity="0.35" fill="none" />

                  {/* Letter P - Cleaner and bolder */}
                  <path
                    d="M 20 14 L 20 50 L 28 50 L 28 35 L 38 35 C 44 35 48 31 48 24.5 C 48 18 44 14 38 14 Z M 28 20.5 L 38 20.5 C 41 20.5 42.5 22 42.5 24.5 C 42.5 27 41 28.5 38 28.5 L 28 28.5 Z"
                    fill="white"
                  />

                  {/* Letter R - Red accent for "PR" in bottom-right */}
                  <path
                    d="M 42 42 L 42 56 L 46 56 L 46 50.5 L 50 50.5 L 54 56 L 58 56 L 53.5 50 C 55.5 49.5 57 48 57 45.5 C 57 42.5 55 42 52 42 Z M 46 45.5 L 52 45.5 C 53 45.5 53.5 46 53.5 46.5 C 53.5 47 53 47.5 52 47.5 L 46 47.5 Z"
                    fill="#FF5555"
                    className="animate-pulse"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-white font-bold text-lg group-hover:text-blue-400 transition-colors">
                  Publisher Radar
                </h2>
                <p className="text-sm text-gray-400">AdSense Publisher Directory</p>
              </div>
            </Link>
            <p className="text-sm text-gray-400 max-w-2xl text-center md:text-left">
              The most comprehensive Google AdSense sellers.json explorer. Search, analyze,
              and track over 1 million verified publishers with real-time updates and traffic data.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <p className="text-gray-400 text-center sm:text-left">
            © {currentYear} Publisher Radar. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-gray-400">
            <span className="hidden sm:inline">Built with Next.js & PostgreSQL</span>
            <span className="hidden sm:inline" aria-hidden="true">•</span>
            <span>Data from Google sellers.json</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
