/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from 'next';
import Link from 'next/link';
import { query } from '@/lib/db';
import { PublisherListItem } from '@/lib/types';
import PublisherSearchBox from '@/components/PublisherSearchBox';

// ============================================================================
// SSG/ISR CONFIGURATION
// ============================================================================

export const revalidate = 3600; // 1 hour

// ============================================================================
// METADATA
// ============================================================================

export const metadata: Metadata = {
  title: 'Top 100 AdSense Publishers by Domain Count | Complete Guide 2025',
  description: 'Explore the top 100 Google AdSense publishers ranked by verified domains. Learn how publishers make money, understand sellers.json transparency, and discover the $10B ecosystem with real industry data.',
  keywords: 'AdSense publishers, top publishers, publisher rankings, domain count, sellers.json, publisher directory, AdSense revenue, publisher networks, ad monetization, Google AdSense statistics, publisher transparency, digital advertising',
  openGraph: {
    title: 'Top 100 AdSense Publishers by Domain Count | Complete Guide 2025',
    description: 'Complete guide to top Google AdSense publishers with industry statistics, revenue insights, and sellers.json transparency data',
    type: 'website',
    url: '/publishers',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Top 100 AdSense Publishers | Industry Guide 2025',
    description: 'Discover top Google AdSense publishers, learn how they make money, and understand the $10B publisher ecosystem',
  },
  alternates: {
    canonical: '/publishers',
  },
};

// ============================================================================
// PAGE COMPONENT
// ============================================================================

