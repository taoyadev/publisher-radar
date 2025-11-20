-- Migration: Update detection_source constraint and add first_detected index
-- Purpose: Support AdSense API integration and optimize /domain/new query
-- Date: 2025-01-19

-- Drop old constraint on seller_domains.detection_source
ALTER TABLE seller_adsense.seller_domains
DROP CONSTRAINT IF EXISTS seller_domains_detection_source_check;

-- Add new constraint with adsense_api and both
ALTER TABLE seller_adsense.seller_domains
ADD CONSTRAINT seller_domains_detection_source_check
CHECK (detection_source IN ('sellers_json', 'google_cse', 'bing', 'manual', 'adsense_api', 'both'));

-- Add index on first_detected for /domain/new page performance
CREATE INDEX IF NOT EXISTS idx_domains_first_detected ON seller_adsense.seller_domains(first_detected DESC);

-- Add comment
COMMENT ON INDEX seller_adsense.idx_domains_first_detected IS 'Index for /domain/new page sorting by first_detected';
