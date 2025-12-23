import { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/config/site';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = SITE_CONFIG.url;

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',           // Don't crawl API routes
          '/_next/',         // Don't crawl Next.js internals
          '/admin/',         // Admin area if exists
        ],
      },
      {
        userAgent: 'GPTBot',  // OpenAI bot
        disallow: ['/'],      // Optionally block AI crawlers
      },
      {
        userAgent: 'ChatGPT-User',
        disallow: ['/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
