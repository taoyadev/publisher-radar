// Seller from sellers.json file (external format)
export interface SellersJsonSeller {
  seller_id: string;
  seller_type: 'PUBLISHER' | 'BOTH';
  is_confidential?: boolean;
  domain?: string;
  name?: string;
}

export interface SellersJsonFile {
  sellers: SellersJsonSeller[];
}

// Seller in database (internal format with timestamps)
export interface Seller {
  seller_id: string;
  first_seen_date: string;
  seller_type: 'PUBLISHER' | 'BOTH';
  is_confidential: boolean;
  name: string | null;
  domain: string | null;
  created_at: string;
  updated_at: string;
}

export interface SellerDomain {
  id: number;
  seller_id: string;
  domain: string;
  first_detected: string;
  detection_source: 'sellers_json' | 'google_cse' | 'bing' | 'manual';
  confidence_score: number;
  created_at: string;
  search_traffic_monthly?: number;
  total_traffic_monthly?: number;
  traffic_data_source?: string;
}

export interface DailySnapshot {
  id: number;
  snapshot_date: string;
  total_count: number;
  new_count: number;
  removed_count: number;
  created_at: string;
}

export interface SearchParams {
  query?: string;
  seller_type?: 'PUBLISHER' | 'BOTH';
  has_domain?: boolean;
  page?: number;
  limit?: number;
  sort_by?: 'seller_id' | 'first_seen_date' | 'updated_at';
  sort_order?: 'asc' | 'desc';
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  total?: number;
  page?: number;
  limit?: number;
  summary?: {
    total_new?: number;
    total_removed?: number;
    avg_new_per_day?: number;
    avg_removed_per_day?: number;
  };
}

export interface TopPublisher {
  rank: number;
  domain: string;
  seller_id: string;
  name: string | null;
  search_traffic_monthly: number;
  first_seen_date: string;
  seller_type: 'PUBLISHER' | 'BOTH';
  traffic_data_source: string;
}

// ============================================================================
// SSG/ISR Types (Added for pSEO transformation)
// ============================================================================

/**
 * Enhanced publisher data from materialized view (for list pages)
 */
export interface PublisherListItem {
  seller_id: string;
  name: string | null;
  seller_type: 'PUBLISHER' | 'BOTH';
  primary_domain: string | null;
  first_seen_date: string;
  created_at: string;
  updated_at: string;
  domain_count: number;
  unique_domain_count: number;
  max_traffic: number | null;
  total_traffic: number | null;
  avg_traffic: number | null;
  max_confidence: number | null;
  verified_domains_count: number;
  adsense_api_checked: boolean | null;
  adsense_api_status: string | null;
  adsense_api_domain_count: number | null;
}

/**
 * Full publisher details (for publisher detail page)
 */
export interface PublisherDetail {
  seller_id: string;
  name: string | null;
  seller_type: 'PUBLISHER' | 'BOTH';
  is_confidential: boolean;
  primary_domain: string | null;
  first_seen_date: string;
  created_at: string;
  updated_at: string;

  // Aggregated stats
  domain_count: number;
  unique_domain_count: number;
  max_traffic: number | null;
  total_traffic: number | null;

  // AdSense API info
  adsense_api_checked: boolean | null;
  adsense_api_status: string | null;
  adsense_api_domain_count: number | null;

  // Associated domains (with traffic data)
  domains: PublisherDomainDetail[];

  // Related publishers (similar domains)
  related_publishers?: PublisherListItem[];
}

/**
 * Domain details for publisher detail page
 */
export interface PublisherDomainDetail {
  domain: string;
  confidence_score: number;
  detection_source: string;
  first_detected: string;
  search_traffic_monthly: number | null;
  total_traffic_monthly: number | null;
}

/**
 * Domain aggregation data (from materialized view)
 */
export interface DomainAggregation {
  domain: string;
  seller_count: number;
  seller_ids: string[];
  max_traffic: number | null;
  total_traffic: number | null;
  max_confidence: number | null;
  detection_sources: string[];
  first_seen: string;
  last_updated: string;
}

/**
 * TLD aggregation data (from materialized view)
 */
export interface TldAggregation {
  tld: string;
  domain_count: number;
  seller_count: number;
  total_traffic: number | null;
  avg_traffic: number | null;
}

/**
 * Stats for homepage
 */
export interface HomePageStats {
  total_publishers: number;
  total_domains: number;
  total_verified_domains: number;
  publishers_with_traffic: number;
  total_traffic: number;
  avg_domains_per_publisher: number;
  recent_growth: {
    new_last_7_days: number;
    new_last_30_days: number;
  };
}
