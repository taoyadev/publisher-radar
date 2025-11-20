import { MetadataRoute } from 'next';
import {
  fetchTopPublisherIds,
  fetchTopDomains,
  fetchAllTlds,
} from '@/lib/ssg-queries';

/**
 * Generate sitemap for top URLs
 * For 1M+ pages, we'll generate sitemap index (multiple sitemaps)
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://publisherradar.com';

  const now = new Date();

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 1,
    },
    {
      url: `${baseUrl}/publishers`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  try {
    // Fetch top publishers (10K for main sitemap)
    console.log('[Sitemap] Fetching top publisher IDs...');
    const topPublisherIds = await fetchTopPublisherIds(10000);

    const publisherUrls: MetadataRoute.Sitemap = topPublisherIds.map((id) => ({
      url: `${baseUrl}/publisher/${id}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    console.log(`[Sitemap] Generated ${publisherUrls.length} publisher URLs`);

    // Fetch top domains (5K)
    console.log('[Sitemap] Fetching top domains...');
    const topDomains = await fetchTopDomains(5000);

    const domainUrls: MetadataRoute.Sitemap = topDomains.map((domain) => ({
      url: `${baseUrl}/domain/${encodeURIComponent(domain)}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    console.log(`[Sitemap] Generated ${domainUrls.length} domain URLs`);

    // Fetch all TLDs
    console.log('[Sitemap] Fetching TLDs...');
    const tlds = await fetchAllTlds();

    const tldUrls: MetadataRoute.Sitemap = tlds.map((tld) => ({
      url: `${baseUrl}/tld/${tld}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.6,
    }));

    // Add first page of each TLD
    const tldPageUrls: MetadataRoute.Sitemap = tlds.map((tld) => ({
      url: `${baseUrl}/tld/${tld}/page/1`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.5,
    }));

    console.log(`[Sitemap] Generated ${tldUrls.length} TLD URLs`);

    // Combine all URLs (max 50K per sitemap)
    const allUrls = [
      ...staticRoutes,
      ...publisherUrls,
      ...domainUrls,
      ...tldUrls,
      ...tldPageUrls,
    ];

    console.log(`[Sitemap] Total URLs in main sitemap: ${allUrls.length}`);

    // If more than 50K URLs, we should split into multiple sitemaps
    // For now, returning top 50K
    return allUrls.slice(0, 50000);
  } catch (error) {
    console.error('[Sitemap] Error generating sitemap:', error);
    // Return at least static routes on error
    return staticRoutes;
  }
}
