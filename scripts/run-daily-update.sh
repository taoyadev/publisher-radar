#!/bin/bash

# Daily Update Script for Sellers.json
# This script should be run via cron daily

# Change to project directory
cd "$(dirname "$0")/.."

# Log file
LOG_FILE="logs/daily-update-$(date +%Y%m%d).log"
mkdir -p logs

# Ensure SSH tunnel is active
if ! ps aux | grep -q "[s]sh.*54322.*vps-supabase"; then
    echo "[$(date)] SSH tunnel not found, establishing..." >> "$LOG_FILE"
    ssh -f -N -L 54321:localhost:54321 -L 54322:localhost:54322 vps-supabase
    sleep 2
fi

# Run the TypeScript script
echo "[$(date)] Starting daily update..." >> "$LOG_FILE"
npx ts-node scripts/daily-update.ts >> "$LOG_FILE" 2>&1

# Check exit code
if [ $? -eq 0 ]; then
    echo "[$(date)] Daily update completed successfully" >> "$LOG_FILE"
else
    echo "[$(date)] Daily update failed" >> "$LOG_FILE"
    # Send notification (optional - implement your notification method)
    # echo "Daily update failed at $(date)" | mail -s "Sellers.json Update Failed" admin@example.com
fi
