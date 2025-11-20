#!/bin/bash

# Cleanup script for sellers.json files
# This script should be run after successful import to free up disk space

echo "🧹 Cleaning up sellers.json files..."
echo "=================================="

# Define cleanup locations
CLEANUP_PATHS=(
  "/tmp/sellers.json"                    # VPS temporary location
  "$HOME/sellers.json"                   # User home directory
  "$HOME/Downloads/sellers.json"         # Common download location
  "/var/tmp/sellers.json"                # Alternative temp location
)

DELETED_COUNT=0
NOT_FOUND_COUNT=0

# Check and delete each file
for filepath in "${CLEANUP_PATHS[@]}"; do
  if [ -f "$filepath" ]; then
    FILE_SIZE=$(du -h "$filepath" | cut -f1)
    echo "📁 Found: $filepath (Size: $FILE_SIZE)"

    if rm "$filepath"; then
      echo "✅ Deleted: $filepath"
      DELETED_COUNT=$((DELETED_COUNT + 1))
    else
      echo "❌ Failed to delete: $filepath"
    fi
  else
    echo "⏭️  Not found: $filepath"
    NOT_FOUND_COUNT=$((NOT_FOUND_COUNT + 1))
  fi
done

echo ""
echo "=================================="
echo "📊 Cleanup Summary:"
echo "   Deleted: $DELETED_COUNT files"
echo "   Not found: $NOT_FOUND_COUNT files"
echo "✨ Cleanup complete!"
