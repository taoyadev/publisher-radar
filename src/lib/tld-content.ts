/**
 * TLD Content Data and Utilities
 * Provides TLD-specific content, FAQs, and metadata for SEO optimization
 */

export interface TldInfo {
  category: 'generic' | 'country' | 'new' | 'sponsored' | 'infrastructure';
  fullName: string;
  description: string;
  commonUses: string[];
  trustLevel: 'high' | 'medium' | 'low';
  registrationRestrictions?: string;
  launchYear?: number;
}

/**
 * TLD Database with comprehensive information
 */
export const TLD_DATABASE: Record<string, TldInfo> = {
  // Generic TLDs
  com: {
    category: 'generic',
    fullName: 'Commercial',
    description: 'The most popular top-level domain, originally intended for commercial entities but now used universally.',
    commonUses: ['E-commerce', 'Business websites', 'Corporate blogs', 'Brand sites'],
    trustLevel: 'high',
    launchYear: 1985,
  },
  net: {
    category: 'generic',
    fullName: 'Network',
    description: 'Originally designed for network infrastructure, now used by various types of websites.',
    commonUses: ['Technology companies', 'ISPs', 'Networking services', 'Web services'],
    trustLevel: 'high',
    launchYear: 1985,
  },
  org: {
    category: 'generic',
    fullName: 'Organization',
    description: 'Intended for non-profit organizations, communities, and open-source projects.',
    commonUses: ['Non-profits', 'Open source projects', 'Community sites', 'Advocacy groups'],
    trustLevel: 'high',
    launchYear: 1985,
  },
  info: {
    category: 'generic',
    fullName: 'Information',
    description: 'Designed for informational websites, knowledge bases, and resource centers.',
    commonUses: ['Information portals', 'Knowledge bases', 'Educational content', 'Resource sites'],
    trustLevel: 'medium',
    launchYear: 2001,
  },
  biz: {
    category: 'generic',
    fullName: 'Business',
    description: 'Alternative to .com, specifically for business use.',
    commonUses: ['Small businesses', 'Startups', 'Professional services', 'B2B companies'],
    trustLevel: 'medium',
    launchYear: 2001,
  },

  // Country Code TLDs (Popular ones)
  uk: {
    category: 'country',
    fullName: 'United Kingdom',
    description: 'Country code for the United Kingdom, trusted for UK-based businesses.',
    commonUses: ['UK businesses', 'British publications', 'Local services', 'UK government'],
    trustLevel: 'high',
  },
  de: {
    category: 'country',
    fullName: 'Germany (Deutschland)',
    description: 'Germany\'s country code TLD, popular among German and European businesses.',
    commonUses: ['German businesses', 'European companies', 'German media', 'Local shops'],
    trustLevel: 'high',
  },
  jp: {
    category: 'country',
    fullName: 'Japan',
    description: 'Japan\'s country code TLD, indicating Japanese origin or target audience.',
    commonUses: ['Japanese businesses', 'Anime/manga sites', 'Japanese media', 'Asian market'],
    trustLevel: 'high',
  },
  ca: {
    category: 'country',
    fullName: 'Canada',
    description: 'Canadian country code TLD, requires Canadian presence for registration.',
    commonUses: ['Canadian businesses', 'Government services', 'Local organizations', 'Canadian media'],
    trustLevel: 'high',
    registrationRestrictions: 'Requires Canadian presence',
  },
  au: {
    category: 'country',
    fullName: 'Australia',
    description: 'Australian country code TLD, trusted for Australian content and businesses.',
    commonUses: ['Australian businesses', 'Government sites', 'Local services', 'Australian media'],
    trustLevel: 'high',
    registrationRestrictions: 'Requires Australian business number or trademark',
  },

  // New gTLDs
  blog: {
    category: 'new',
    fullName: 'Blog',
    description: 'Dedicated TLD for blogs and content creators, clearly signals blog content.',
    commonUses: ['Personal blogs', 'Corporate blogs', 'News sites', 'Content marketing'],
    trustLevel: 'medium',
    launchYear: 2016,
  },
  app: {
    category: 'new',
    fullName: 'Application',
    description: 'For web applications and app developers, requires HTTPS for all websites.',
    commonUses: ['Web apps', 'Mobile apps', 'SaaS products', 'Development tools'],
    trustLevel: 'medium',
    launchYear: 2018,
    registrationRestrictions: 'HTTPS required',
  },
  dev: {
    category: 'new',
    fullName: 'Developer',
    description: 'For developers and development projects, requires HTTPS.',
    commonUses: ['Developer portfolios', 'Tech projects', 'API documentation', 'Open source'],
    trustLevel: 'medium',
    launchYear: 2019,
    registrationRestrictions: 'HTTPS required',
  },
  io: {
    category: 'new',
    fullName: 'Input/Output (British Indian Ocean Territory)',
    description: 'Technically a ccTLD but widely used by tech startups and SaaS companies.',
    commonUses: ['Tech startups', 'SaaS products', 'Developer tools', 'API services'],
    trustLevel: 'medium',
  },
  ai: {
    category: 'new',
    fullName: 'Artificial Intelligence (Anguilla)',
    description: 'Technically Anguilla\'s ccTLD but popular with AI and tech companies.',
    commonUses: ['AI companies', 'Machine learning', 'Tech startups', 'Research labs'],
    trustLevel: 'medium',
  },
  tech: {
    category: 'new',
    fullName: 'Technology',
    description: 'For technology-focused businesses and content.',
    commonUses: ['Tech companies', 'Tech news', 'Gadget reviews', 'IT services'],
    trustLevel: 'medium',
    launchYear: 2015,
  },
  online: {
    category: 'new',
    fullName: 'Online',
    description: 'Generic new TLD for online businesses and services.',
    commonUses: ['E-commerce', 'Online services', 'Digital businesses', 'Web platforms'],
    trustLevel: 'medium',
    launchYear: 2015,
  },
  store: {
    category: 'new',
    fullName: 'Store',
    description: 'Designed specifically for e-commerce and online stores.',
    commonUses: ['E-commerce', 'Online shops', 'Retail', 'Brand stores'],
    trustLevel: 'medium',
    launchYear: 2016,
  },
  site: {
    category: 'new',
    fullName: 'Site',
    description: 'Generic TLD suitable for any type of website.',
    commonUses: ['General websites', 'Personal sites', 'Business sites', 'Portfolios'],
    trustLevel: 'medium',
    launchYear: 2015,
  },
  xyz: {
    category: 'new',
    fullName: 'XYZ',
    description: 'One of the largest new gTLDs, used for various purposes.',
    commonUses: ['General websites', 'Startups', 'Creative projects', 'Personal sites'],
    trustLevel: 'low',
    launchYear: 2014,
  },

  // Sponsored TLDs
  edu: {
    category: 'sponsored',
    fullName: 'Education',
    description: 'Restricted to accredited educational institutions.',
    commonUses: ['Universities', 'Colleges', 'Schools', 'Research institutions'],
    trustLevel: 'high',
    registrationRestrictions: 'Accredited educational institutions only',
    launchYear: 1985,
  },
  gov: {
    category: 'sponsored',
    fullName: 'Government',
    description: 'Restricted to U.S. government entities.',
    commonUses: ['Federal agencies', 'State government', 'Local government', 'Public services'],
    trustLevel: 'high',
    registrationRestrictions: 'U.S. government entities only',
    launchYear: 1985,
  },
  mil: {
    category: 'sponsored',
    fullName: 'Military',
    description: 'Restricted to U.S. military.',
    commonUses: ['U.S. armed forces', 'Defense department', 'Military bases'],
    trustLevel: 'high',
    registrationRestrictions: 'U.S. military only',
    launchYear: 1985,
  },
};

