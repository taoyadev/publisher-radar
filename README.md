# Google AdSense Sellers.json Explorer

A comprehensive web application for exploring and searching Google's sellers.json data containing over 1 million publishers.

## 🎯 Features

- **🔍 Advanced Search**: Search by seller ID or domain with real-time filtering
- **📊 Statistics Dashboard**: View total sellers, publishers, and domain counts
- **🎯 Filtering**: Filter by seller type (PUBLISHER/BOTH) and domain status
- **📱 Responsive Design**: Mobile-friendly interface built with Tailwind CSS
- **⚡ Fast API**: 7 RESTful endpoints with pagination support
- **🗄️ PostgreSQL Database**: 1,026,101 sellers imported from official sellers.json
- **🔄 Daily Monitoring**: Automated daily updates with diff detection and historical tracking

## 📦 Project Structure

```
seller-json/
├── app/
│   ├── api/
│   │   ├── sellers/search/route.ts       # Search sellers endpoint
│   │   ├── sellers/[id]/route.ts         # Get single seller
│   │   ├── domains/search/route.ts       # Search domains
│   │   ├── snapshots/route.ts            # Daily snapshots endpoint
│   │   └── stats/route.ts                # Statistics endpoint
│   ├── page.tsx                          # Home page
│   ├── layout.tsx                        # Root layout
│   └── globals.css                       # Global styles
├── src/
│   ├── components/
│   │   ├── SearchInterface.tsx           # Main search UI
│   │   ├── StatsDisplay.tsx              # Statistics display
│   │   └── SellerCard.tsx                # Seller card component
│   └── lib/
│       ├── supabase.ts                   # Supabase client
│       ├── db.ts                         # PostgreSQL client
│       └── types.ts                      # TypeScript types
├── scripts/
│   ├── import-direct.py                  # Python import script
│   ├── import-vps.js                     # Node.js import script
│   ├── daily-update.ts                   # Daily monitoring script
│   └── run-daily-update.sh               # Cron wrapper script
├── logs/                                 # Daily update logs
├── crontab.example                       # Cron configuration
└── DAILY_MONITORING.md                   # Monitoring documentation
```

## 🗄️ Database Schema

### sellers table (seller_adsense schema)
- `seller_id` (PK) - Google AdSense publisher ID (e.g., pub-1234567890)
- `seller_type` - PUBLISHER or BOTH
- `is_confidential` - Boolean flag
- `domain` - Associated domain (nullable)
- `name` - Publisher name (nullable)
- `first_seen_date` - First appearance date
- `created_at`, `updated_at` - Timestamps

**Current Data**: 1,026,101 sellers (1,025,531 PUBLISHER + 570 BOTH)

### seller_domains table
- `id` (PK) - Auto-increment ID
- `seller_id` (FK) - References sellers table
- `domain` - Domain name
- `detection_source` - Source of detection (sellers_json, google_cse, bing, manual)
- `confidence_score` - Confidence level (0-1)
- `first_detected` - Detection date

**Current Data**: 146,779 seller-domain associations (142,431 unique domains)

### daily_snapshots table
- `id` (PK) - Auto-increment ID
- `snapshot_date` - Date of snapshot
- `total_count` - Total sellers count
- `new_count` - New sellers added
- `removed_count` - Sellers removed

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Access to VPS Supabase instance (via SSH)
- **SSH tunnel must be active** for database connection

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# 3. Establish SSH tunnel (REQUIRED - keep this running)
ssh -f -N -L 54321:localhost:54321 -L 54322:localhost:54322 vps-supabase

# 4. Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

**Important**: The SSH tunnel must be running for the application to access the database. If you see connection errors, verify the tunnel is active with:
```bash
ps aux | grep "ssh.*54322" | grep -v grep
```

## 📡 API Endpoints

### GET /api/stats
Get database statistics.

```json
{
  "data": {
    "total_sellers": 1026101,
    "publishers": 1025531,
    "both_type": 570,
    "with_domains": 146779,
    "unique_domains": 142431,
    "last_updated": "2025-10-15T04:00:00Z"
  }
}
```

### GET /api/sellers/search
Search sellers with pagination and filters.

**Query Parameters:**
- `query` - Search term (seller ID or domain)
- `seller_type` - PUBLISHER | BOTH
- `has_domain` - true | false
- `page` - Page number (default: 1)
- `limit` - Per page (max: 100, default: 50)
- `sort_by` - seller_id | first_seen_date | updated_at
- `sort_order` - asc | desc

```json
{
  "data": [...],
  "total": 1000,
  "page": 1,
  "limit": 50
}
```

### GET /api/sellers/[id]
Get seller details by ID.

### GET /api/sellers/[id]/domains
Get all domains for a seller.

### GET /api/domains/search
Search domains with seller counts.

### GET /api/domains/[domain]/sellers
Get all sellers for a domain.

### GET /api/snapshots
Query daily monitoring snapshots with historical tracking.

**Query Parameters:**
- `limit` - Number of records to return (default: 30, max: 100)
- `days` - Query last N days (default: 30)

```json
{
  "data": [{
    "snapshot_date": "2025-10-15",
    "total_count": 1026101,
    "new_count": 0,
    "removed_count": 0,
    "created_at": "2025-10-15T02:00:00Z"
  }],
  "summary": {
    "total_new": 0,
    "total_removed": 0,
    "avg_new_per_day": 0,
    "avg_removed_per_day": 0
  }
}
```

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL (Supabase on VPS)
- **Database Client**: pg (node-postgres)
- **Styling**: Tailwind CSS
- **API**: Next.js API Routes
- **Connection**: SSH Tunnel for secure VPS access

## 📊 Data Source

Data imported from Google's official sellers.json:
```
https://storage.googleapis.com/adx-rtb-dictionaries/sellers.json
```

File size: ~110MB
Last import: 2025-10-15

## ✅ Current Status

### ✨ Completed & Fully Functional
- ✅ Database schema design with seller_adsense schema
- ✅ Initial data import (1,026,101 sellers + 146,779 domains)
- ✅ RESTful API with 7 fully working endpoints
- ✅ Direct PostgreSQL connection via pg library
- ✅ Frontend search interface with real-time data
- ✅ Statistics dashboard showing live metrics
- ✅ Responsive design with Tailwind CSS
- ✅ SSH tunnel integration for secure database access

### Planned Enhancements
- 📋 Advanced analytics and visualizations
- 📋 Export functionality (CSV, JSON)
- 📋 Deployment to Vercel

## 🔧 Technical Implementation

**Database Connection**: The application uses direct PostgreSQL connection (via `pg` library) instead of Supabase REST API. This bypasses RLS limitations with custom schemas and provides better performance.

**Required Setup**: SSH tunnel to VPS Supabase instance must be active. The tunnel forwards ports 54321 (API) and 54322 (PostgreSQL) from the VPS to localhost.

## 📝 License

MIT

## 👤 Author

Built for seller.json exploration and analysis.
