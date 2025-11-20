#!/bin/bash

# Daily Automation Cron Job for Seller JSON Project
# This script should be run daily via cron

set -e  # Exit on error

# Change to project directory
cd "$(dirname "$0")/.."

# Load environment variables if .env.local exists
if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
fi

# Ensure SSH tunnel is active
echo "[$(date)] Checking SSH tunnel..."
if ! pgrep -f "ssh.*54322:localhost:54322.*vps-supabase" > /dev/null; then
    echo "[$(date)] Starting SSH tunnel..."
    ssh -f -N -L 54322:localhost:54322 vps-supabase
    sleep 2
fi

# Run daily automation
echo "[$(date)] Running daily automation..."
npm run automation:daily

echo "[$(date)] Daily automation completed successfully"
