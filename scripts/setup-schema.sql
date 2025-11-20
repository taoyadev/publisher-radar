-- Create seller_adsense schema
CREATE SCHEMA IF NOT EXISTS seller_adsense;

-- Set search path
SET search_path TO seller_adsense, public;

-- Drop existing tables if they exist (for re-runs)
DROP TABLE IF EXISTS seller_adsense.seller_domains CASCADE;
DROP TABLE IF EXISTS seller_adsense.daily_snapshots CASCADE;
DROP TABLE IF EXISTS seller_adsense.sellers CASCADE;

-- Create sellers table
CREATE TABLE seller_adsense.sellers (
  seller_id TEXT PRIMARY KEY,
  first_seen_date DATE NOT NULL DEFAULT CURRENT_DATE,
  seller_type TEXT NOT NULL CHECK (seller_type IN ('PUBLISHER', 'BOTH')),
  is_confidential BOOLEAN DEFAULT false,
  name TEXT,
  domain TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create daily_snapshots table
CREATE TABLE seller_adsense.daily_snapshots (
  snapshot_date DATE PRIMARY KEY,
  total_count INTEGER NOT NULL,
  new_count INTEGER DEFAULT 0,
  removed_count INTEGER DEFAULT 0,
  new_sellers JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create seller_domains table (for reverse lookup)
CREATE TABLE seller_adsense.seller_domains (
  id BIGSERIAL PRIMARY KEY,
  seller_id TEXT NOT NULL REFERENCES seller_adsense.sellers(seller_id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  first_detected DATE DEFAULT CURRENT_DATE,
  detection_source TEXT CHECK (detection_source IN ('sellers_json', 'google_cse', 'bing', 'manual')),
  confidence_score FLOAT DEFAULT 1.0 CHECK (confidence_score >= 0 AND confidence_score <= 1),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(seller_id, domain)
);

-- Create indexes for performance
CREATE INDEX idx_sellers_first_seen ON seller_adsense.sellers(first_seen_date DESC);
CREATE INDEX idx_sellers_domain ON seller_adsense.sellers(domain) WHERE domain IS NOT NULL;
CREATE INDEX idx_sellers_name ON seller_adsense.sellers USING gin(to_tsvector('english', coalesce(name, ''))) WHERE name IS NOT NULL;
CREATE INDEX idx_sellers_type ON seller_adsense.sellers(seller_type);
CREATE INDEX idx_sellers_confidential ON seller_adsense.sellers(is_confidential);

CREATE INDEX idx_snapshots_date ON seller_adsense.daily_snapshots(snapshot_date DESC);
CREATE INDEX idx_snapshots_new_count ON seller_adsense.daily_snapshots(new_count DESC);

CREATE INDEX idx_domains_seller ON seller_adsense.seller_domains(seller_id);
CREATE INDEX idx_domains_domain ON seller_adsense.seller_domains(domain);
CREATE INDEX idx_domains_source ON seller_adsense.seller_domains(detection_source);

-- Enable Row Level Security
ALTER TABLE seller_adsense.sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_adsense.daily_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_adsense.seller_domains ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (public read access)
CREATE POLICY "Allow public read on sellers"
  ON seller_adsense.sellers
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public read on snapshots"
  ON seller_adsense.daily_snapshots
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public read on seller_domains"
  ON seller_adsense.seller_domains
  FOR SELECT
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION seller_adsense.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for sellers table
CREATE TRIGGER update_sellers_updated_at
  BEFORE UPDATE ON seller_adsense.sellers
  FOR EACH ROW
  EXECUTE FUNCTION seller_adsense.update_updated_at_column();

-- Grant permissions (adjust as needed for your setup)
GRANT USAGE ON SCHEMA seller_adsense TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA seller_adsense TO anon, authenticated;

COMMENT ON SCHEMA seller_adsense IS 'Google AdSense sellers.json monitoring system';
COMMENT ON TABLE seller_adsense.sellers IS 'Main table storing all AdSense publishers from sellers.json';
COMMENT ON TABLE seller_adsense.daily_snapshots IS 'Daily snapshots for tracking new additions';
COMMENT ON TABLE seller_adsense.seller_domains IS 'Reverse lookup results mapping sellers to domains';
