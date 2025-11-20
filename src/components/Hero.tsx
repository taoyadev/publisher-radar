import Link from 'next/link';
import type { HomePageStats } from '@/lib/types';

interface HeroProps {
  stats: HomePageStats;
}

export default function Hero({ stats }: HeroProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}K`;
    }
    return num.toString();
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 rounded-2xl shadow-2xl mb-12">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative px-8 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 tracking-tight">
            AdSense Publisher Radar
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
            Explore {formatNumber(stats.total_publishers)}+ verified Google AdSense publishers
          </p>
          <p className="text-blue-200 mt-2 text-lg">
            Real-time Publisher ID reverse lookup • Domain verification • Traffic insights
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20">
            <div className="text-4xl font-bold text-white mb-2">
              {formatNumber(stats.total_publishers)}
            </div>
            <div className="text-blue-100 text-sm font-medium">Publishers</div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20">
            <div className="text-4xl font-bold text-white mb-2">
              {formatNumber(stats.total_domains)}
            </div>
            <div className="text-blue-100 text-sm font-medium">Domains</div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20">
            <div className="text-4xl font-bold text-white mb-2">
              {stats.recent_growth.new_last_7_days > 0 ? '+' : ''}
              {formatNumber(stats.recent_growth.new_last_7_days)}
            </div>
            <div className="text-blue-100 text-sm font-medium">New This Week</div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="flex items-center justify-center">
          <Link
            href="/publishers"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Browse All Publishers
          </Link>
        </div>

        {/* Update Info */}
        <div className="text-center mt-6">
          <p className="text-blue-200 text-sm">
            ✓ Updated daily at 2:00 AM • Data from Google sellers.json
          </p>
        </div>
      </div>
    </div>
  );
}
