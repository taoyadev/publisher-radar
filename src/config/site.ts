/**
 * Site Configuration
 * Centralized site-wide constants and settings
 */

export const SITE_CONFIG = {
  // Basic Info
  name: process.env.NEXT_PUBLIC_SITE_NAME || 'Publisher Radar',
  shortName: 'Publisher Radar',
  description: 'Search and analyze over 1 million Google AdSense publishers instantly. Free directory with real-time data from sellers.json. Find publisher domains, track changes, and discover opportunities.',

  // URLs
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://publisherradar.com',
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  apiUrl: process.env.NEXT_PUBLIC_API_URL,

  // External URLs
  sellersJsonUrl: process.env.SELLERS_JSON_URL || 'https://storage.googleapis.com/adx-rtb-dictionaries/sellers.json',
  adsenseApiUrl: process.env.ADSENSE_API_URL || 'https://adsense-api.lively-sound-ed65.workers.dev',
  keywordsApiUrl: process.env.KEYWORDS_API_URL || 'https://api.keywordseverywhere.com/v1/get_domain_traffic_metrics',

  // Contact & Social
  email: 'support@publisherradar.com',
  twitter: 'https://twitter.com/publisherradar',
  github: 'https://github.com/publisherradar',

  // Branding
  logo: '/logo.svg',
  favicon: '/favicon.ico',
  ogImage: '/og-home.png',

  // Organization
  organization: {
    name: 'Publisher Radar',
    legalName: 'Publisher Radar LLC',
    foundingDate: '2024',
  },
} as const;

export const SEO_CONFIG = {
  defaultTitle: 'Publisher Radar: 1M+ AdSense Publishers Search & Analytics',
  titleTemplate: '%s | Publisher Radar',
  defaultDescription: SITE_CONFIG.description,
  defaultKeywords: 'adsense publishers, sellers.json, publisher directory, adsense analytics, publisher search, programmatic advertising',

  // Open Graph
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
  },

  // Twitter
  twitter: {
    handle: '@publisherradar',
    site: '@publisherradar',
    cardType: 'summary_large_image',
  },
} as const;
