-- Create SimilarWeb analytics table
-- This table stores comprehensive SimilarWeb data for domains

CREATE TABLE IF NOT EXISTS seller_adsense.similarweb_analytics (
  id BIGSERIAL PRIMARY KEY,

  -- Foreign key to seller_domains
  seller_domain_id BIGINT NOT NULL REFERENCES seller_adsense.seller_domains(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,

  -- Core metrics
  global_rank INTEGER,
  monthly_visits BIGINT,
  bounce_rate FLOAT,
  pages_per_visit FLOAT,
  avg_visit_duration INTEGER, -- in seconds

  -- Traffic sources (percentages, sum to 1.0)
  traffic_direct FLOAT,
  traffic_search FLOAT,
  traffic_social FLOAT,
  traffic_referrals FLOAT,
  traffic_mail FLOAT,
  traffic_paid_referrals FLOAT,

  -- Top country
  top_country_code TEXT,
  top_country_share FLOAT,

  -- Category
  category TEXT,
  category_rank INTEGER,

  -- Data source metadata
  data_source TEXT NOT NULL CHECK (data_source IN ('vercel', 'proxy')),
  fetch_status TEXT NOT NULL CHECK (fetch_status IN ('success', 'error', 'partial')),
  error_message TEXT,

  -- Full JSON response for additional data
  raw_response JSONB,

  -- Timestamps
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_similarweb_domain ON seller_adsense.similarweb_analytics(domain);
CREATE INDEX IF NOT EXISTS idx_similarweb_seller_domain_id ON seller_adsense.similarweb_analytics(seller_domain_id);
CREATE INDEX IF NOT EXISTS idx_similarweb_fetched_at ON seller_adsense.similarweb_analytics(fetched_at DESC);
CREATE INDEX IF NOT EXISTS idx_similarweb_global_rank ON seller_adsense.similarweb_analytics(global_rank) WHERE global_rank IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_similarweb_category ON seller_adsense.similarweb_analytics(category) WHERE category IS NOT NULL;

-- Create GIN index for JSONB queries
CREATE INDEX IF NOT EXISTS idx_similarweb_raw_response ON seller_adsense.similarweb_analytics USING GIN(raw_response);

-- Add comment
COMMENT ON TABLE seller_adsense.similarweb_analytics IS 'Stores SimilarWeb analytics data for domains, including traffic metrics, rankings, and sources';
