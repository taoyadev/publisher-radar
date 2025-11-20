export default function DirectoryGuide() {
  return (
    <section className="mb-12">
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-lg border border-blue-200 p-8 md:p-12">

        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
          How to Actually Use This Directory (Without Wasting Your Time)
        </h2>

        <p className="text-lg text-gray-800 mb-8 leading-relaxed">
          You're looking at over a million publishers. That's overwhelming. Here's how to cut through the noise and find exactly what you need. Whether you're vetting potential partners, hunting for advertising opportunities, or just doing competitive research, this guide will save you hours.
        </p>

        {/* Section 1: What You're Looking At */}
        <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-10">
          What You're Looking At: Live Data from Google's Sellers.json
        </h2>

        <p className="text-gray-800 mb-4 leading-relaxed">
          Every publisher you see here comes directly from Google's official sellers.json file. This isn't some scraped or outdated dataset—it's the real deal, updated every single day at 2:00 AM. We pull the file (about 110MB of JSON), parse it, and load it into our database. Then we enrich it with data from the AdSense API to fill in missing domains and traffic information.
        </p>

        <p className="text-gray-800 mb-6 leading-relaxed">
          Why does this matter? Because you're not looking at someone's opinion or estimate of who's a legitimate publisher. You're looking at Google's official registry. If they're in this database, Google has verified them as authorized sellers. That's your baseline trust level. Now it's your job to figure out which ones are worth your attention.
        </p>

        <div className="bg-white rounded-lg border-2 border-blue-300 p-6 mb-8">
          <h3 className="text-xl font-bold text-blue-900 mb-3 flex items-center gap-2">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Why "Updated Daily" Actually Matters
          </h3>
          <p className="text-gray-800 mb-3">
            Google adds and removes publishers from sellers.json constantly. A publisher might get suspended, change their domain setup, or join the network for the first time. If you're working with week-old data, you might be vetting a publisher who doesn't even exist anymore or missing opportunities that just appeared.
          </p>
          <p className="text-gray-800 font-semibold">
            Our daily sync means you're always looking at data that's less than 24 hours old. That's fresh enough for any business decision.
          </p>
        </div>

        {/* Section 2: The Three Sorting Options */}
        <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-10">
          The Three Sorting Options Explained
        </h2>

        <p className="text-gray-800 mb-6 leading-relaxed">
          We give you three ways to sort this directory because different use cases need different views. Here's when to use each one:
        </p>

        <div className="space-y-6 mb-8">
          {/* Traffic Sort */}
          <div className="bg-white rounded-lg border-l-4 border-green-600 p-6 shadow-sm">
            <div className="flex items-start gap-3 mb-3">
              <div className="bg-green-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">T</div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Sort by Traffic (Default)</h3>
                <p className="text-sm text-gray-600">Best for: Finding high-visibility publishers</p>
              </div>
            </div>
            <p className="text-gray-800 mb-3">
              This is your go-to sort if you want to work with publishers who have real, measurable audiences. We rank by monthly search traffic (when available), putting the biggest players first. The top 10% of publishers with traffic data are getting 1 million+ monthly visits. These are established, proven publishers.
            </p>
            <p className="text-gray-800 font-semibold">
              Use this when: You're looking for advertising partners with scale, want to analyze top competitors' strategies, or need proven publishers for client campaigns.
            </p>
          </div>

          {/* Domains Sort */}
          <div className="bg-white rounded-lg border-l-4 border-blue-600 p-6 shadow-sm">
            <div className="flex items-start gap-3 mb-3">
              <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">D</div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Sort by Domains</h3>
                <p className="text-sm text-gray-600">Best for: Finding multi-site networks</p>
              </div>
            </div>
            <p className="text-gray-800 mb-3">
              This shows publishers with the most domains first. High domain counts usually mean one of two things: (1) it's a media company operating multiple properties, or (2) it's an intermediary reselling inventory across many sites. Check their seller type to know which. Average domain count across all publishers is about 0.14, but active publishers typically have 1-5 domains.
            </p>
            <p className="text-gray-800 font-semibold">
              Use this when: You want to find publisher networks that can give you broad reach across multiple sites, or when researching how competitors structure their domain portfolios.
            </p>
          </div>

          {/* Recent Sort */}
          <div className="bg-white rounded-lg border-l-4 border-purple-600 p-6 shadow-sm">
            <div className="flex items-start gap-3 mb-3">
              <div className="bg-purple-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">R</div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Sort by Recent</h3>
                <p className="text-sm text-gray-600">Best for: Discovering new opportunities</p>
              </div>
            </div>
            <p className="text-gray-800 mb-3">
              This puts the newest publishers first based on when they first appeared in Google's sellers.json file. New doesn't mean bad—it often means opportunity. New publishers are typically more eager for partnerships and haven't been locked into exclusive deals yet. Plus, getting in early with a growing publisher can pay off big as they scale.
            </p>
            <p className="text-gray-800 font-semibold">
              Use this when: You're prospecting for untapped advertising opportunities, looking for emerging niches before they saturate, or want to establish relationships with publishers before they get expensive.
            </p>
          </div>
        </div>

        {/* Section 3: What the Numbers Actually Tell You */}
        <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-10">
          What the Numbers Actually Tell You
        </h2>

        <p className="text-gray-800 mb-6 leading-relaxed">
          Every publisher card shows key metrics. Here's how to read them and what they mean for your decisions:
        </p>

        <div className="overflow-x-auto mb-8">
          <table className="min-w-full bg-white border border-gray-300 rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-700 border-b">Metric</th>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-700 border-b">What It Means</th>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-700 border-b">How to Use It</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-3 text-sm font-semibold text-gray-900">Traffic Data</td>
                <td className="px-4 py-3 text-sm text-gray-700">Monthly search traffic from Keywords Everywhere/AdSense API</td>
                <td className="px-4 py-3 text-sm text-gray-700">100K+ = established, 1M+ = serious, 10M+ = elite</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-4 py-3 text-sm font-semibold text-gray-900">Domain Count</td>
                <td className="px-4 py-3 text-sm text-gray-700">Number of verified domains associated with this publisher</td>
                <td className="px-4 py-3 text-sm text-gray-700">1-5 = typical, 10-30 = media company, 50+ = network/intermediary</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-semibold text-gray-900">Seller Type</td>
                <td className="px-4 py-3 text-sm text-gray-700">PUBLISHER (owns sites) or BOTH (owns + resells)</td>
                <td className="px-4 py-3 text-sm text-gray-700">PUBLISHER = direct, BOTH = may include resold inventory</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-4 py-3 text-sm font-semibold text-gray-900">Confidence Score</td>
                <td className="px-4 py-3 text-sm text-gray-700">100% = double-verified, 95% = single source, N/A = no domains yet</td>
                <td className="px-4 py-3 text-sm text-gray-700">Look for 100% when fraud prevention matters most</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-semibold text-gray-900">First Seen Date</td>
                <td className="px-4 py-3 text-sm text-gray-700">When this publisher first appeared in sellers.json</td>
                <td className="px-4 py-3 text-sm text-gray-700">Recent = new opportunity, older = established track record</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 mb-8">
          <h3 className="text-lg font-bold text-yellow-900 mb-2 flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            The "N/A" Traffic Situation
          </h3>
          <p className="text-gray-800 mb-2">
            About 85% of publishers don't initially have traffic data. That's because traffic estimation relies on search volume, and not all sites generate measurable search traffic. Additionally, the Keywords Everywhere API has coverage limits.
          </p>
          <p className="text-gray-800 font-semibold">
            Don't automatically dismiss publishers with "N/A" traffic. They might be in niches that don't rely on search (social, direct, email traffic) or we simply haven't enriched their data yet. Click through to see if they have domains and other verification signals.
          </p>
        </div>

        {/* Section 4: Red Flags to Watch For */}
        <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-10">
          Red Flags to Watch For
        </h2>

        <p className="text-gray-800 mb-4 leading-relaxed">
          Not all publishers are created equal. Here are five warning signs to watch for when evaluating publishers in this directory:
        </p>

        <div className="bg-white rounded-lg border-2 border-red-300 p-6 mb-8">
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <div className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">1</div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">No Domains Listed Despite Being "Established"</p>
                <p className="text-gray-700 text-sm">If a publisher has been around for years but still has zero domains and zero traffic data, something's off. Either they're ultra-private (rare) or they're not actively publishing content.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">2</div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">Mismatched Domain-to-Traffic Ratios</p>
                <p className="text-gray-700 text-sm">If a publisher claims 50 domains but has minimal traffic across all of them, that's suspicious. Legitimate multi-domain publishers usually have at least some high-traffic properties.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">3</div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">Seller Type "BOTH" with Inconsistent Domains</p>
                <p className="text-gray-700 text-sm">If the seller type says "BOTH" and their domains are all over the place (totally unrelated niches, different languages, no coherent strategy), they're likely just reselling inventory without clear disclosure.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">4</div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">Low Confidence Scores (&lt;80%)</p>
                <p className="text-gray-700 text-sm">If domain confidence is below 80%, it means the association between the domain and publisher is weak or unverified. Proceed with caution—verify independently before committing budget.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">5</div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">Publisher Name Doesn't Match Domains</p>
                <p className="text-gray-700 text-sm">If the publisher name is "Tech News Network" but all their domains are about gardening and recipes, that mismatch suggests either outdated information or potential fraud.</p>
              </div>
            </li>
          </ul>
        </div>

        {/* Section 5: Smart Search Strategies */}
        <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-10">
          Smart Search Strategies for Advertisers
        </h2>

        <p className="text-gray-800 mb-4 leading-relaxed">
          Here's how to actually find what you need without clicking through 10,000 pages:
        </p>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-8 border border-blue-200">
          <h3 className="text-lg font-bold text-blue-900 mb-4">Strategy 1: Traffic Filtering for Quality</h3>
          <p className="text-gray-800 mb-3">
            Start at page 1 with traffic sorting enabled. The first 100 publishers (page 1) are the cream of the crop—highest traffic, most established. If you need proven partners fast, this is your shortcut. Don't waste time digging through pages 50-100 unless you're doing comprehensive market research.
          </p>

          <h3 className="text-lg font-bold text-blue-900 mb-4 mt-6">Strategy 2: Niche Hunting via TLD</h3>
          <p className="text-gray-800 mb-3">
            Use our TLD pages (/tld/com, /tld/org, /tld/blog, etc.) to filter by domain type. Different TLDs attract different publisher types. .com = established businesses, .blog = content creators, .org = nonprofits/communities, .io = tech startups. Match the TLD to your target audience.
          </p>

          <h3 className="text-lg font-bold text-blue-900 mb-4 mt-6">Strategy 3: New Opportunity Monitoring</h3>
          <p className="text-gray-800 mb-3">
            Check the recently added publishers section daily or weekly to see fresh publishers. Set a reminder. New publishers haven't been picked over by your competitors yet. You can often negotiate better rates and get priority placement. Early-bird advantage is real in ad partnerships.
          </p>

          <h3 className="text-lg font-bold text-blue-900 mb-4 mt-6">Strategy 4: Competitive Intelligence</h3>
          <p className="text-gray-800">
            See competitor ads somewhere? Grab the domain, search it here, find the publisher ID, see all their other domains. Now you know your competitor's entire placement network on that publisher. Repeat across multiple sightings to map their full strategy.
          </p>
        </div>

        {/* Section 6: Data Source & Verification */}
        <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-10">
          Data Source & Verification Methodology
        </h2>

        <p className="text-gray-800 mb-4 leading-relaxed">
          Transparency matters, so here's exactly where our data comes from and how we verify it:
        </p>

        <div className="bg-gray-100 rounded-lg p-6 mb-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Primary Source: Google Sellers.json</h3>
              <p className="text-gray-800 text-sm">
                We download Google's official sellers.json file daily from <code className="bg-gray-200 px-2 py-1 rounded text-xs">storage.googleapis.com/adx-rtb-dictionaries/sellers.json</code>. This file is published by Google under the IAB Tech Lab specification for supply chain transparency. It's the authoritative source.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Secondary Source: AdSense API</h3>
              <p className="text-gray-800 text-sm">
                We query Google's AdSense API for each publisher to enrich domain information. About 85% of publishers don't list domains in sellers.json, so this API fill-in is crucial. We make 100 requests per minute (rate limit) and process hundreds of thousands of publishers continuously.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Traffic Data: Keywords Everywhere API</h3>
              <p className="text-gray-800 text-sm">
                Traffic estimates come from Keywords Everywhere, which tracks search volume across millions of domains. Not all publishers have traffic data—coverage is limited to sites with measurable search traffic.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Update Frequency</h3>
              <p className="text-gray-800 text-sm">
                Daily at 2:00 AM for sellers.json. Continuous for AdSense API enrichment. You're always looking at data less than 24 hours old for the core publisher list, with ongoing domain enrichment happening in real-time.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl p-8 text-center">
          <p className="text-2xl font-bold mb-4">
            Bottom line: Use this directory like a power tool.
          </p>
          <p className="text-lg text-blue-100">
            Sort smart. Watch for red flags. Click through to verify. And always cross-reference multiple signals before committing your budget.
          </p>
        </div>
      </div>
    </section>
  );
}
