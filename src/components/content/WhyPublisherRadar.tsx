/* eslint-disable react/no-unescaped-entities */
import type { HomePageStats } from '@/lib/types';

interface WhyPublisherRadarProps {
  stats: HomePageStats;
}

export default function WhyPublisherRadar({ stats }: WhyPublisherRadarProps) {
  return (
    <section className="mb-16">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 md:p-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Why AdSense Publishers Matter to Your Marketing Strategy
        </h1>

        <p className="text-xl text-gray-700 mb-8 leading-relaxed">
          Look, here's the truth about AdSense publishers that nobody tells you. You're about to spend money advertising somewhere. Maybe a lot of money. You need to know who you're dealing with. That's where this gets interesting.
        </p>

        {/* Section 1 */}
        <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-12">
          What You're Actually Looking At: {(stats.total_publishers / 1000000).toFixed(1)}M+ Publishers Decoded
        </h2>

        <p className="text-lg text-gray-700 mb-4 leading-relaxed">
          Think of sellers.json like a phonebook for websites that show ads. Except instead of phone numbers, you get publisher IDs like "pub-1234567890". Google AdSense created this system because the advertising world had a massive problem: nobody knew who was actually selling ad space.
        </p>

        <p className="text-lg text-gray-700 mb-4 leading-relaxed">
          Before sellers.json existed, you could pay for ads on what you thought was Forbes.com, but your ads might actually appear on scammy-looking-forbes-news-dot-biz. That's fraud. And it was costing advertisers billions annually. The IAB Tech Lab (Internet Advertising Bureau) said enough is enough and created the sellers.json standard in 2019.
        </p>

        <p className="text-lg text-gray-700 mb-6 leading-relaxed">
          Now here's what we've done. We've taken Google's entire sellers.json file—which is a massive 110MB JSON file that updates daily—and turned it into something you can actually use. We're tracking <strong className="text-blue-600">{stats.total_publishers.toLocaleString()}</strong> publishers and <strong className="text-blue-600">{stats.total_domains.toLocaleString()}</strong> verified domains. Updated every single day at 2:00 AM. No manual parsing required.
        </p>

        <div className="bg-blue-50 border-l-4 border-blue-600 p-6 mb-8">
          <p className="text-lg font-semibold text-blue-900 mb-2">Here's what that means for you:</p>
          <ul className="space-y-2 text-gray-800">
            <li className="flex items-start gap-3">
              <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>You can verify any publisher ID in 2 seconds instead of digging through a giant JSON file</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>You get traffic data so you know which publishers actually matter</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>You can track new publishers daily and spot opportunities before your competitors</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>You see domain associations to catch fraud attempts instantly</span>
            </li>
          </ul>
        </div>

        {/* Section 2 */}
        <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-12">
          The Numbers That Actually Matter
        </h2>

        <p className="text-lg text-gray-700 mb-6 leading-relaxed">
          Let me break down what we're seeing in the data. This isn't theoretical—this is real intelligence from over a million publishers actively selling ad inventory right now.
        </p>

        <div className="overflow-x-auto mb-8">
          <table className="min-w-full bg-white border border-gray-300 rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-700 border-b">Traffic Tier</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-700 border-b">Monthly Visits</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-700 border-b">Publisher Count</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-700 border-b">What This Means</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">Elite Tier</td>
                <td className="px-6 py-4 text-sm text-green-600 font-semibold">10M+</td>
                <td className="px-6 py-4 text-sm text-gray-700">~100</td>
                <td className="px-6 py-4 text-sm text-gray-700">Major media properties - premium pricing</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">High Tier</td>
                <td className="px-6 py-4 text-sm text-green-600 font-semibold">1M-10M</td>
                <td className="px-6 py-4 text-sm text-gray-700">~1,000</td>
                <td className="px-6 py-4 text-sm text-gray-700">Established publishers - solid ROI potential</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">Mid Tier</td>
                <td className="px-6 py-4 text-sm text-blue-600 font-semibold">100K-1M</td>
                <td className="px-6 py-4 text-sm text-gray-700">~10,000</td>
                <td className="px-6 py-4 text-sm text-gray-700">Growing publishers - best value often here</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">Entry Tier</td>
                <td className="px-6 py-4 text-sm text-gray-600 font-semibold">10K-100K</td>
                <td className="px-6 py-4 text-sm text-gray-700">~50,000</td>
                <td className="px-6 py-4 text-sm text-gray-700">Small publishers - niche opportunities</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">Emerging</td>
                <td className="px-6 py-4 text-sm text-gray-600 font-semibold">&lt;10K</td>
                <td className="px-6 py-4 text-sm text-gray-700">~965,000</td>
                <td className="px-6 py-4 text-sm text-gray-700">New or micro publishers - high risk</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-lg text-gray-700 mb-6 leading-relaxed">
          Notice something? The vast majority of publishers are small. Really small. That's why traffic data matters so much. Without it, you're flying blind. We pull traffic estimates from Keywords Everywhere API and cross-reference with AdSense API data to give you the clearest picture possible.
        </p>

        <div className="bg-white border-2 border-gray-300 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Domain Distribution Insights</h3>
          <p className="text-gray-700 mb-4">
            Average domains per publisher: <strong className="text-blue-600">{stats.avg_domains_per_publisher.toFixed(1)}</strong>
          </p>
          <p className="text-gray-700 mb-4">
            New publishers this week: <strong className="text-green-600">+{stats.recent_growth.new_last_7_days}</strong>
          </p>
          <p className="text-gray-700">
            Publishers with verified domains: <strong className="text-purple-600">{stats.total_verified_domains.toLocaleString()}</strong>
          </p>
        </div>

        {/* Section 3 */}
        <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-12">
          How Smart Advertisers Use This Data
        </h2>

        <p className="text-lg text-gray-700 mb-6 leading-relaxed">
          Let me give you three real scenarios where this database saves your ass (and your budget).
        </p>

        <div className="space-y-6 mb-8">
          {/* Scenario 1 */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
            <h3 className="text-xl font-bold text-blue-900 mb-3 flex items-center gap-2">
              <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">1</span>
              Vetting Publishers Before Ad Partnerships
            </h3>
            <p className="text-gray-800 mb-3">
              You're considering a direct partnership with a publisher who claims 5 million monthly visitors. Sounds great, right? But before you write that check, you search their publisher ID here.
            </p>
            <p className="text-gray-800 mb-3">
              <strong>What you discover:</strong> They actually have 500K monthly visitors (not 5M), operate across 12 different domains (some questionable), and their seller type is "BOTH" meaning they're reselling inventory—not just their own content.
            </p>
            <p className="text-gray-800 font-semibold">
              Result: You just saved 90% on that partnership by negotiating with real numbers. Or you walked away entirely.
            </p>
          </div>

          {/* Scenario 2 */}
          <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-6">
            <h3 className="text-xl font-bold text-green-900 mb-3 flex items-center gap-2">
              <span className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">2</span>
              Competitive Intelligence on Competitor Placements
            </h3>
            <p className="text-gray-800 mb-3">
              Your competitor is getting amazing results from somewhere. You see their ads on a specific domain. You grab that domain, search it here, and boom—you see the publisher ID and every other domain that publisher operates.
            </p>
            <p className="text-gray-800 mb-3">
              <strong>What you discover:</strong> That publisher runs a network of 20 niche sites in your industry. Your competitor is buying across the whole network. You just found their entire placement strategy.
            </p>
            <p className="text-gray-800 font-semibold">
              Result: You can now approach that same publisher or identify similar networks to compete effectively.
            </p>
          </div>

          {/* Scenario 3 */}
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-6">
            <h3 className="text-xl font-bold text-purple-900 mb-3 flex items-center gap-2">
              <span className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">3</span>
              Fraud Detection - Domain Spoofing Identification
            </h3>
            <p className="text-gray-800 mb-3">
              You're seeing suspicious activity. Ads showing on domains that don't match the publisher name. So you search the publisher ID and check their verified domains list.
            </p>
            <p className="text-gray-800 mb-3">
              <strong>What you discover:</strong> The domains where your ads are appearing aren't associated with that publisher ID at all. Someone is spoofing the publisher. This is ad fraud in action.
            </p>
            <p className="text-gray-800 font-semibold">
              Result: You report it to Google, block those domains, and prevent thousands in wasted ad spend.
            </p>
          </div>
        </div>

        {/* Section 4 */}
        <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-12">
          Your Edge: Double-Verified Domains
        </h2>

        <p className="text-lg text-gray-700 mb-4 leading-relaxed">
          Here's where we go beyond just parsing Google's sellers.json file. We also pull data from the AdSense API. Why does this matter? Because we can double-verify domains.
        </p>

        <p className="text-lg text-gray-700 mb-4 leading-relaxed">
          When a domain appears in <em>both</em> the sellers.json file <em>and</em> the AdSense API, we mark it with 100% confidence. That's what we call "double verification". It means Google confirmed it twice through different systems. That's as solid as it gets.
        </p>

        <p className="text-lg text-gray-700 mb-6 leading-relaxed">
          When a domain only appears in one source, we still show it but with 95% confidence. Still reliable, just not double-confirmed. This transparency lets you make informed decisions about which publishers to trust with your ad budget.
        </p>

        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-orange-500 p-6 mb-8">
          <h3 className="text-xl font-bold text-orange-900 mb-3">The Coverage Problem (And How We're Solving It)</h3>
          <p className="text-gray-800 mb-3">
            Here's the reality: about 85% of publishers in sellers.json don't initially have domain information. They just have publisher IDs. That's a massive gap.
          </p>
          <p className="text-gray-800 mb-3">
            We're systematically enriching this data by querying the AdSense API for every publisher. It's a massive operation—we're talking about 880,000+ API calls at 100 requests per minute. This enrichment process runs continuously.
          </p>
          <p className="text-gray-800 font-semibold">
            Bottom line: Every day, more publishers get domain associations. The database gets smarter. Your intelligence gets better.
          </p>
        </div>

        <div className="bg-gray-100 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Confidence Scoring Methodology</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold flex-shrink-0">100%</div>
              <div>
                <p className="font-semibold text-gray-900">Double-Verified Domains</p>
                <p className="text-sm text-gray-700">Appears in both sellers.json and AdSense API - highest trust level</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold flex-shrink-0">95%</div>
              <div>
                <p className="font-semibold text-gray-900">Single-Source Verified</p>
                <p className="text-sm text-gray-700">Confirmed through AdSense API only - still reliable</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-gray-400 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold flex-shrink-0">N/A</div>
              <div>
                <p className="font-semibold text-gray-900">No Domain Data</p>
                <p className="text-sm text-gray-700">Publisher exists but domain information not yet available</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-lg text-gray-700 mb-4 leading-relaxed">
          This isn't just data for data's sake. This is actionable intelligence. You're making decisions about where to spend your advertising budget. Those decisions should be based on facts, not guesses. That's exactly what we built this for.
        </p>

        <p className="text-lg text-gray-700 mb-8 leading-relaxed">
          The advertising ecosystem is complex and sometimes deliberately opaque. Publishers don't always want you to know how many domains they operate or how much traffic they really get. Intermediaries don't always disclose their role. And fraudsters? They definitely don't want transparency.
        </p>

        <div className="bg-blue-600 text-white rounded-xl p-8 text-center">
          <p className="text-2xl font-bold mb-4">
            We're giving you the transparency that should've existed from the start.
          </p>
          <p className="text-lg text-blue-100">
            {stats.total_publishers.toLocaleString()} publishers • {stats.total_domains.toLocaleString()} domains • Updated daily • Free to use
          </p>
        </div>
      </div>
    </section>
  );
}
