import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://publisherradar.com';

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