/**
 * Get enhanced metadata keywords for a TLD
 */
export function getTldKeywords(tld: string): string[] {
  const info = TLD_DATABASE[tld] || null;
  const baseKeywords = [
    `.${tld} domains`,
    `${tld} TLD`,
    `${tld} AdSense publishers`,
    `Google AdSense ${tld}`,
    `${tld} domain directory`,
    `${tld} publisher verification`,
    `${tld} traffic data`,
    `${tld} domain count`,
    `top ${tld} publishers`,
    `${tld} domain list`,
  ];

  if (!info) return baseKeywords;

  const categoryKeywords: string[] = [];

  switch (info.category) {
    case 'generic':
      categoryKeywords.push('generic TLD', `${info.fullName} domains`, 'gTLD directory');
      break;
    case 'country':
      categoryKeywords.push('country code TLD', 'ccTLD', `${info.fullName} domains`, 'geographic domains');
      break;
    case 'new':
      categoryKeywords.push('new gTLD', 'new domains', `${info.fullName} websites`);
      break;
    case 'sponsored':
      categoryKeywords.push('sponsored TLD', 'sTLD', `${info.fullName} institutions`);
      break;
  }

  return [...baseKeywords, ...categoryKeywords];
}

/**
 * Generate TLD-specific FAQ content
 */
