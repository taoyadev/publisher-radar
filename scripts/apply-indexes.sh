#!/bin/bash

# Apply database indexes for performance optimization
# Usage: ./scripts/apply-indexes.sh

set -e

echo "🚀 Applying database indexes..."
echo "================================"

# Load environment variables
if [ -f .env.local ]; then
  export $(cat .env.local | grep -v '^#' | xargs)
fi

# Apply indexes
PGPASSWORD=$DB_PASSWORD psql \
  -h $DB_HOST \
  -p ${DB_PORT:-5432} \
  -U $DB_USER \
  -d $DB_NAME \
  -f scripts/add-indexes.sql

echo ""
echo "✅ Indexes applied successfully!"
echo ""
echo "📊 Query performance should improve significantly for:"
echo "  - seller_id searches"
echo "  - domain searches"
echo "  - filtered searches (type + domain)"
echo "  - sorting operations"
echo ""
