-- Update data_source constraint to include all proxy types
-- This allows tracking which data source was used for each fetch

-- Drop old constraint
ALTER TABLE seller_adsense.similarweb_analytics
DROP CONSTRAINT IF EXISTS similarweb_analytics_data_source_check;

-- Add new constraint with all source types
ALTER TABLE seller_adsense.similarweb_analytics
ADD CONSTRAINT similarweb_analytics_data_source_check
CHECK (data_source IN ('vercel', 'cloudflare', 'http-proxy', 'vps-proxy', 'local-proxy', 'proxy'));

-- Note: 'proxy' is kept for backward compatibility with existing data