export function getTldFAQs(tld: string, stats: { domain_count: number; seller_count: number }): Array<{ question: string; answer: string }> {
  const info = TLD_DATABASE[tld];
  const tldDot = `.${tld}`;

  const baseFAQs: Array<{ question: string; answer: string }> = [
    {
      question: `What is a ${tldDot} domain?`,
      answer: info
        ? `${tldDot} is a ${info.fullName} ${info.category} top-level domain${info.launchYear ? ` launched in ${info.launchYear}` : ''}. ${info.description} It's commonly used for ${info.commonUses.join(', ').toLowerCase()}.`
        : `${tldDot} is a top-level domain used by websites across various industries. Our database tracks ${stats.domain_count.toLocaleString()} unique domains using this TLD.`,
    },
    {
      question: `How many AdSense publishers use ${tldDot} domains?`,
      answer: `According to our real-time data from Google's sellers.json, there are currently ${stats.seller_count.toLocaleString()} verified AdSense publishers using ${tldDot} domains, representing ${stats.domain_count.toLocaleString()} unique domains. This data is updated daily to ensure accuracy.`,
    },
    {
      question: `Are ${tldDot} domains trustworthy for publishers?`,
      answer: info && info.trustLevel
        ? `${tldDot} domains have a ${info.trustLevel} trust level. ${
            info.trustLevel === 'high'
              ? `They are well-established and widely recognized, making them excellent choices for publishers. ${info.registrationRestrictions ? `Registration restrictions (${info.registrationRestrictions}) add an extra layer of authenticity.` : ''}`
              : info.trustLevel === 'medium'
              ? `They are generally reliable, though less established than traditional TLDs like .com. Publishers should verify domain ownership and history.`
              : `Publishers should exercise extra caution with ${tldDot} domains and verify publisher credentials thoroughly, as this TLD has lower inherent trust signals.`
          }`
        : `All domains in our directory are verified through Google's sellers.json, regardless of TLD. We recommend checking individual publisher verification status and confidence scores.`,
    },
    {
      question: `What types of publishers typically use ${tldDot}?`,
      answer: info && info.commonUses.length > 0
        ? `${tldDot} domains are particularly popular among ${info.commonUses.join(', ')} publishers. ${
            info.category === 'country'
              ? `As a country code TLD, it's primarily used by publishers targeting ${info.fullName} audiences or based in that region.`
              : info.category === 'new'
              ? `As a newer TLD, it attracts modern, digitally-native publishers and businesses.`
              : info.category === 'sponsored'
              ? `Due to registration restrictions, it's exclusively used by ${info.fullName.toLowerCase()} entities.`
              : `It's widely used across various publisher categories.`
          }`
        : `${tldDot} domains are used by publishers across various content categories. Browse our directory to see the full range of publishers using this TLD.`,
    },
    {
      question: `Can I find high-traffic publishers with ${tldDot} domains?`,
      answer: `Yes! Our directory includes traffic data for many ${tldDot} publishers. You can sort by traffic to find high-performing publishers. Traffic data comes from third-party sources and is regularly updated. Look for publishers with verified traffic badges for the most reliable data.`,
    },
  ];

  // Add TLD-specific FAQs based on category
  if (info) {
    if (info.category === 'country') {
      baseFAQs.push({
        question: `Do I need to be in ${info.fullName} to register a ${tldDot} domain?`,
        answer: info.registrationRestrictions
          ? `Yes, ${tldDot} has registration restrictions: ${info.registrationRestrictions}. This ensures that ${tldDot} domains authentically represent ${info.fullName}-based entities.`
          : `Registration requirements vary by registrar. Check with your domain registrar for specific ${tldDot} registration policies.`,
      });
    }

    if (info.category === 'new' && info.registrationRestrictions?.includes('HTTPS')) {
      baseFAQs.push({
        question: `Why do ${tldDot} sites require HTTPS?`,
        answer: `${tldDot} is an HSTS-preloaded TLD, meaning HTTPS is mandatory for all ${tldDot} websites. This ensures enhanced security for visitors and publishers, making it particularly suitable for applications and services handling sensitive data.`,
      });
    }

    if (info.category === 'sponsored') {
      baseFAQs.push({
        question: `How can I verify a ${tldDot} publisher is legitimate?`,
        answer: `All ${tldDot} domains are restricted to ${info.registrationRestrictions?.toLowerCase() || 'authorized entities'}, providing built-in authenticity. Additionally, our platform verifies all publishers through Google's sellers.json. Check the confidence score and verification badges for extra assurance.`,
      });
    }
  }

  return baseFAQs.slice(0, 8); // Return max 8 FAQs
}

