#!/bin/bash
#
# Apply database constraint update for http-proxy support
# Run this script when database is accessible at localhost:54322
#

echo "🔄 Applying data_source constraint update..."
echo ""

PGPASSWORD=postgres psql -h localhost -p 54322 -U postgres -d postgres \
  -f "$(dirname "$0")/update-data-source-constraint.sql"

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Constraint updated successfully!"
  echo ""
  echo "New allowed data sources:"
  echo "  - vercel"
  echo "  - cloudflare"
  echo "  - http-proxy (NEW)"
  echo "  - vps-proxy"
  echo "  - local-proxy"
  echo "  - proxy (backward compatibility)"
else
  echo ""
  echo "❌ Failed to apply constraint update"
  echo "   Make sure database is accessible at localhost:54322"
  exit 1
fi
