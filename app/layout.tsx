import type { Metadata } from 'next';
import './globals.css';
import { getOrganizationSchema, getWebsiteSchema } from '@/lib/structured-data';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: {
    default: 'Publisher Radar: 1M+ AdSense Publishers Search & Analytics',
    template: '%s | Publisher Radar',
  },
  description: 'Search and analyze over 1 million Google AdSense publishers instantly. Free directory with real-time data from sellers.json. Find publisher domains, track changes, and discover opportunities.',
  keywords: 'adsense publishers, sellers.json, publisher directory, adsense analytics, publisher search, programmatic advertising',
  authors: [{ name: 'Publisher Radar' }],
  creator: 'Publisher Radar',
  metadataBase: new URL('https://publisherradar.com'),
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#2563EB' },
    { media: '(prefers-color-scheme: dark)', color: '#1E40AF' },
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Publisher Radar',
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const organizationSchema = getOrganizationSchema();
  const websiteSchema = getWebsiteSchema();

  return (
    <html lang="en">
      <head>
        {/* Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        {/* Website Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className="antialiased flex flex-col min-h-screen bg-gray-50">
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
