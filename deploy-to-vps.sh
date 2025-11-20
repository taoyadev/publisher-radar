#!/bin/bash

# PublisherRadar VPS Deployment Script
# This script automates the deployment process to VPS

set -e  # Exit on any error

# Configuration
PROJECT_NAME="publisher-radar"
VPS_HOST="vps-supabase"
VPS_USER="administrator"
VPS_DIR="/home/administrator/publisher-radar"
LOCAL_DIR="/Volumes/SSD/dev/lens/adsense-data/PublisherRadar"
PORT="3007"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  PublisherRadar VPS Deployment${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Step 1: Sync files to VPS
echo -e "${YELLOW}📦 Step 1: Syncing files to VPS...${NC}"
rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude '.env' \
  --exclude '.env.local' \
  --exclude 'dist' \
  --exclude '.DS_Store' \
  --exclude '.git' \
  --exclude 'coverage' \
  --exclude '*.log' \
  --exclude 'sellers.json' \
  "$LOCAL_DIR/" "$VPS_HOST:$VPS_DIR/"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Files synced successfully${NC}"
else
    echo -e "${RED}❌ File sync failed${NC}"
    exit 1
fi

echo ""

# Step 2: Install dependencies and build
echo -e "${YELLOW}🔨 Step 2: Installing dependencies and building...${NC}"
ssh "$VPS_HOST" << 'ENDSSH'
    cd /home/administrator/publisher-radar

    # Install dependencies
    echo "Installing dependencies..."
    npm install

    # Build application
    echo "Building application..."
    NODE_ENV=production npm run build

    if [ $? -eq 0 ]; then
        echo "✅ Build completed successfully"
    else
        echo "❌ Build failed"
        exit 1
    fi
ENDSSH

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build completed successfully${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

echo ""

# Step 3: Restart PM2 application
echo -e "${YELLOW}🔄 Step 3: Restarting application...${NC}"
ssh "$VPS_HOST" << 'ENDSSH'
    cd /home/administrator/publisher-radar

    # Check if application is already running
    if pm2 list | grep -q "publisher-radar"; then
        echo "Restarting existing application..."
        pm2 restart publisher-radar
    else
        echo "Starting new application..."
        pm2 start ecosystem.config.js
        pm2 save
    fi

    # Wait for application to start
    sleep 3

    # Check status
    pm2 list | grep publisher-radar
ENDSSH

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Application restarted successfully${NC}"
else
    echo -e "${RED}❌ Application restart failed${NC}"
    exit 1
fi

echo ""

# Step 4: Verify deployment
echo -e "${YELLOW}✅ Step 4: Verifying deployment...${NC}"
ssh "$VPS_HOST" << 'ENDSSH'
    echo "Testing application health..."
    sleep 2

    # Test if application is responding
    if curl -s -f http://localhost:3007/ > /dev/null; then
        echo "✅ Application is responding on port 3007"
    else
        echo "⚠️  Application may not be responding correctly"
    fi

    # Show PM2 status
    echo ""
    echo "PM2 Status:"
    pm2 list | grep publisher-radar

    # Show recent logs
    echo ""
    echo "Recent logs:"
    pm2 logs publisher-radar --lines 10 --nostream
ENDSSH

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Deployment Complete!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "Application URL: ${BLUE}http://93.127.133.204:3007${NC}"
echo -e "PM2 Status: ${BLUE}ssh $VPS_HOST 'pm2 status'${NC}"
echo -e "View Logs: ${BLUE}ssh $VPS_HOST 'pm2 logs $PROJECT_NAME'${NC}"
echo -e "Restart: ${BLUE}ssh $VPS_HOST 'pm2 restart $PROJECT_NAME'${NC}"
echo ""