/**
 * Get enhanced description for TLD
 */
export function getTldDescription(tld: string, stats: { domain_count: number; seller_count: number; avg_traffic?: number | null }): string {
  const info = TLD_DATABASE[tld];

  const baseDesc = `Comprehensive directory of ${stats.seller_count.toLocaleString()} verified Google AdSense publishers using ${stats.domain_count.toLocaleString()} unique .${tld} domains.`;

  if (!info) {
    return `${baseDesc} Browse publisher traffic data, domain counts, and verification status. Updated daily from Google's sellers.json.`;
  }

  const categoryDesc = info.category === 'country'
    ? `As a ${info.fullName} country code TLD, these publishers primarily target ${info.fullName} audiences.`
    : info.category === 'new'
    ? `This modern TLD attracts ${info.commonUses[0].toLowerCase()} and digital-native publishers.`
    : info.category === 'sponsored'
    ? `This restricted TLD is reserved for ${info.fullName.toLowerCase()} entities, ensuring high trust levels.`
    : `This established generic TLD is widely used for ${info.commonUses[0].toLowerCase()}.`;

  const trafficDesc = stats.avg_traffic && stats.avg_traffic > 0
    ? ` Average traffic: ${stats.avg_traffic.toLocaleString()} monthly visits.`
    : '';

  return `${baseDesc} ${categoryDesc}${trafficDesc} Discover publishers by traffic, domain count, and verification status.`;
}

/**
 * Get TLD category emoji
 */
export function getTldEmoji(tld: string): string {
  const info = TLD_DATABASE[tld];
  if (!info) return '🌐';

  switch (info.category) {
    case 'generic':
      return '🌐';
    case 'country':
      return '🌍';
    case 'new':
      return '✨';
    case 'sponsored':
      return '🏛️';
    default:
      return '🌐';
  }
}

/**
 * Get related TLDs based on category and characteristics
 */
export function getRelatedTlds(tld: string, allTlds: string[]): string[] {
  const info = TLD_DATABASE[tld];
  if (!info) return allTlds.slice(0, 6);

  // Filter TLDs by same category
  const sameCategoryTlds = allTlds.filter(t => {
    const tInfo = TLD_DATABASE[t];
    return tInfo && tInfo.category === info.category && t !== tld;
  });

  // If we don't have enough, add popular generic TLDs
  const popularTlds = ['com', 'net', 'org', 'info', 'blog', 'online'];
  const fallbackTlds = popularTlds.filter(t => t !== tld && !sameCategoryTlds.includes(t));

  return [...sameCategoryTlds, ...fallbackTlds].slice(0, 6);
}

/**
 * Get TLD info for a specific TLD
 */
export function getTldInfo(tld: string): TldInfo | null {
  return TLD_DATABASE[tld] || null;
}