export default async function TopPublishersPage() {
  const result = await query<PublisherListItem>(`
    SELECT *
    FROM seller_adsense.publisher_list_view
    WHERE domain_count > 0
    ORDER BY domain_count DESC, max_traffic DESC NULLS LAST, seller_id ASC
    LIMIT 100
  `);

  const publishers = result.rows;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Top Publishers</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🏆 Top 100 Publishers by Domain Count
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            The most influential AdSense publishers ranked by the number of verified domains they operate.
            These publishers manage extensive domain portfolios and represent major players in the advertising ecosystem.
          </p>
        </div>

        {/* Search by Name */}
        <PublisherSearchBox />

        {/* Stats Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
              <div className="text-sm text-gray-500 mb-1">Total Publishers</div>
              <div className="text-3xl font-bold text-gray-900">{publishers.length}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Total Domains</div>
              <div className="text-3xl font-bold text-blue-600">
                {publishers.reduce((sum, p) => sum + Number(p.domain_count || 0), 0).toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Avg Domains per Publisher</div>
              <div className="text-3xl font-bold text-green-600">
                {publishers.length > 0
                  ? Math.round(publishers.reduce((sum, p) => sum + Number(p.domain_count || 0), 0) / publishers.length).toLocaleString()
                  : '0'}
              </div>
            </div>
          </div>
        </div>

        {/* Educational Note */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8 rounded-r-lg">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">
            💡 Why Domain Count Matters
          </h2>
          <p className="text-blue-800 text-sm leading-relaxed">
            Publishers with high domain counts typically operate publisher networks, media companies, or ad tech platforms.
            A large domain portfolio often indicates established infrastructure, diverse traffic sources, and significant market presence.
            However, quality matters too—check the traffic data and confidence scores to verify legitimacy.
          </p>
        </div>

        {/* Publishers List */}
        <div className="space-y-4">
          {publishers.map((publisher, index) => (
            <Link
              key={publisher.seller_id}
              href={`/publisher/${publisher.seller_id}`}
              className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-all p-6 border border-gray-200 hover:border-blue-300"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Left side - Publisher info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl font-bold text-gray-400">
                      #{index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl font-semibold text-gray-900 truncate">
                        {publisher.name || publisher.seller_id}
                      </h2>
                      {publisher.name && (
                        <p className="text-sm text-gray-500 font-mono truncate">
                          {publisher.seller_id}
                        </p>
                      )}
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ml-2 whitespace-nowrap ${
                        publisher.seller_type === 'PUBLISHER'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {publisher.seller_type}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Domains</p>
                      <p className="text-lg font-bold text-blue-600">
                        {publisher.domain_count.toLocaleString()}
                      </p>
                    </div>
                    {publisher.max_traffic && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Max Traffic</p>
                        <p className="text-lg font-bold text-green-600">
                          {publisher.max_traffic.toLocaleString()}/mo
                        </p>
                      </div>
                    )}
                    {publisher.primary_domain && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Primary Domain</p>
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {publisher.primary_domain}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Educational Content Section */}
          <div className="mt-16 mb-12 prose prose-lg max-w-none">
          {/* Section 1: What Are Publishers? */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="text-4xl">🎯</span>
              What Are AdSense Publishers? (And Why You Should Care)
            </h2>

            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              Look, here's the thing—publishers are basically the people who own websites. That's it. But not just any websites.
              These are the folks who've figured out how to make money by letting Google show ads on their pages. Think of them
              like landlords, except instead of renting out apartments, they're renting out tiny rectangles of screen space to advertisers.
            </p>

            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              When you see an ad on a blog about cooking, or a news site about tech, or literally any website with those little
              "Ad" labels? That website owner is a publisher. They're in Google's AdSense program, which is basically Google saying:
              "Hey, you make cool content, we'll handle finding advertisers who want to reach your audience, and we'll split the money."
            </p>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 my-6 rounded-r-lg">
              <h3 className="text-xl font-semibold text-blue-900 mb-3">💰 The Money Part (Because That's What Everyone Really Wants to Know)</h3>
              <p className="text-blue-800 mb-4">
                Here's the breakdown, straight from the source:
              </p>
              <ul className="space-y-2 text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-1">•</span>
                  <span><strong>Publishers get 68%</strong> of the revenue for content ads (that's actually pretty generous)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-1">•</span>
                  <span><strong>Google pays out $10 billion</strong> annually to AdSense publishers worldwide</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-1">•</span>
                  <span><strong>Over 2 million publishers</strong> use AdSense (you're looking at the top 100 here)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-1">•</span>
                  <span><strong>50+ million live websites</strong> currently run Google AdSense</span>
                </li>
              </ul>
              <p className="text-sm text-blue-700 mt-4 italic">
                Source: <a href="https://www.demandsage.com/google-ads-statistics/" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-900">DemandSage 2025 Google Ads Statistics</a>,
                <a href="https://enlyft.com/tech/products/google-adsense" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-900 ml-1">Enlyft Market Research</a>
              </p>
            </div>
          </div>

          {/* Section 2: How This Actually Works */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="text-4xl">⚙️</span>
              How Does This Whole Thing Work?
            </h2>

            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              Okay, imagine you run a website about electric cars (good choice, by the way). You write awesome articles, people visit,
              but you're not selling anything. How do you make money? Enter Google AdSense.
            </p>

            <h3 className="text-2xl font-semibold text-gray-900 mb-4 mt-6">The Step-by-Step Process:</h3>

            <ol className="space-y-4 text-lg text-gray-700 mb-6">
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</span>
                <div>
                  <strong>You sign up for AdSense</strong> - Google reviews your site to make sure it's not spam or illegal stuff
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</span>
                <div>
                  <strong>You add some code to your website</strong> - Just copy-paste what Google gives you (it's like adding a widget)
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">3</span>
                <div>
                  <strong>Google's AI figures out what your page is about</strong> - Reading your content, understanding your audience
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">4</span>
                <div>
                  <strong>Advertisers bid in real-time</strong> - When someone visits your page, there's literally an auction happening in milliseconds
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">5</span>
                <div>
                  <strong>The winning ad shows up</strong> - Visitor sees the ad, maybe clicks it, you make money
                </div>
              </li>
            </ol>

            <p className="text-lg text-gray-700 leading-relaxed">
              The crazy part? This entire process—from your visitor loading the page to showing them a perfectly targeted ad—
              happens in about 100 milliseconds. That's faster than you can blink.
            </p>
          </div>

          {/* Section 3: The sellers.json Revolution */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="text-4xl">🔍</span>
              Why sellers.json Changes Everything
            </h2>

            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              For years, digital advertising was like the Wild West. Advertisers had no clue where their money was actually going.
              Was it going to real publishers with real audiences? Or to some shady middleman in a basement somewhere? Nobody knew.
            </p>

            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              Then the IAB Tech Lab (basically the nerds who set internet advertising standards) said: "Enough of this nonsense.
              We need transparency." So they created sellers.json—a public file where every publisher has to declare who they are.
            </p>

            <h3 className="text-2xl font-semibold text-gray-900 mb-4 mt-6">What sellers.json Actually Does:</h3>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-green-50 rounded-lg p-5 border border-green-200">
                <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                  <span className="text-xl">✅</span>
                  For Advertisers
                </h4>
                <ul className="space-y-2 text-green-800 text-sm">
                  <li>• Know exactly who's showing their ads</li>
                  <li>• Verify publishers are legitimate businesses</li>
                  <li>• Avoid ad fraud and fake traffic</li>
                  <li>• Make smarter spending decisions</li>
                </ul>
              </div>

              <div className="bg-purple-50 rounded-lg p-5 border border-purple-200">
                <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                  <span className="text-xl">✅</span>
                  For Publishers
                </h4>
                <ul className="space-y-2 text-purple-800 text-sm">
                  <li>• Build trust with advertisers</li>
                  <li>• Get access to premium ad campaigns</li>
                  <li>• Command higher ad rates</li>
                  <li>• Stand out from fraudulent sites</li>
                </ul>
              </div>
            </div>

            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              This directory you're looking at right now? It's powered by Google's sellers.json file. We pull it every single day
              from Google's CDN at <code className="bg-gray-100 px-2 py-1 rounded text-sm">https://storage.googleapis.com/adx-rtb-dictionaries/sellers.json</code>.
              That's over 1 million publishers, verified by Google, updated in real-time.
            </p>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 my-6 rounded-r-lg">
              <h4 className="font-semibold text-yellow-900 mb-2">🚨 Real Talk About Data Quality</h4>
              <p className="text-yellow-800 text-sm">
                Not every publisher fills out their information completely. Some keep their business domains hidden until Google verifies them.
                Others opt out of transparency entirely (which, honestly, is a red flag). When you're evaluating a publisher, look for:
              </p>
              <ul className="mt-3 space-y-1 text-yellow-800 text-sm">
                <li>✓ Complete seller information (name, domain, seller type)</li>
                <li>✓ High confidence scores on domain verification</li>
                <li>✓ Traffic data from third-party sources</li>
                <li>✓ Multiple verified domains (shows they're established)</li>
              </ul>
            </div>
          </div>

          {/* Section 4: Understanding the Numbers */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="text-4xl">📊</span>
              What the Domain Count Actually Tells You
            </h2>

            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              You might be wondering: "Why are we ranking publishers by domain count? Why not revenue or traffic?" Good question.
              Here's the thing—revenue and traffic data aren't always public. But domain count? That's verifiable through sellers.json.
            </p>

            <h3 className="text-2xl font-semibold text-gray-900 mb-4 mt-6">What High Domain Counts Mean:</h3>

            <div className="space-y-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-5">
                <h4 className="font-semibold text-gray-900 mb-2">🏢 Publisher Networks</h4>
                <p className="text-gray-700 text-sm">
                  Companies that own or manage dozens or hundreds of websites across different niches. Think media conglomerates,
                  news networks, or content farms. They've built an empire of sites, each monetized through AdSense.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-5">
                <h4 className="font-semibold text-gray-900 mb-2">🛠️ Ad Tech Platforms</h4>
                <p className="text-gray-700 text-sm">
                  These are the intermediaries—companies that help other publishers manage their ads. They're listed in sellers.json
                  as "INTERMEDIARY" instead of "PUBLISHER." They often have thousands of domains because they're representing other publishers.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-5">
                <h4 className="font-semibold text-gray-900 mb-2">📈 Growth Indicators</h4>
                <p className="text-gray-700 text-sm">
                  Publishers with growing domain portfolios are usually expanding their reach. They're testing new markets,
                  launching new properties, or acquiring competitors. It's like watching a business scale in real-time.
                </p>
              </div>
            </div>

            <p className="text-lg text-gray-700 leading-relaxed">
              But here's the catch: More domains ≠ Better publisher. A publisher with 5 high-quality, high-traffic sites
              might be way more valuable than someone with 500 low-traffic blogs. Always check the traffic data and confidence scores.
            </p>
          </div>

          {/* Section 5: The Big Picture */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-sm border border-blue-200 p-8 mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="text-4xl">🌍</span>
              The Billion-Dollar Ecosystem
            </h2>

            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Let's zoom out for a second. Google Ads—the entire platform that includes AdSense—generated
              <strong className="text-blue-600"> $264.5 billion</strong> in revenue in 2024. That's more than the GDP of many countries.
              And it's projected to hit <strong className="text-blue-600">$296 billion by end of 2025</strong>.
            </p>

            <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">The Money Flow:</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                  <span className="text-gray-700">Advertisers pay Google</span>
                  <span className="font-bold text-gray-900">$1.00</span>
                </div>
                <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                  <span className="text-gray-700">Google Ads takes (platform fee)</span>
                  <span className="font-bold text-red-600">-$0.15</span>
                </div>
                <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                  <span className="text-gray-700">AdSense takes (distribution fee)</span>
                  <span className="font-bold text-orange-600">-$0.17</span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-gray-900 font-semibold">Publisher receives</span>
                  <span className="font-bold text-green-600 text-xl">$0.68</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-4 italic">
                Source: <a href="https://www.searchenginejournal.com/adsense-publisher-payments/500160/" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">Search Engine Journal - AdSense Revenue Share</a>
              </p>
            </div>

            <p className="text-lg text-gray-700 leading-relaxed">
              The publishers on this page—the top 100—are managing a significant chunk of that $10 billion annual payout.
              They've mastered the game of creating content people want to read, optimizing for search engines, and maximizing ad revenue
              without annoying their visitors. That's not easy.
            </p>
          </div>

          {/* Section 6: How to Use This Directory */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="text-4xl">🎓</span>
              How to Actually Use This Information
            </h2>

            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Alright, so you've got access to this data. Now what? Here's how different people use this directory:
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="border border-gray-200 rounded-lg p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">🎯 Advertisers</h3>
                <p className="text-sm text-gray-700 mb-3">
                  Research potential publisher partners, verify their legitimacy, and discover new placement opportunities.
                </p>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>→ Check domain portfolios</li>
                  <li>→ Analyze traffic patterns</li>
                  <li>→ Verify seller information</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">📰 Publishers</h3>
                <p className="text-sm text-gray-700 mb-3">
                  Benchmark against competitors, discover market trends, and find inspiration for growing your own portfolio.
                </p>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>→ Compare domain counts</li>
                  <li>→ Study successful strategies</li>
                  <li>→ Identify market gaps</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">🔍 Researchers</h3>
                <p className="text-sm text-gray-700 mb-3">
                  Analyze the digital advertising ecosystem, track publisher growth, and study market concentration.
                </p>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>→ Market analysis</li>
                  <li>→ Trend identification</li>
                  <li>→ Industry insights</li>
                </ul>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
              <h3 className="text-xl font-semibold text-blue-900 mb-3">💡 Pro Tip from Someone Who's Looked at Way Too Much of This Data</h3>
              <p className="text-blue-800 mb-3">
                Don't just look at the top 10. The really interesting stuff is often in the 50-100 range—publishers who are
                growing fast but haven't hit mainstream yet. That's where you find the next big opportunities.
              </p>
              <p className="text-blue-800 text-sm">
                Also, pay attention to publishers with complete information and high confidence scores. Those are the pros.
                They understand that transparency = trust = better ad rates.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center bg-gray-100 border border-gray-300 rounded-xl p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Looking for a Specific Publisher?
          </h3>
          <p className="text-gray-600 mb-4">
            Use the search box above to find publishers by name, or search by Publisher ID on the homepage
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search by Publisher ID
          </Link>
        </div>
      </div>
    </main>
  );
}
