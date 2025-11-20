'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navigation = [
    { name: 'Home', href: '/', icon: '🏠' },
    { name: 'Browse Publishers', href: '/publishers', icon: '👥' },
    { name: 'Browse by TLD', href: '/tld/com', icon: '🌐' },
    { name: 'Discover', href: '/discover', icon: '✨' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-700 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <svg
                className="w-8 h-8"
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="headerBlueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#2563EB', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#1E40AF', stopOpacity: 1 }} />
                  </linearGradient>
                </defs>

                {/* Main blue gradient circle background */}
                <circle cx="32" cy="32" r="30" fill="url(#headerBlueGradient)" />

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
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                Publisher Radar
              </h1>
              <p className="text-xs text-gray-500">1M+ AdSense Publishers</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive(item.href)
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                aria-current={isActive(item.href) ? 'page' : undefined}
              >
                <span className="mr-2" aria-hidden="true">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Quick Search (Desktop) */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={() => {
                if (pathname !== '/') {
                  window.location.href = '/#search';
                } else {
                  document.getElementById('search')?.focus();
                }
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 hover:border-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Search publishers"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <span>Quick search...</span>
              <kbd className="hidden xl:inline-block px-2 py-0.5 text-xs font-semibold text-gray-800 bg-gray-200 border border-gray-300 rounded">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 animate-fade-in">
            <nav className="flex flex-col gap-2" aria-label="Mobile navigation">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive(item.href)
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                >
                  <span className="mr-2" aria-hidden="true">{item.icon}</span>
                  {item.name}
                </Link>
              ))}

              {/* Mobile Search Button */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (pathname !== '/') {
                    window.location.href = '/#search';
                  } else {
                    document.getElementById('search')?.focus();
                  }
                }}
                className="px-4 py-3 text-left rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all"
              >
                <span className="mr-2" aria-hidden="true">🔍</span>
                Search
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
