/**
 * Structured Data (JSON-LD) Helpers
 * Generate schema.org markup for SEO
 */

import type { PublisherDetail, PublisherListItem } from './types';
import { SITE_CONFIG } from '@/config/site';

const SITE_URL = SITE_CONFIG.url;
const SITE_NAME = SITE_CONFIG.name;

/**
 * Organization schema for homepage
 */
export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}${SITE_CONFIG.logo}`,
    description: SITE_CONFIG.description,
    sameAs: [
      // Add social media URLs if available
      // 'https://twitter.com/yourhandle',
      // 'https://linkedin.com/company/yourcompany',
    ],
  };
}

/**
 * Website schema
 */
export function getWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_CONFIG.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Breadcrumb list schema
 */
export function getBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };
}

/**
 * Publisher profile schema (Person/Organization)
 */
export function getPublisherSchema(publisher: PublisherDetail) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': publisher.seller_type === 'PUBLISHER' ? 'Organization' : 'Thing',
    identifier: publisher.seller_id,
    name: publisher.name || publisher.seller_id,
    url: `${SITE_URL}/publisher/${publisher.seller_id}`,
    description: `AdSense ${publisher.seller_type} with ${publisher.domain_count} verified domain${publisher.domain_count !== 1 ? 's' : ''}`,
  };

  if (publisher.primary_domain) {
    schema.url = `https://${publisher.primary_domain}`;
  }

  if (publisher.domains.length > 0) {
    schema.hasOfferCatalog = {
      '@type': 'OfferCatalog',
      name: 'Associated Domains',
      itemListElement: publisher.domains.slice(0, 10).map((domain, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'WebSite',
          url: `https://${domain.domain}`,
          name: domain.domain,
        },
      })),
    };
  }

  return schema;
}

/**
 * ItemList schema for publisher lists
 */
export function getPublisherListSchema(
  publishers: PublisherListItem[],
  title: string,
  page?: number
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: title,
    numberOfItems: publishers.length,
    itemListElement: publishers.map((publisher, index) => ({
      '@type': 'ListItem',
      position: page ? (page - 1) * 100 + index + 1 : index + 1,
      item: {
        '@type': 'Organization',
        '@id': `${SITE_URL}/publisher/${publisher.seller_id}`,
        name: publisher.name || publisher.seller_id,
        identifier: publisher.seller_id,
        url: `${SITE_URL}/publisher/${publisher.seller_id}`,
        description: `${publisher.domain_count} domain${publisher.domain_count !== 1 ? 's' : ''}${publisher.max_traffic ? `, ${publisher.max_traffic.toLocaleString()} monthly visitors` : ''}`,
      },
    })),
  };
}

/**
 * FAQ schema
 */
export function getFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * CollectionPage schema (for directories)
 */
export function getCollectionPageSchema(
  title: string,
  description: string,
  totalItems: number
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    description,
    about: {
      '@type': 'Thing',
      name: 'Google AdSense Publishers',
      description: 'Directory of verified AdSense sellers from sellers.json',
    },
    numberOfItems: totalItems,
  };
}

/**
 * Helper to stringify JSON-LD data
 * Use in component:
 * <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: stringifyJSONLD(data) }} />
 */
export function stringifyJSONLD(data: unknown): string {
  return JSON.stringify(data);
}
